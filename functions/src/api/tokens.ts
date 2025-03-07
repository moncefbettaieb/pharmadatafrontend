import { onCall, HttpsError } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import { randomBytes } from 'crypto'

export const generateToken = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {
  // Vérifier l'authentification
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  try {
    const db = admin.firestore()
    const userId = request.auth.uid

    // Générer un token aléatoire
    const token = randomBytes(32).toString('hex')

    // Créer un document pour le token
    const tokenDoc = await db.collection('api_tokens').add({
      userId,
      token,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUsed: null,
      isRevoked: false
    })

    // Mettre à jour le document utilisateur avec la référence du token
    await db.collection('users').doc(userId).update({
      currentTokenId: tokenDoc.id
    })

    return {
      token,
      id: tokenDoc.id
    }
  } catch (error) {
    console.error('Erreur lors de la génération du token:', error)
    throw new HttpsError('internal', 'Erreur lors de la génération du token')
  }
})

export const revokeToken = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {
  // Vérifier l'authentification
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  try {
    const db = admin.firestore()
    const userId = request.auth.uid

    // Récupérer l'utilisateur pour obtenir le token actuel
    const userDoc = await db.collection('users').doc(userId).get()
    const userData = userDoc.data()

    if (!userData?.currentTokenId) {
      throw new HttpsError('not-found', 'Aucun token actif trouvé')
    }

    // Révoquer le token
    await db.collection('api_tokens').doc(userData.currentTokenId).update({
      isRevoked: true,
      revokedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    // Supprimer la référence du token dans le document utilisateur
    await db.collection('users').doc(userId).update({
      currentTokenId: admin.firestore.FieldValue.delete()
    })

    return { success: true }
  } catch (error) {
    console.error('Erreur lors de la révocation du token:', error)
    throw new HttpsError('internal', 'Erreur lors de la révocation du token')
  }
})