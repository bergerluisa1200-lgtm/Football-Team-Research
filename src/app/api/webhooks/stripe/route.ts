import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getAdminDb } from "@/lib/firebase-admin";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.metadata?.firebaseUid;
        if (uid) {
          const updateData: Record<string, unknown> = {
            plan: "pro",
            stripeSubscriptionId: session.subscription as string,
            subscriptionStatus: "active",
            cancelAtPeriodEnd: false,
          };

          // Fetch subscription to get period end
          if (session.subscription) {
            const sub = await getStripe().subscriptions.retrieve(
              session.subscription as string
            );
            const periodEnd = (sub as unknown as { current_period_end: number })
              .current_period_end;
            updateData.currentPeriodEnd = new Date(
              periodEnd * 1000
            ).toISOString();
          }

          await getAdminDb().collection("users").doc(uid).update(updateData);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const usersSnap = await getAdminDb()
          .collection("users")
          .where("stripeCustomerId", "==", customerId)
          .limit(1)
          .get();

        if (!usersSnap.empty) {
          const userDoc = usersSnap.docs[0];
          const isActive =
            subscription.status === "active" ||
            subscription.status === "trialing";
          const updateFields: Record<string, unknown> = {
            plan: isActive ? "pro" : "free",
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          };
          // cancel_at holds the timestamp when the subscription will end
          if (subscription.cancel_at) {
            updateFields.currentPeriodEnd = new Date(
              subscription.cancel_at * 1000
            ).toISOString();
          }
          await userDoc.ref.update(updateFields);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const usersSnap = await getAdminDb()
          .collection("users")
          .where("stripeCustomerId", "==", customerId)
          .limit(1)
          .get();

        if (!usersSnap.empty) {
          const userDoc = usersSnap.docs[0];
          await userDoc.ref.update({
            plan: "free",
            stripeSubscriptionId: null,
            subscriptionStatus: "canceled",
            cancelAtPeriodEnd: false,
            currentPeriodEnd: null,
          });
        }
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
