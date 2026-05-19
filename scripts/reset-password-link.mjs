import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/reset-password-link.mjs <email>");
  process.exit(1);
}

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

try {
  const link = await getAuth().generatePasswordResetLink(email);
  console.log("\nPassword reset link for:", email);
  console.log("\n" + link + "\n");
  console.log("Open this in your browser to set a new password.");
} catch (err) {
  console.error("Failed:", err.message);
  process.exit(1);
}
