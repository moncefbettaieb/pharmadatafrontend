import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as PDFDocument from "pdfkit";
import * as JSZip from "jszip";

interface ProductData {
  codereferent: string;
  brand: string;
  title: string;
  source: string;
  categorie: string;
  sous_categorie_1: string;
  sous_categorie_2: string;
  sous_categorie_3: string;
  combined_category: string;
  short_desc: string;
  long_desc: string;
  age_minimum: string;
  nombre_d_unites: string;
  indication_contre_indication: string;
  posologie: string;
  composition: string;
  contre_indication: string;
  last_update: string;
  categorie_id: number;
  taxonomy_id: number;
  taxonomy_name: string;
  category: string;
  sub_category1: string;
  sub_category2: string;
  sub_category3: string;
  image_url?: string;
  images?: string[];
}

export const getProductFiles = onCall(
  {
    region: "europe-west9",
    cors: [
      "https://pharmadata-frontend-staging-383194447870.europe-west9.run.app",
      "https://pharmadataapi.fr",
      "https://www.pharmadataapi.fr",
      "http://localhost:3000",
    ],
    maxInstances: 10,
    invoker: "public", // Permettre l'accès public
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (request) => {
    // Vérifier l'authentification Firebase
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "L'utilisateur doit être authentifié"
      );
    }

    const { sessionId, format = "pdf" } = request.data;
    if (!sessionId) {
      throw new HttpsError("invalid-argument", "ID de session requis");
    }

    if (!["pdf", "json"].includes(format)) {
      throw new HttpsError(
        "invalid-argument",
        'Format invalide. Utilisez "pdf" ou "json"'
      );
    }

    try {
      const db = admin.firestore();
      const storage = admin.storage();
      const bucket = storage.bucket();

      // Vérifier la session de paiement
      const sessionDoc = await db
        .collection("product_payment_sessions")
        .doc(sessionId)
        .get();
      if (!sessionDoc.exists) {
        throw new HttpsError("not-found", "Session de paiement non trouvée");
      }
      const sessionData = sessionDoc.data();
      // Vérifier que l'utilisateur est bien le propriétaire de la session
      if (sessionData?.userId !== request.auth.uid) {
        throw new HttpsError(
          "permission-denied",
          "Accès non autorisé à cette session"
        );
      }

      // Vérifier que le paiement est bien complété
      if (sessionData?.status !== "completed") {
        throw new HttpsError(
          "failed-precondition",
          "Le paiement n'est pas encore complété"
        );
      }

      // Récupérer les données des produits
      const productIds = sessionData.items.map((item: any) => item.productId);

      // Vérifier si les IDs des produits sont valides
      if (!productIds || productIds.length === 0) {
        throw new HttpsError(
          "invalid-argument",
          "Aucun produit trouvé dans la session"
        );
      }

      // Vérifier que tous les IDs sont non-vides et les logger individuellement
      const invalidIds = productIds.filter((id: string) => !id);
      if (invalidIds.length > 0) {
        console.error("IDs invalides détectés:", invalidIds);
        throw new HttpsError(
          "invalid-argument",
          `ID de produit invalide détecté: ${invalidIds.join(", ")}`
        );
      }

      const productsData = await Promise.all(
        productIds.map(async (productId: string) => {
          const productDoc = await db
            .collection("pharma_products")
            .doc(productId)
            .get();
          if (!productDoc.exists) {
            throw new HttpsError(
              "not-found",
              `Produit non trouvé: ${productId}`
            );
          }
          return productDoc.data() as ProductData;
        })
      );

      // Générer les fichiers
      const files = await Promise.all(
        productsData.map(async (productData) => {
          const fileName = `${sessionId}/${productData.codereferent}.${format}`;
          const file = bucket.file(fileName);
          const filteredProduct = Object.fromEntries(
            Object.entries(productData).filter(
              ([_, value]) => value !== null && value !== undefined
            )
          );

          if (format === "json") {
            // Générer JSON
            const jsonContent = JSON.stringify(filteredProduct, null, 2);
            await file.save(jsonContent, {
              contentType: "application/json",
              metadata: {
                contentDisposition: `attachment; filename="${productData.codereferent}.json"`,
              },
            });
          } else {
            // Générer PDF
            const doc = new PDFDocument({
              margins: {
                top: 50,
                bottom: 50,
                left: 50,
                right: 50,
              },
              info: {
                Title: `Fiche Produit - ${productData.title || ""}`,
                Author: "PharmaData",
                Subject: `Information produit pharmaceutique (CIP ou EAN: ${productData.codereferent})`,
                Keywords: "pharmacie, médicament, fiche produit",
              },
            });
            const chunks: Buffer[] = [];

            doc.on("data", (chunk: Buffer) => chunks.push(chunk));
            doc.on("end", async () => {
              const pdfBuffer = Buffer.concat(chunks);
              await file.save(pdfBuffer, {
                contentType: "application/pdf",
                metadata: {
                  contentDisposition: `attachment; filename="${productData.codereferent}.pdf"`,
                },
              });
            });

            // Style pour les titres et sections
            const titleStyle = {
              continued: false,
              align: "center" as const,
              underline: false,
            };
            const sectionTitleStyle = { continued: false, underline: true };
            const textStyle = {
              continued: false,
              align: "left" as const,
              underline: false,
            };
            const lineHeight = 5;

            // Couleurs
            const primaryColor = "#3b82f6"; // Bleu
            const textColor = "#374151"; // Gris foncé
            const highlightColor = "#4f46e5"; // Indigo

            // Ajouter le titre du produit en haut et centré
            doc
              .fontSize(16)
              .fillColor(highlightColor)
              .text(productData.title || "", 50, 45, {
                align: "center",
                width: doc.page.width - 100,
              });

            // Ajouter le logo en haut à gauche et Pharma Data en dessous
            doc
              .image("images/pharmadata_logo_128.png", 50, 35, { width: 40 })
              .fontSize(12)
              .fillColor(primaryColor)
              .text("Pharma Data", 50, 80, { width: 100 });

            // Ligne de séparation horizontale
            doc
              .moveTo(50, 110)
              .lineTo(doc.page.width - 50, 110)
              .strokeColor(primaryColor)
              .stroke()
              .moveDown(2);

            // Tout le contenu commence après la ligne
            const contentStartY = 140;
            doc.y = contentStartY;

            // En-tête "Fiche Produit"
            doc
              .fontSize(20)
              .fillColor(primaryColor)
              .text("Fiche Produit", titleStyle)
              .moveDown(3);

            // Code CIP/EAN dans un encadré
            doc
              .rect(50, doc.y, doc.page.width - 100, 40)
              .fillAndStroke("#f3f4f6", primaryColor);

            doc
              .fontSize(14)
              .fillColor(textColor)
              .text(
                `Code Réferent (CIP ou EAN): ${productData.codereferent}`,
                70,
                doc.y - 30,
                textStyle
              )
              .moveDown(2);

            // Marque
            if (productData.brand) {
              doc
                .fontSize(14)
                .fillColor(primaryColor)
                .text(`Marque: `, { continued: true })
                .fillColor(textColor)
                .text(`${productData.brand}`, textStyle)
                .moveDown(1.5);
            }

            // Catégories avec plus d'espacement
            if (productData.category) {
              doc
                .fontSize(14)
                .fillColor(primaryColor)
                .text(`Catégorie: `, { continued: true })
                .fillColor(textColor)
                .text(`${productData.category}`, textStyle)
                .moveDown(1);
            }

            // Sous-catégories avec une meilleure mise en page
            const subcategories = [];
            if (productData.sub_category1)
              subcategories.push(productData.sub_category1);
            if (productData.sub_category2)
              subcategories.push(productData.sub_category2);
            if (productData.sub_category3)
              subcategories.push(productData.sub_category3);

            if (subcategories.length > 0) {
              doc
                .fontSize(14)
                .fillColor(primaryColor)
                .text(`Sous-catégorie(s): `, { continued: true })
                .fillColor(textColor)
                .text(subcategories.join(" > "), textStyle)
                .moveDown(1.5);
            }

            // Description du produit avec plus d'espacement
            if (productData.short_desc) {
              doc
                .moveDown(0.5)
                .fontSize(16)
                .fillColor(primaryColor)
                .text("Description", sectionTitleStyle)
                .moveDown(0.5)
                .fontSize(12)
                .fillColor(textColor)
                .text(productData.short_desc, textStyle)
                .moveDown(1.5);
            }

            // Description détaillée avec plus d'espacement
            if (productData.long_desc) {
              doc
                .moveDown(0.5)
                .fontSize(16)
                .fillColor(primaryColor)
                .text("Description détaillée", sectionTitleStyle)
                .moveDown(0.5)
                .fontSize(12)
                .fillColor(textColor)
                .text(productData.long_desc, textStyle)
                .moveDown(1.5);
            }

            // Informations essentielles dans une mise en page à deux colonnes
            if (productData.age_minimum) {
              doc
                .fontSize(12)
                .fillColor(primaryColor)
                .text(`Âge minimum: ${productData.age_minimum}`, textStyle)
                .moveDown(lineHeight);
            }

            if (productData.nombre_d_unites) {
              doc
                .fontSize(12)
                .fillColor(primaryColor)
                .text(
                  `Nombre d'unités: ${productData.nombre_d_unites}`,
                  textStyle
                )
                .moveDown(lineHeight);
            }

            if (productData.last_update) {
              doc
                .fontSize(12)
                .fillColor(primaryColor)
                .text(
                  `Dernière mise à jour: ${productData.last_update}`,
                  textStyle
                )
                .moveDown(lineHeight);
            }

            // Pied de page avec date de génération
            const currentDate = new Date().toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            // Vérifier si on est sur la dernière page
            if (doc.y > doc.page.height - 150) {
              // Si on est trop bas sur la page, créer une nouvelle page
              doc.addPage();
            } else {
              // Sinon, ajouter un espace avant le pied de page
              doc.moveDown(2);
            }

            doc
              .fontSize(10)
              .fillColor("#6b7280")
              .text(`Généré le ${currentDate} via PharmaData`, 50, doc.y, {
                align: "left",
              });

            doc.end();
          }

          // Générer URL signée
          const [url] = await file.getSignedUrl({
            action: "read",
            expires: Date.now() + 24 * 60 * 60 * 1000, // 24 heures
          });

          return url;
        })
      );

      const purchaseHistory = {
        userId: request.auth.uid,
        sessionId,
        purchaseDate: new Date().toISOString(),
        format,
        files: files.map((url, index) => ({
          url,
          productId: productIds[index],
          format,
          fileName: `${productsData[index].codereferent}.${format}`,
          productData: {
            title: productsData[index].title,
            codereferent: productsData[index].codereferent,
          },
        })),
        totalFiles: files.length,
        status: "completed",
      };

      // Sauvegarder l'historique
      await db.collection("user_purchases").add(purchaseHistory);

      return { files };
    } catch (error) {
      console.error("Erreur lors de la génération des fichiers:", error);
      throw new HttpsError(
        "internal",
        "Erreur lors de la génération des fichiers"
      );
    }
  }
);

export const getProductFilesAsZip = onCall(
  {
    region: "europe-west9",
    cors: [
      "https://pharmadata-frontend-dev-383194447870.europe-west9.run.app",
      "https://pharmadata-frontend-staging-383194447870.europe-west9.run.app",
      "https://pharmadataapi.fr",
      "https://www.pharmadataapi.fr",
      "http://localhost:3000",
    ],
    maxInstances: 10,
    invoker: "public", // Permettre l'accès public
    timeoutSeconds: 120, // Augmentation du timeout pour la génération du ZIP
    memory: "1GiB", // Plus de mémoire pour la génération du ZIP
  },
  async (request) => {
    // Vérifier l'authentification Firebase
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "L'utilisateur doit être authentifié"
      );
    }

    const { sessionId, format = "pdf" } = request.data;
    if (!sessionId) {
      throw new HttpsError("invalid-argument", "ID de session requis");
    }

    if (!["pdf", "json"].includes(format)) {
      throw new HttpsError(
        "invalid-argument",
        'Format invalide. Utilisez "pdf" ou "json"'
      );
    }

    try {
      const db = admin.firestore();
      const storage = admin.storage();
      const bucket = storage.bucket();

      // Vérifier la session de paiement
      const sessionDoc = await db
        .collection("product_payment_sessions")
        .doc(sessionId)
        .get();
      if (!sessionDoc.exists) {
        throw new HttpsError("not-found", "Session de paiement non trouvée");
      }

      const sessionData = sessionDoc.data();

      // Vérifier que l'utilisateur est bien le propriétaire de la session
      if (sessionData?.userId !== request.auth.uid) {
        throw new HttpsError(
          "permission-denied",
          "Accès non autorisé à cette session"
        );
      }

      // Vérifier que le paiement est bien complété
      if (sessionData?.status !== "completed") {
        throw new HttpsError(
          "failed-precondition",
          "Le paiement n'est pas encore complété"
        );
      }

      // Récupérer les données des produits
      const productIds = sessionData.items.map((item: any) => item.productId);

      // Vérifier si les IDs des produits sont valides
      if (!productIds || productIds.length === 0) {
        throw new HttpsError(
          "invalid-argument",
          "Aucun produit trouvé dans la session"
        );
      }

      // Vérifier que tous les IDs sont non-vides et les logger individuellement
      const invalidIds = productIds.filter((id: string) => !id);
      if (invalidIds.length > 0) {
        console.error("IDs invalides détectés:", invalidIds);
        throw new HttpsError(
          "invalid-argument",
          `ID de produit invalide détecté: ${invalidIds.join(", ")}`
        );
      }

      const productsData = await Promise.all(
        productIds.map(async (productId: string) => {
          const productDoc = await db
            .collection("pharma_products")
            .doc(productId)
            .get();
          if (!productDoc.exists) {
            throw new HttpsError(
              "not-found",
              `Produit non trouvé: ${productId}`
            );
          }
          return productDoc.data() as ProductData;
        })
      );

      // Créer un nouveau fichier ZIP
      const zip = new JSZip();

      // Générer et ajouter chaque fichier au ZIP
      await Promise.all(
        productsData.map(async (productData) => {
          const fileName = `${productData.codereferent}.${format}`;
          const filteredProduct = Object.fromEntries(
            Object.entries(productData).filter(
              ([_, value]) => value !== null && value !== undefined
            )
          );

          if (format === "json") {
            // Ajouter JSON au ZIP
            const jsonContent = JSON.stringify(filteredProduct, null, 2);
            zip.file(fileName, jsonContent);
          } else {
            // Générer PDF et l'ajouter au ZIP
            const doc = new PDFDocument();
            const chunks: Buffer[] = [];

            // Événements pour capturer le contenu PDF
            doc.on("data", (chunk: Buffer) => chunks.push(chunk));

            // Promesse pour attendre la fin de la génération du PDF
            await new Promise<void>((resolve) => {
              doc.on("end", () => {
                const pdfBuffer = Buffer.concat(chunks);
                zip.file(fileName, pdfBuffer);
                resolve();
              });

              // Contenu du PDF (identique à la fonction getProductFiles)
              doc.fontSize(20).text("Fiche Produit", { align: "center" });
              doc.moveDown();
              doc
                .fontSize(14)
                .text(
                  `Code Réferent (CIP ou EAN): ${productData.codereferent}`
                );
              doc.fontSize(16).text(productData.title);
              doc.moveDown();
              doc.fontSize(12).text(`Marque: ${productData.brand}`);
              doc.moveDown();
              if (productData.sub_category1) {
                doc.fontSize(12).text("Sous-catégorie 1:", { underline: true });
                doc.text(productData.sub_category1);
                doc.moveDown();
              }
              if (productData.sub_category2) {
                doc.fontSize(12).text("Sous-catégorie 2:", { underline: true });
                doc.text(productData.sub_category1);
                doc.moveDown();
              }
              if (productData.sub_category3) {
                doc.fontSize(12).text("Sous-catégorie 3:", { underline: true });
                doc.text(productData.sub_category1);
                doc.moveDown();
              }
              if (productData.short_desc) {
                doc
                  .fontSize(12)
                  .text("Description courte:", { underline: true });
                doc.text(productData.short_desc);
                doc.moveDown();
              }
              if (productData.long_desc) {
                doc
                  .fontSize(12)
                  .text("Description détaillée:", { underline: true });
                doc.text(productData.long_desc);
                doc.moveDown();
              }
              if (productData.composition) {
                doc.fontSize(12).text("Composition:", { underline: true });
                doc.text(productData.composition);
                doc.moveDown();
              }
              if (productData.posologie) {
                doc.fontSize(12).text("Posologie:", { underline: true });
                doc.text(productData.posologie);
                doc.moveDown();
              }
              if (productData.indication_contre_indication) {
                doc.fontSize(12).text("Indications et Contre-indications:", {
                  underline: true,
                });
                doc.text(productData.indication_contre_indication);
                doc.moveDown();
              }
              if (productData.contre_indication) {
                doc
                  .fontSize(12)
                  .text("Contre-indications:", { underline: true });
                doc.text(productData.contre_indication);
                doc.moveDown();
              }
              // Informations complémentaires
              if (productData.age_minimum) {
                doc.text(`Âge minimum: ${productData.age_minimum}`);
              }
              if (productData.nombre_d_unites) {
                doc.text(`Nombre d'unités: ${productData.nombre_d_unites}`);
              }
              doc.end();
            });
          }
        })
      );

      // Générer le ZIP
      const zipContent = await zip.generateAsync({ type: "nodebuffer" });

      // Sauvegarder le ZIP dans le stockage
      const zipFileName = `${sessionId}/fiches-produits-${format}.zip`;
      const zipFile = bucket.file(zipFileName);

      await zipFile.save(zipContent, {
        contentType: "application/zip",
        metadata: {
          contentDisposition: `attachment; filename="fiches-produits-${format}.zip"`,
        },
      });

      // Générer une URL signée pour le téléchargement
      const [zipUrl] = await zipFile.getSignedUrl({
        action: "read",
        expires: Date.now() + 24 * 60 * 60 * 1000, // 24 heures
      });

      const zipPurchaseHistory = {
        userId: request.auth.uid,
        sessionId,
        purchaseDate: new Date().toISOString(),
        format,
        zipUrl,
        productsData,
        totalFiles: productsData.length,
        status: "completed",
      };

      // Sauvegarder l'historique du ZIP
      await db.collection("user_purchases").add(zipPurchaseHistory);

      return { zipUrl };
    } catch (error) {
      console.error("Erreur lors de la génération du ZIP:", error);
      throw new HttpsError(
        "internal",
        "Erreur lors de la génération des fichiers ZIP"
      );
    }
  }
);
