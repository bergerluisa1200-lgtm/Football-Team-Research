# PitchLab

Football training app with interactive pitch diagrams, drill library, session builder, weekly planner, and training log.

Built with Next.js, Firebase, and Stripe.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

You need credentials from:
- **Firebase** — client config + admin service account
- **Stripe** — API keys, webhook secret, and a recurring price ID

See sections below for details.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** with Email/Password provider
3. Create a **Firestore Database** in production mode
4. Set Firestore security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /{subcollection}/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

5. Get client config from **Project Settings > General > Your apps** (web app)
6. Get admin credentials from **Project Settings > Service accounts > Generate new private key**

## Stripe Setup

### API Keys

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) > **Developers > API Keys**
2. Copy the **Publishable key** (`pk_test_...`) and **Secret key** (`sk_test_...`)

### Create a Pro Plan

1. Go to **Product catalog > Add product**
2. Name: "PitchLab Pro"
3. Add a **Recurring** price (e.g. $9.99/month)
4. Copy the **Price ID** (`price_...`) into `STRIPE_PRO_PRICE_ID`

### Enable Customer Portal

1. Go to **Settings > Billing > Customer portal**
2. Enable it and allow cancel/update payment
3. Save

### Webhooks (Local Development)

1. Install the Stripe CLI:

```bash
brew install stripe/stripe-cli/stripe
```

2. Log in:

```bash
stripe login
```

3. Forward webhooks to your local server:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

4. Copy the webhook signing secret (`whsec_...`) into `STRIPE_WEBHOOK_SECRET` in `.env.local`

**Keep `stripe listen` running** in a separate terminal while developing. It must be active to receive webhook events (checkout completed, subscription updated/canceled).

### Webhooks (Production / Vercel)

1. In Stripe dashboard, go to **Developers > Webhooks > Add endpoint**
2. Set the URL to `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the signing secret into your Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

## Deploy on Vercel

1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.local` to **Project Settings > Environment Variables**
4. Set `NEXT_PUBLIC_APP_URL` to your production domain
5. For `FIREBASE_ADMIN_PRIVATE_KEY`, paste the raw key without extra quotes
6. Create a production Stripe webhook endpoint (see above)
7. When ready for real payments, switch Stripe to live mode and update the API keys + price ID
