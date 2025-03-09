import { onCall, HttpsError } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import * as PDFDocument from 'pdfkit'

interface ProductData {
  id: string
  title: string
  description: string
  brand: string
  category: string
  sub_category1: string
  sub_category2: string
  cip_code: string
  [key: string]: any
}

export const getProductFiles = onCall({
  region: 'europe-west9',
  cors: [
    'https://pharmadata-frontend-staging-383194447870.europe-west9.run.app',
    'http://localhost:3000',
    '*'
  ],
  maxInstances: 10,
  timeoutSeconds: 300,
  memory: '256MiB',
  minInstances: 0,
  ingressSettings: 'ALLOW_ALL'
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  const { sessionId, format = 'pdf' } = request.data
  if (!sessionId) {
    throw new HttpsError('invalid-argument', 'ID de session requis')
  }

  if (!['pdf', 'json'].includes(format)) {
    throw new HttpsError('invalid-argument', 'Format invalide. Utilisez "pdf" ou "json"')
  }

  try {
    const db = admin.firestore()
    const storage = admin.storage()
    const bucket = storage.bucket()

    // Vérifier la session de paiement
    const sessionDoc = await db.collection('product_payment_sessions').doc(sessionId).get()
    if (!sessionDoc.exists) {
      throw new HttpsError('not-found', 'Session de paiement non trouvée')
    }

    const sessionData = sessionDoc.data()
    if (sessionData?.userId !== request.auth.uid) {
      throw new HttpsError('permission-denied', 'Accès non autorisé à cette session')
    }

    if (sessionData?.status !== 'completed') {
      throw new HttpsError('failed-precondition', 'Le paiement n\'est pas encore complété')
    }

    // Récupérer les données des produits
    const productIds = sessionData.items.map((item: any) => item.productId)
    const productsData = await Promise.all(
      productIds.map(async (productId: string) => {
        const productDoc = await db.collection('products').doc(productId).get()
        if (!productDoc.exists) {
          throw new HttpsError('not-found', `Produit non trouvé: ${productId}`)
        }
        const data = productDoc.data() as Omit<ProductData, 'id'>
        return { id: productId, ...data } as ProductData
      })
    )

    // Générer les fichiers selon le format demandé
    const files = await Promise.all(
      productsData.map(async (productData) => {
        const fileName = `${sessionId}/${productData.cip_code}.${format}`
        const file = bucket.file(fileName)

        if (format === 'json') {
          // Générer le fichier JSON
          const jsonContent = JSON.stringify(productData, null, 2)
          await file.save(jsonContent, {
            contentType: 'application/json',
            metadata: {
              contentDisposition: `attachment; filename="${productData.cip_code}.json"`
            }
          })
        } else {
          // Générer le PDF
          const doc = new PDFDocument()
          const chunks: Buffer[] = []

          doc.on('data', (chunk: Buffer) => chunks.push(chunk))
          doc.on('end', async () => {
            const pdfBuffer = Buffer.concat(chunks)
            await file.save(pdfBuffer, {
              contentType: 'application/pdf',
              metadata: {
                contentDisposition: `attachment; filename="${productData.cip_code}.pdf"`
              }
            })
          })

          // Ajouter le contenu au PDF
          doc.fontSize(20).text('Fiche Produit', { align: 'center' })
          doc.moveDown()
          doc.fontSize(14).text(`CIP: ${productData.cip_code}`)
          doc.fontSize(16).text(productData.title)
          doc.moveDown()
          doc.fontSize(12).text(`Marque: ${productData.brand}`)
          doc.text(`Catégorie: ${productData.category}`)
          doc.text(`Sous-catégorie 1: ${productData.sub_category1}`)
          doc.text(`Sous-catégorie 2: ${productData.sub_category2}`)
          doc.moveDown()
          doc.text(productData.description || '')
          doc.end()
        }

        // Générer une URL signée pour le téléchargement
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 24 * 60 * 60 * 1000 // 24 heures
        })

        return url
      })
    )

    // Mettre à jour le statut des fichiers
    await Promise.all(
      productIds.map(async (productId: string) => {
        const fileDoc = await db.collection('product_files')
          .where('sessionId', '==', sessionId)
          .where('productId', '==', productId)
          .limit(1)
          .get()

        if (!fileDoc.empty) {
          await fileDoc.docs[0].ref.update({
            status: 'completed',
            format,
            downloadUrl: files[productIds.indexOf(productId)],
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          })
        }
      })
    )

    return { files }
  } catch (error) {
    console.error('Erreur lors de la génération des fichiers:', error)
    throw new HttpsError('internal', 'Erreur lors de la génération des fichiers')
  }
})