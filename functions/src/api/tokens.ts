import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { randomBytes } from "crypto";

export const generateToken = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "L'utilisateur doit être authentifié"
    );
  }
  try {
    const db = admin.firestore();
    const userId = request.auth.uid;

    // Vérifier si l'utilisateur a déjà un token actif
    const activeTokenSnapshot = await db
      .collection("api_tokens")
      .where("userId", "==", userId)
      .where("isRevoked", "==", false)
      .limit(1)
      .get();

    // Si un token actif existe, le retourner
    if (!activeTokenSnapshot.empty) {
      const activeToken = activeTokenSnapshot.docs[0];
      return { 
        token: activeToken.data().token, 
        id: activeToken.id 
      };
    }

    // Sinon, générer un nouveau token
    const token = randomBytes(32).toString("hex");

    // Créer un document pour le token
    const tokenDoc = await db.collection("api_tokens").add({
      userId,
      token,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUsed: null,
      isRevoked: false,
    });

    // Mettre à jour le document utilisateur avec la référence du token
    await db.collection("users").doc(userId).update({
      currentTokenId: tokenDoc.id,
    });

    await db.collection("notifications").add({
      userId: userId,
      title: "Generation de token",
      type: "info",
      read: "false",
      message: "Token généré avec succès",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { token, id: tokenDoc.id };
  } catch (error) {
    console.error("Erreur lors de la génération du token:", error);
    throw new HttpsError("internal", "Erreur lors de la génération du token");
  }
});

export const revokeToken = onCall(
  {
    region: "europe-west9",
    maxInstances: 10,
  },
  async (request) => {
    // Vérifier l'authentification
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "L'utilisateur doit être authentifié"
      );
    }

    try {
      const db = admin.firestore();
      const userId = request.auth.uid;

      // Récupérer l'utilisateur pour obtenir le token actuel
      const userDoc = await db.collection("users").doc(userId).get();
      const userData = userDoc.data();

      if (!userData?.currentTokenId) {
        throw new HttpsError("not-found", "Aucun token actif trouvé");
      }

      // Révoquer le token
      await db.collection("api_tokens").doc(userData.currentTokenId).update({
        isRevoked: true,
        revokedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Supprimer la référence du token dans le document utilisateur
      await db.collection("users").doc(userId).update({
        currentTokenId: admin.firestore.FieldValue.delete(),
      });

      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la révocation du token:", error);
      throw new HttpsError("internal", "Erreur lors de la révocation du token");
    }
  }
);

export const getTokenHistory = onCall(
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

      // Récupérer tous les tokens de l'utilisateur
      const tokensSnapshot = await db
        .collection("api_tokens")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();

      const tokens = tokensSnapshot.docs.map((doc) => ({
        id: doc.id,
        createdAt: doc.data().createdAt.toDate().toISOString(),
        lastUsed: doc.data().lastUsed
          ? doc.data().lastUsed.toDate().toISOString()
          : null,
        revokedAt: doc.data().revokedAt
          ? doc.data().revokedAt.toDate().toISOString()
          : null,
        isRevoked: doc.data().isRevoked,
      }));

      return tokens;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'historique des tokens:",
        error
      );
      throw new HttpsError(
        "internal",
        "Erreur lors de la récupération de l'historique des tokens"
      );
    }
  }
);

export const getToken = onCall(
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

      // Récupérer tous les tokens de l'utilisateur
      const tokenSnapshot = await db
        .collection("api_tokens")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      const token = tokenSnapshot.docs.map((doc) => ({
        id: doc.id,
        createdAt: doc.data().createdAt.toDate().toISOString(),
        lastUsed: doc.data().lastUsed
          ? doc.data().lastUsed.toDate().toISOString()
          : null,
        revokedAt: doc.data().revokedAt
          ? doc.data().revokedAt.toDate().toISOString()
          : null,
        isRevoked: doc.data().isRevoked,
      }));
      if (token.length === 0) {
        throw new HttpsError("not-found", "Aucun token trouvé");
      }
      return token;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'historique des tokens:",
        error
      );
      throw new HttpsError(
        "internal",
        "Erreur lors de la récupération de l'historique des tokens"
      );
    }
  }
);
