import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

// Lire PRICE_MAP depuis les variables d'environnement
// Map des IDs de plans vers les IDs de prix Stripe
const PRICE_MAP: { [key: string]: { monthly: string; annual: string } } = {
  basic: {
    monthly: "price_1RJNatIXSD1y6wP4M6ExpaC5",
    annual: "price_1RJNatIXSD1y6wP4k3x96Yxz",
  },
  pro: {
    monthly: "price_1RJNaqIXSD1y6wP4cegd5Uex",
    annual: "price_1RJNaqIXSD1y6wP4neO2jL0j",
  },
  enterprise: {
    monthly: "price_1RJNanIXSD1y6wP48KmWNped",
    annual: "price_1RJNanIXSD1y6wP493vf5ddV",
  },
};
const LIFETIME_PRICE_ID = "price_1RJNajIXSD1y6wP4wieZXGpo";

export const createSubscription = onCall(
  {
    region: "europe-west9",
    cors: [
      "https://pharmadata-frontend-staging-383194447870.europe-west9.run.app",
      "http://localhost:3000",
      "https://pharmadataapi.fr",
      "https://www.pharmadataapi.fr",
    ],
    maxInstances: 10,
    memory: "256MiB",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "L'utilisateur doit être authentifié"
      );
    }

    const { priceId, requestsLimit, isAnnual, successUrl, cancelUrl } =
      request.data;

    if (!priceId || !requestsLimit || !successUrl || !cancelUrl) {
      throw new HttpsError("invalid-argument", "Paramètres manquants");
    }
    try {
      const stripePriceId = isAnnual
        ? PRICE_MAP[priceId].annual
        : PRICE_MAP[priceId].monthly;
      if (!stripePriceId) {
        throw new HttpsError("invalid-argument", "Plan invalide");
      }

      const db = admin.firestore();

      let customer;
      const userRef = db.collection("users").doc(request.auth.uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        await userRef.set({
          email: request.auth.token.email,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      const userData = userDoc.data() || {};

      if (userData.stripeCustomerId) {
        customer = await stripe.customers.retrieve(userData.stripeCustomerId);
      } else {
        customer = await stripe.customers.create({
          email: request.auth.token.email,
          metadata: {
            userId: request.auth.uid,
          },
        });

        await userRef.update({
          stripeCustomerId: customer.id,
        });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price: stripePriceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: request.auth.uid,
          priceId,
          requestsLimit,
          isAnnual: isAnnual.toString(),
        },
      });

      return { sessionId: session.id };
    } catch (error) {
      console.error("Erreur lors de la création de la session:", error);
      throw new HttpsError(
        "internal",
        "Erreur lors de la création de la session de paiement"
      );
    }
  }
);

export const createLifetimeSession = onCall(
  {
    region: "europe-west9",
    cors: [
      "https://pharmadata-frontend-staging-383194447870.europe-west9.run.app",
      "http://localhost:3000",
      "https://pharmadataapi.fr",
      "https://www.pharmadataapi.fr",
    ],
    maxInstances: 10,
    memory: "256MiB",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "L'utilisateur doit être authentifié"
      );
    }

    const { successUrl, cancelUrl } = request.data;

    if (!successUrl || !cancelUrl) {
      throw new HttpsError("invalid-argument", "Paramètres manquants");
    }

    try {
      const db = admin.firestore();

      let customer;
      const userRef = db.collection("users").doc(request.auth.uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        await userRef.set({
          email: request.auth.token.email,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      const userData = userDoc.data() || {};

      if (userData.stripeCustomerId) {
        customer = await stripe.customers.retrieve(userData.stripeCustomerId);
      } else {
        customer = await stripe.customers.create({
          email: request.auth.token.email,
          metadata: {
            userId: request.auth.uid,
          },
        });

        await userRef.update({
          stripeCustomerId: customer.id,
        });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price: LIFETIME_PRICE_ID,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: request.auth.uid,
          isLifetime: "true",
        },
      });

      return { sessionId: session.id };
    } catch (error) {
      console.error(
        "Erreur lors de la création de la session lifetime:",
        error
      );
      throw new HttpsError(
        "internal",
        "Erreur lors de la création de la session de paiement"
      );
    }
  }
);
