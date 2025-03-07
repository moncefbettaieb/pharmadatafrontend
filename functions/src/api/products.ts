import { onCall, HttpsError } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'

export const getProducts = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {
  try {
    const db = admin.firestore()
    
    // Récupérer tous les produits actifs
    const productsSnapshot = await db.collection('products')
      .where('active', '==', true)
      .orderBy('name')
      .get()

    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Assurer que le prix est un nombre
      price: parseFloat(doc.data().price || 0)
    }))

    return products
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error)
    throw new HttpsError('internal', 'Erreur lors de la récupération des produits')
  }
})