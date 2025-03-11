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
    'http://localhost:3000'
  ],
  maxInstances: 10,
  invoker: 'public', // Permettre l'accès public
  timeoutSeconds: 60,
  memory: '256MiB'
}, async (request) => {
  // Vérifier l'authentification Firebase
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
    
    // Vérifier que l'utilisateur est bien le propriétaire de la session
    if (sessionData?.userId !== request.auth.uid) {
      throw new HttpsError('permission-denied', 'Accès non autorisé à cette session')
    }

    // Vérifier que le paiement est bien complété
    if (sessionData?.status !== 'completed') {
      throw new HttpsError('failed-precondition', 'Le paiement n\'est pas encore complété')
    }

    // Récupérer les données des produits
    const productIds = sessionData.items.map((item: any) => item.productId)
    const productsData = await Promise.all(
      productIds.map(async (productId: string) => {
        const productDoc = await db.collection('final_pharma_table').doc(productId).get()
        if (!productDoc.exists) {
          throw new HttpsError('not-found', `Produit non trouvé: ${productId}`)
        }
        return { id: productId, ...productDoc.data() } as ProductData
      })
    )

    // Générer les fichiers
    const files = await Promise.all(
      productsData.map(async (productData) => {
        const fileName = `${sessionId}/${productData.cip_code}.${format}`
        const file = bucket.file(fileName)

        if (format === 'json') {
          // Générer JSON
          const jsonContent = JSON.stringify(productData, null, 2)
          await file.save(jsonContent, {
            contentType: 'application/json',
            metadata: {
              contentDisposition: `attachment; filename="${productData.cip_code}.json"`
            }
          })
        } else {
          // Générer PDF
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

          // Contenu du PDF
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

        // Générer URL signée
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 24 * 60 * 60 * 1000 // 24 heures
        })

        return url
      })
    )

    return { files }
  } catch (error) {
    console.error('Erreur lors de la génération des fichiers:', error)
    throw new HttpsError('internal', 'Erreur lors de la génération des fichiers')
  }
})