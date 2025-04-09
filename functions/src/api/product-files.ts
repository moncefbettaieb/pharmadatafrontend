import { onCall, HttpsError } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import * as PDFDocument from 'pdfkit'
import * as JSZip from 'jszip'

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
    
    // Vérifier si les IDs des produits sont valides
    if (!productIds || productIds.length === 0) {
      throw new HttpsError('invalid-argument', 'Aucun produit trouvé dans la session')
    }

    // Vérifier que tous les IDs sont non-vides et les logger individuellement
    const invalidIds = productIds.filter((id: string) => !id)
    if (invalidIds.length > 0) {
      console.error('IDs invalides détectés:', invalidIds)
      throw new HttpsError('invalid-argument', `ID de produit invalide détecté: ${invalidIds.join(', ')}`)
    }

    const productsData = await Promise.all(
      productIds.map(async (productId: string) => {
        const productDoc = await db.collection('pharma_products').doc(productId).get()
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
          const doc = new PDFDocument({
            margins: {
              top: 50,
              bottom: 50,
              left: 50,
              right: 50
            },
            info: {
              Title: `Fiche Produit - ${productData.title || ""}`,
              Author: 'PharmaData',
              Subject: `Information produit pharmaceutique (CIP: ${productData.cip_code})`,
              Keywords: 'pharmacie, médicament, fiche produit'
            }
          })
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

          // Ajouter un logo ou en-tête (à adapter avec votre logo)
          // doc.image('logo.png', 50, 45, { width: 50 })

          // Style pour les titres et sections
          const titleStyle = { continued: false, align: 'center' as const, underline: false }
          const sectionTitleStyle = { continued: false, underline: true }
          const textStyle = { continued: false, align: 'left' as const, underline: false }
          const lineHeight = 5

          // Couleurs
          const primaryColor = '#3b82f6' // Bleu
          const textColor = '#374151' // Gris foncé
          const highlightColor = '#4f46e5' // Indigo

          // En-tête avec titre et ligne de séparation
          doc.fontSize(24)
             .fillColor(primaryColor)
             .text('Fiche Produit', titleStyle)
             .moveDown(0.5)

          // Ligne de séparation
          doc.moveTo(50, doc.y)
             .lineTo(doc.page.width - 50, doc.y)
             .strokeColor(primaryColor)
             .stroke()
             .moveDown(1)

          // Informations principales
          doc.fontSize(16)
             .fillColor(highlightColor)
             .text(productData.title || "", titleStyle)
             .moveDown(0.5)
             
          doc.fontSize(12)
             .fillColor(textColor)

          // Information CIP avec boîte stylisée
          doc.rect(50, doc.y, doc.page.width - 100, 30)
             .fillAndStroke('#f3f4f6', primaryColor)
             .fillColor(textColor)
             .text(`CIP: ${productData.cip_code}`, 70, doc.y - 20, textStyle)
             .moveDown(1.5)

          // Informations essentielles dans une mise en page à deux colonnes
          if (productData.brand) {
            doc.fontSize(12).fillColor(primaryColor)
               .text(`Marque: `, { continued: true })
               .fillColor(textColor)
               .text(`${productData.brand}`, textStyle)
               .moveDown(lineHeight)
          }

          if (productData.category) {
            doc.fontSize(12).fillColor(primaryColor)
               .text(`Catégorie: `, { continued: true })
               .fillColor(textColor)
               .text(`${productData.category}`, textStyle)
               .moveDown(lineHeight)
          }

          // Sous-catégories dans une mise en page compacte
          const subcategories = []
          if (productData.sub_category1) subcategories.push(productData.sub_category1)
          if (productData.sub_category2) subcategories.push(productData.sub_category2)
          if (productData.sub_category3) subcategories.push(productData.sub_category3)

          if (subcategories.length > 0) {
            doc.fontSize(12).fillColor(primaryColor)
               .text(`Sous-catégorie(s): `, { continued: true })
               .fillColor(textColor)
               .text(subcategories.join(', '), textStyle)
               .moveDown(lineHeight)
          }

          // Description du produit
          if (productData.short_desc) {
            doc.moveDown(0.5)
               .fontSize(14)
               .fillColor(primaryColor)
               .text('Description', sectionTitleStyle)
               .moveDown(0.5)
               .fontSize(12)
               .fillColor(textColor)
               .text(productData.short_desc, textStyle)
               .moveDown(lineHeight)
          }

          // Description détaillée
          if (productData.long_desc) {
            doc.moveDown(0.5)
               .fontSize(14)
               .fillColor(primaryColor)
               .text('Description détaillée', sectionTitleStyle)
               .moveDown(0.5)
               .fontSize(12)
               .fillColor(textColor)
               .text(productData.long_desc, textStyle)
               .moveDown(lineHeight)
          }

          // Informations techniques
          if (productData.composition || productData.posologie || productData.indication_contre_indication || productData.contre_indication) {
            doc.moveDown(0.5)
               .fontSize(14)
               .fillColor(primaryColor)
               .text('Informations techniques', sectionTitleStyle)
               .moveDown(0.5)
               .fontSize(12)
               .fillColor(textColor)
          }

          if (productData.composition) {
            doc.fontSize(12).fillColor(primaryColor)
               .text('Composition:', { continued: false })
               .fillColor(textColor)
               .text(productData.composition, textStyle)
               .moveDown(lineHeight)
          }

          if (productData.posologie) {
            doc.fontSize(12).fillColor(primaryColor)
               .text('Posologie:', { continued: false })
               .fillColor(textColor)
               .text(productData.posologie, textStyle)
               .moveDown(lineHeight)
          }

          if (productData.indication_contre_indication) {
            doc.fontSize(12).fillColor(primaryColor)
               .text('Indications et contre-indications:', { continued: false })
               .fillColor(textColor)
               .text(productData.indication_contre_indication, textStyle)
               .moveDown(lineHeight)
          }

          if (productData.contre_indication) {
            doc.fontSize(12).fillColor(primaryColor)
               .text('Contre-indications:', { continued: false })
               .fillColor(textColor)
               .text(productData.contre_indication, textStyle)
               .moveDown(lineHeight)
          }

          // Informations complémentaires dans un encadré
          const complementaryInfo = []
          if (productData.age_minimum) complementaryInfo.push(`Âge minimum: ${productData.age_minimum}`)
          if (productData.nombre_d_unites) complementaryInfo.push(`Nombre d'unités: ${productData.nombre_d_unites}`)
          if (productData.last_update) complementaryInfo.push(`Dernière mise à jour: ${productData.last_update}`)

          if (complementaryInfo.length > 0) {
            doc.moveDown(0.5)
            const boxY = doc.y
            const boxHeight = 20 + (complementaryInfo.length * 20)
            
            doc.rect(50, boxY, doc.page.width - 100, boxHeight)
               .fillAndStroke('#f9fafb', '#e5e7eb')
            
            doc.fontSize(14)
               .fillColor(primaryColor)
               .text('Informations complémentaires', 70, boxY + 10, textStyle)
            
            let currentY = boxY + 35
            doc.fontSize(12)
               .fillColor(textColor)
            
            complementaryInfo.forEach(info => {
              doc.text(info, 70, currentY, textStyle)
              currentY += 20
            })
            
            doc.moveDown(boxHeight/20 + 1)
          }

          // Pied de page avec date de génération
          const currentDate = new Date().toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })

          doc.fontSize(10)
             .fillColor('#6b7280')
             .text(`Généré le ${currentDate} via PharmaData`, 50, doc.page.height - 50, textStyle)

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

    const purchaseHistory = {
      userId: request.auth.uid,
      sessionId,
      purchaseDate: new Date().toISOString(),
      format,
      files: files.map((url, index) => ({
        url,
        productId: productIds[index],
        format,
        fileName: `${productsData[index].cip_code}.${format}`,
        productData: {
          title: productsData[index].title,
          cip_code: productsData[index].cip_code
        }
      })),
      totalFiles: files.length,
      status: 'completed'
    }

    // Sauvegarder l'historique
    await db.collection('user_purchases').add(purchaseHistory)

    return { files }
  } catch (error) {
    console.error('Erreur lors de la génération des fichiers:', error)
    throw new HttpsError('internal', 'Erreur lors de la génération des fichiers')
  }
})

export const getProductFilesAsZip = onCall({
  region: 'europe-west9',
  cors: [
    'https://pharmadata-frontend-dev-383194447870.europe-west9.run.app',
    'https://pharmadata-frontend-staging-383194447870.europe-west9.run.app',
    'http://localhost:3000'
  ],
  maxInstances: 10,
  invoker: 'public', // Permettre l'accès public
  timeoutSeconds: 120, // Augmentation du timeout pour la génération du ZIP
  memory: '512MiB'  // Plus de mémoire pour la génération du ZIP
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
    
    // Vérifier si les IDs des produits sont valides
    if (!productIds || productIds.length === 0) {
      throw new HttpsError('invalid-argument', 'Aucun produit trouvé dans la session')
    }

    // Vérifier que tous les IDs sont non-vides et les logger individuellement
    const invalidIds = productIds.filter((id: string) => !id)
    if (invalidIds.length > 0) {
      console.error('IDs invalides détectés:', invalidIds)
      throw new HttpsError('invalid-argument', `ID de produit invalide détecté: ${invalidIds.join(', ')}`)
    }

    const productsData = await Promise.all(
      productIds.map(async (productId: string) => {
        const productDoc = await db.collection('pharma_products').doc(productId).get()
        if (!productDoc.exists) {
          throw new HttpsError('not-found', `Produit non trouvé: ${productId}`)
        }
        return productDoc.data() as Product
      })
    )

    // Créer un nouveau fichier ZIP
    const zip = new JSZip()
    
    // Générer et ajouter chaque fichier au ZIP
    await Promise.all(
      productsData.map(async (productData) => {
        const fileName = `${productData.cip_code}.${format}`
        const filteredProduct = Object.fromEntries(
          Object.entries(productData).filter(([_, value]) => value !== null && value !== undefined)
        )

        if (format === 'json') {
          // Ajouter JSON au ZIP
          const jsonContent = JSON.stringify(filteredProduct, null, 2)
          zip.file(fileName, jsonContent)
        } else {
          // Générer PDF et l'ajouter au ZIP
          const doc = new PDFDocument()
          const chunks: Buffer[] = []

          // Événements pour capturer le contenu PDF
          doc.on('data', (chunk: Buffer) => chunks.push(chunk))
          
          // Promesse pour attendre la fin de la génération du PDF
          await new Promise<void>((resolve) => {
            doc.on('end', () => {
              const pdfBuffer = Buffer.concat(chunks)
              zip.file(fileName, pdfBuffer)
              resolve()
            })
            
            // Contenu du PDF (identique à la fonction getProductFiles)
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
          })
        }
      })
    )

    // Générer le ZIP
    const zipContent = await zip.generateAsync({ type: 'nodebuffer' })
    
    // Sauvegarder le ZIP dans le stockage
    const zipFileName = `${sessionId}/fiches-produits-${format}.zip`
    const zipFile = bucket.file(zipFileName)
    
    await zipFile.save(zipContent, {
      contentType: 'application/zip',
      metadata: {
        contentDisposition: `attachment; filename="fiches-produits-${format}.zip"`
      }
    })
    
    // Générer une URL signée pour le téléchargement
    const [zipUrl] = await zipFile.getSignedUrl({
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000 // 24 heures
    })
    
    const zipPurchaseHistory = {
      userId: request.auth.uid,
      sessionId,
      purchaseDate: new Date().toISOString(),
      format,
      zipUrl,
      productsData,
      totalFiles: productsData.length,
      status: 'completed'
    }

    // Sauvegarder l'historique du ZIP
    await db.collection('user_purchases').add(zipPurchaseHistory)

    return { zipUrl }
  } catch (error) {
    console.error('Erreur lors de la génération du ZIP:', error)
    throw new HttpsError('internal', 'Erreur lors de la génération des fichiers ZIP')
  }
})