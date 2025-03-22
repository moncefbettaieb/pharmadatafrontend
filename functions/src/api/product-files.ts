import { onCall, HttpsError } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import * as PDFDocument from 'pdfkit'

interface Product {
  cip_code: string
  brand: string
  title: string
  source: string
  categorie: string
  sous_categorie_1: string
  sous_categorie_2: string
  sous_categorie_3: string
  combined_category: string
  short_desc: string
  long_desc: string
  age_minimum: string
  nombre_d_unites: string
  indication_contre_indication: string
  posologie: string
  composition: string
  contre_indication: string
  last_update: string
  categorie_id: number
  taxonomy_id: number
  taxonomy_name: string
  category: string
  sub_category1: string
  sub_category2: string
  sub_category3: string
  image_url?: string
  images?: string[]
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
        return productDoc.data() as Product
      })
    )

    // Générer les fichiers
    const files = await Promise.all(
      productsData.map(async (productData) => {
        const fileName = `${sessionId}/${productData.cip_code}.${format}`
        const file = bucket.file(fileName)
        const filteredProduct = Object.fromEntries(
          Object.entries(productData).filter(([_, value]) => value !== null && value !== undefined)
        )

        if (format === 'json') {
          // Générer JSON
          const jsonContent = JSON.stringify(filteredProduct, null, 2)
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
          doc.moveDown()
          if (productData.sub_category1) {
            doc.fontSize(12).text('Sous-catégorie 1:', { underline: true })
            doc.text(productData.sub_category1)
            doc.moveDown()
          }
          if (productData.sub_category2) {
            doc.fontSize(12).text('Sous-catégorie 2:', { underline: true })
            doc.text(productData.sub_category1)
            doc.moveDown()
          }
          if (productData.sub_category3) {
            doc.fontSize(12).text('Sous-catégorie 3:', { underline: true })
            doc.text(productData.sub_category1)
            doc.moveDown()
          }
          if (productData.short_desc) {
            doc.fontSize(12).text('Description courte:', { underline: true })
            doc.text(productData.short_desc)
            doc.moveDown()
          }
          if (productData.long_desc) {
            doc.fontSize(12).text('Description détaillée:', { underline: true })
            doc.text(productData.long_desc)
            doc.moveDown()
          }
          if (productData.composition) {
            doc.fontSize(12).text('Composition:', { underline: true })
            doc.text(productData.composition)
            doc.moveDown()
          }

          if (productData.posologie) {
            doc.fontSize(12).text('Posologie:', { underline: true })
            doc.text(productData.posologie)
            doc.moveDown()
          }

          if (productData.indication_contre_indication) {
            doc.fontSize(12).text('Indications et Contre-indications:', { underline: true })
            doc.text(productData.indication_contre_indication)
            doc.moveDown()
          }

          if (productData.contre_indication) {
            doc.fontSize(12).text('Contre-indications:', { underline: true })
            doc.text(productData.contre_indication)
            doc.moveDown()
          }

          // Informations complémentaires
          if (productData.age_minimum) {
            doc.text(`Âge minimum: ${productData.age_minimum}`)
          }

          if (productData.nombre_d_unites) {
            doc.text(`Nombre d'unités: ${productData.nombre_d_unites}`)
          }
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