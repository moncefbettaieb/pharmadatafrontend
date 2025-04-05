import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const getApiUsage = onCall(
  {
    region: "europe-west9",
    maxInstances: 10,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "L'utilisateur doit être authentifié"
      );
    }

    try {
      const db = admin.firestore();
      const userId = request.auth.uid;

      // 1) Récupérer le document utilisateur pour trouver l'ID d'abonnement
      const userDoc = await db.collection("users").doc(userId).get();
      const userData = userDoc.data();

      // Si pas d'abonnement, renvoyer un plan basique
      if (!userData?.subscriptionId) {
        return {
          currentPlan: {
            name: "Gratuit",
            requestsPerMonth: 100,
            remainingRequests: 100,
          },
          // usage contiendra la liste des 10 dernières requêtes
          usage: [],
        };
      }

      // 2) Récupérer les détails du plan (nombre de requêtes mensuelles, etc.)
      const subscriptionDoc = await db
        .collection("subscriptions")
        .doc(userData.subscriptionId)
        .get();
      const subscriptionData = subscriptionDoc.data();

      if (!subscriptionData) {
        throw new HttpsError("not-found", "Abonnement non trouvé");
      }

      // 3) Récupérer l’historique des 10 dernières requêtes réussies (success = true)
      const lastTenQuery = await db
        .collection("api_usage")
        .where("userId", "==", userId)
        .orderBy("timestamp", "desc")
        .limit(10)
        .get();

      // Reformater pour retourner ce qui vous intéresse
      const usageHistory = lastTenQuery.docs.map((doc) => {
        const data = doc.data();
        return {
          date: data.timestamp?.toDate()?.toISOString(),
          endpoint: data.endpoint || "inconnu",
          status: data.success ? "success" : "failed",
        };
      });

      // 4) Calculer le total de requêtes effectuées ce mois-ci pour vérifier la limite mensuelle
      const subscriptionStart = subscriptionData.currentPeriodStart.toDate();
      const subscriptionEnd = subscriptionData.currentPeriodEnd.toDate();
      const now = new Date();

      // Vérification de la validité de l'abonnement
      if (now < subscriptionStart || now > subscriptionEnd) {
        throw new HttpsError(
          "failed-precondition",
          "Abonnement expiré ou invalide"
        );
      }

      // Requêtes utilisées pendant la période d'abonnement
      const usageInPeriod = await db
        .collection("api_usage")
        .where("userId", "==", userId)
        .where("timestamp", ">=", subscriptionStart)
        .where("timestamp", "<=", subscriptionEnd)
        .where("success", "==", true)
        .get();

      const totalUsed = usageInPeriod.docs.reduce(
        (acc, doc) => acc + (doc.data().requests || 1),
        0
      );
      const remainingRequests = Math.max(
        0,
        subscriptionData.requestsPerMonth - totalUsed
      );

      // Retourner la réponse
      return {
        currentPlan: {
          name: subscriptionData.planId,
          requestsPerMonth: subscriptionData.requestsPerMonth,
          remainingRequests,
          periodStart: subscriptionStart.toISOString(),
          periodEnd: subscriptionEnd.toISOString(),
        },
        usage: usageHistory,
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      throw new HttpsError(
        "internal",
        "Erreur lors de la récupération des statistiques"
      );
    }
  }
);
