import { onRequest, onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { Storage, GetSignedUrlConfig } from "@google-cloud/storage";

interface Product {
  id: string;
  codereferent: string;
  brand: string;
  title: string;
  categorie: string;
  sous_categorie_1: string;
  sous_categorie_2: string;
  sous_categorie_3: string;
  short_desc: string;
  long_desc: string;
  image_url: string;
  images?: string[];
  taxonomy_category: string;
  taxonomy_sub_category1: string;
  taxonomy_sub_category2: string;
  taxonomy_sub_category3: string;
  indication_contre_indication: string;
  posologie: string;
  presentation: string;
  specificites: string;
  composition: string;
  conditionnement: string;
  nombre_d_unites: string;
  age_minimum: string;
  volume: string;
  substance_active: string;
  nature_de_produit: string;
  label: string;
  contre_indication: string;
  last_update: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  category?: string;
  subCategory1?: string;
  subCategory2?: string;
  brand?: string;
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

const storage = new Storage();

async function generateSignedUrl(
  bucketName: string,
  filePath: string,
  expirySeconds = 3600
): Promise<string> {
  const options: GetSignedUrlConfig = {
    version: "v4",
    action: "read",
    expires: Date.now() + expirySeconds * 1000,
  };

  const [url] = await storage
    .bucket(bucketName)
    .file(filePath)
    .getSignedUrl(options);

  return url;
}

async function listImagesForCip(
  bucketName: string,
  cip: string,
  expirySeconds = 3600
): Promise<string[]> {
  // 1) Lister tous les fichiers GCS avec un prefix = "<cip>/"
  const [files] = await storage.bucket(bucketName).getFiles({
    prefix: cip + "/", // ex: "0070942904148/"
  });

  if (files.length === 0) {
    return [];
  }
  // 2) Générer les URLs signées
  const urls = await Promise.all(
    files.map((file) => generateSignedUrl(bucketName, file.name, expirySeconds))
  );

  return urls;
}

async function validateAndExtractToken(
  authHeader: string | undefined
): Promise<string | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("Invalid or missing Authorization header");
    return null;
  }

  const token = authHeader.split("Bearer ")[1];
  if (!token) {
    console.error("Token not found in Authorization header");
    return null;
  }
  if (!token) return null;

  const tokenDoc = await admin
    .firestore()
    .collection("api_tokens")
    .where("token", "==", token)
    .where("isRevoked", "==", false)
    .limit(1)
    .get();

  if (tokenDoc.empty) return null;
  return tokenDoc.docs[0].id;
}

async function trackTokenUsage(
  tokenId: string,
  endpoint: string,
  responseTime: number,
  success: boolean,
  productId?: string
) {
  const db = admin.firestore();
  const tokenRef = db.collection("api_tokens").doc(tokenId);

  await db.runTransaction(async (transaction) => {
    // 1. Lire d'abord tous les documents nécessaires
    const tokenDoc = await transaction.get(tokenRef);
    if (!tokenDoc.exists) return;

    const userId = tokenDoc.data()?.userId;
    let viewDoc = null;

    if (endpoint === "getProductByCip" && productId && userId) {
      const viewKey = `${userId}_${productId}`;
      const viewRef = db.collection("product_views").doc(viewKey);
      viewDoc = await transaction.get(viewRef);
    }

    // 2. Ensuite, faire toutes les écritures
    // Update last used timestamp
    transaction.update(tokenRef, {
      lastUsed: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Pour l'endpoint getProductByCip, on vérifie si c'est la première consultation
    if (endpoint === "getProductByCip" && productId && userId) {
      const viewKey = `${userId}_${productId}`;
      const viewRef = db.collection("product_views").doc(viewKey);

      // Si c'est la première consultation de ce produit par cet utilisateur
      if (!viewDoc?.exists) {
        // Enregistrer la vue
        transaction.set(viewRef, {
          userId,
          productId,
          firstViewedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Track API usage seulement pour la première consultation
        const usageRef = db.collection("api_usage").doc();
        transaction.set(usageRef, {
          userId,
          tokenId,
          endpoint,
          productId,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          responseTime,
          success,
        });
      }
    } else {
      // Pour les autres endpoints, on continue à tracker normalement
      const usageRef = db.collection("api_usage").doc();
      transaction.set(usageRef, {
        userId,
        tokenId,
        endpoint,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        responseTime,
        success,
      });
    }
  });
}

const ALLOWED_ORIGINS = [
  "https://pharmadataapi.fr",
  "https://www.pharmadataapi.fr",
  "https://pharmadata-frontend-staging-383194447870.europe-west9.run.app",
  "https://pharmadata-frontend-dev-383194447870.europe-west9.run.app",
  "http://localhost:3000",
];

const corsConfig = {
  cors: ALLOWED_ORIGINS,
  region: "europe-west9",
  maxInstances: 10,
};

export const getProducts = onCall(corsConfig, async (request) => {
  try {
    const db = admin.firestore();
    const {
      page = 1,
      limit = 12,
      sortBy = "last_update",
      sortOrder = "desc",
    } = request.data || ({} as PaginationParams);

    // Get total count of active products
    const countSnapshot = await db.collection("pharma_products").count().get();
    const total = countSnapshot.data().count;

    // Get paginated products
    const productsSnapshot = await db
      .collection("pharma_products")
      .orderBy(sortBy, sortOrder)
      .offset((page - 1) * limit)
      .limit(limit)
      .get();

    const products = await Promise.all(
      productsSnapshot.docs.map(async (doc) => {
        const rawData = doc.data();
        const bucketName = "pharma_images";
        const imageUrls = await listImagesForCip(
          bucketName,
          rawData.codereferent,
          3600
        );

        // Supprimer l'ID des données brutes s'il existe
        const { id: _, ...dataWithoutId } = rawData;

        // Créer l'objet final avec le bon ID
        return Object.assign({}, dataWithoutId, {
          id: doc.id,
          images: imageUrls.length > 0 ? imageUrls : [],
          image_url: imageUrls.length > 0 ? imageUrls[0] : null,
        }) as Product;
      })
    );

    const response: ProductsResponse = {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };

    return response;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new HttpsError("internal", "Error fetching products");
  }
});

export const getProductByCip = onRequest(corsConfig, async (req, res) => {
  const startTime = Date.now();
  let tokenId: string | null = null;

  // Vérifier l'origine de la requête
  const origin = req.headers.origin || req.headers.referer;
  const isFrontendCall =
    origin && ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed));

  // Si ce n'est pas un appel frontend autorisé, valider le token
  if (!isFrontendCall) {
    tokenId = await validateAndExtractToken(req.headers.authorization);
    if (!tokenId) {
      res.status(401).json({ error: "Invalid or missing token" });
      return;
    }
  }

  const pathParts = req.path.split("/");
  const codereferent = pathParts[pathParts.length - 1] as string;
  if (!codereferent) {
    res.status(400).json({ error: "Code Referent is required" });
    return;
  }

  try {
    const db = admin.firestore();
    const productDoc = await db
      .collection("pharma_products")
      .where("codereferent", "==", codereferent)
      .limit(1)
      .get();

    if (productDoc.empty) {
      if (tokenId) {
        await trackTokenUsage(
          tokenId,
          "getProductByCip",
          Date.now() - startTime,
          false
        );
      }
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const productData = productDoc.docs[0].data() as Omit<Product, "id">;
    const productId = productDoc.docs[0].id;

    const bucketName = "pharma_images";
    const imageUrls = await listImagesForCip(bucketName, codereferent, 3600);
    productData.images = imageUrls.length > 0 ? imageUrls : [];
    if (imageUrls.length > 0) {
      productData.image_url = imageUrls[0];
    }

    // Créer l'objet final avec le bon ID
    const product = {
      ...productData,
      id: productId,
    } as Product;

    // Track l'usage du token seulement pour les appels externes
    if (tokenId) {
      await trackTokenUsage(
        tokenId,
        "getProductByCip",
        Date.now() - startTime,
        true,
        productId
      );
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    if (tokenId) {
      await trackTokenUsage(
        tokenId,
        "getProductByCip",
        Date.now() - startTime,
        false
      );
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

export const getProductsByBrand = onCall(
  {
    region: "europe-west9",
    maxInstances: 10,
    memory: "256MiB",
  },
  async (request) => {
    try {
      const {
        brand,
        page = 1,
        limit = 12,
        sortBy = "title",
        sortOrder = "asc",
      } = request.data;

      if (!brand) {
        throw new HttpsError("invalid-argument", "Brand parameter is required");
      }

      const db = admin.firestore();

      // Get total count for this brand
      const countSnapshot = await db
        .collection("pharma_products")
        .where("brand", "==", brand)
        .count()
        .get();
      const total = countSnapshot.data().count;

      // Get paginated products for this brand
      const productsSnapshot = await db
        .collection("pharma_products")
        .where("brand", "==", brand)
        .orderBy(sortBy, sortOrder)
        .offset((page - 1) * limit)
        .limit(limit)
        .get();

      const products = await Promise.all(
        productsSnapshot.docs.map(async (doc) => {
          const productData = { ...doc.data(), id: doc.id } as Product;
          const bucketName = "pharma_images";
          const imageUrls = await listImagesForCip(
            bucketName,
            productData.codereferent,
            3600
          );
          return {
            ...productData,
            images: imageUrls.length > 0 ? imageUrls : [],
            image_url:
              imageUrls.length > 0 ? imageUrls[0] : productData.image_url,
          };
        })
      );

      return {
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      };
    } catch (error) {
      console.error("Error fetching products by brand:", error);
      throw new HttpsError("internal", "Error fetching products by brand");
    }
  }
);

export const getProductsByCategory = onCall(
  {
    region: "europe-west9",
    maxInstances: 10,
    memory: "256MiB",
  },
  async (request) => {
    try {
      const {
        category,
        subCategory1,
        subCategory2,
        subCategory3,
        page = 1,
        limit = 12,
        sortBy = "title",
        sortOrder = "asc",
      } = request.data;

      if (!category) {
        throw new HttpsError(
          "invalid-argument",
          "Category parameter is required"
        );
      }

      const db = admin.firestore();
      let query: admin.firestore.Query = db.collection("pharma_products");

      // Construire la requête en fonction des paramètres fournis
      if (category) {
        query = query.where("categorie", "==", category);
      }

      // Ajouter les filtres de sous-catégories si fournis
      if (subCategory1) {
        query = query.where("sous_categorie_1", "==", subCategory1);
      }
      if (subCategory2) {
        query = query.where("sous_categorie_2", "==", subCategory2);
      }
      if (subCategory3) {
        query = query.where("sous_categorie_3", "==", subCategory3);
      }

      // Get total count for this category
      const countSnapshot = await query.count().get();
      const total = countSnapshot.data().count;

      // Get paginated products for this category
      const productsSnapshot = await query
        .orderBy(sortBy, sortOrder)
        .offset((page - 1) * limit)
        .limit(limit)
        .get();

      const products = await Promise.all(
        productsSnapshot.docs.map(async (doc) => {
          const productData = { ...doc.data(), id: doc.id } as Product;
          const bucketName = "pharma_images";
          const imageUrls = await listImagesForCip(
            bucketName,
            productData.codereferent,
            3600
          );
          return {
            ...productData,
            images: imageUrls.length > 0 ? imageUrls : [],
            image_url:
              imageUrls.length > 0 ? imageUrls[0] : productData.image_url,
          };
        })
      );

      return {
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      };
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw new HttpsError("internal", "Error fetching products by category");
    }
  }
);

export const getCategories = onRequest(
  {
    region: "europe-west9",
    maxInstances: 10,
  },
  async (req, res) => {
    // Enable CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    // Validate token
    const tokenId = await validateAndExtractToken(req.headers.authorization);
    if (!tokenId) {
      res.status(401).json({ error: "Invalid or missing token" });
      return;
    }

    try {
      const db = admin.firestore();
      const snapshot = await db.collection("pharma_products").get();

      const categories = new Set<string>();
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.categorie) {
          categories.add(data.categorie);
        }
      });

      await trackTokenUsage(tokenId, "getCategories", Date.now(), true);
      res.json(Array.from(categories).sort());
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export const getSubCategories1 = onRequest(
  {
    region: "europe-west9",
    maxInstances: 10,
  },
  async (req, res) => {
    // Enable CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    // Validate token
    const tokenId = await validateAndExtractToken(req.headers.authorization);
    if (!tokenId) {
      res.status(401).json({ error: "Invalid or missing token" });
      return;
    }

    const category = req.query.category as string;
    if (!category) {
      res.status(400).json({ error: "Category parameter is required" });
      return;
    }

    try {
      const db = admin.firestore();
      const snapshot = await db
        .collection("pharma_products")
        .where("categorie", "==", category)
        .get();

      const subCategories = new Set<string>();
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.sous_categorie_1) {
          subCategories.add(data.sous_categorie_1);
        }
      });

      await trackTokenUsage(tokenId, "getSubCategories1", Date.now(), true);
      res.json(Array.from(subCategories).sort());
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export const getSubCategories2 = onRequest(
  {
    region: "europe-west9",
    maxInstances: 10,
  },
  async (req, res) => {
    // Enable CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    // Validate token
    const tokenId = await validateAndExtractToken(req.headers.authorization);
    if (!tokenId) {
      res.status(401).json({ error: "Invalid or missing token" });
      return;
    }

    const category = req.query.category as string;
    const subCategory1 = req.query.subCategory1 as string;
    if (!category || !subCategory1) {
      res
        .status(400)
        .json({ error: "Category and subCategory1 parameters are required" });
      return;
    }

    try {
      const db = admin.firestore();
      const snapshot = await db
        .collection("pharma_products")
        .where("categorie", "==", category)
        .where("sous_categorie_1", "==", subCategory1)
        .get();

      const subCategories = new Set<string>();
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.sous_categorie_2) {
          subCategories.add(data.sous_categorie_2);
        }
      });

      await trackTokenUsage(tokenId, "getSubCategories2", Date.now(), true);
      res.json(Array.from(subCategories).sort());
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export const getBrands = onRequest(
  {
    region: "europe-west9",
    maxInstances: 10,
  },
  async (req, res) => {
    // Enable CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    // Validate token
    const tokenId = await validateAndExtractToken(req.headers.authorization);
    if (!tokenId) {
      res.status(401).json({ error: "Invalid or missing token" });
      return;
    }

    try {
      const db = admin.firestore();
      const snapshot = await db.collection("pharma_products").get();

      const brands = new Set<string>();
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.brand) {
          brands.add(data.brand);
        }
      });

      await trackTokenUsage(tokenId, "getBrands", Date.now(), true);
      res.json(Array.from(brands).sort());
    } catch (error) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export const getProductById = onCall(
  {
    region: "europe-west9",
    maxInstances: 10,
    memory: "256MiB",
  },
  async (request) => {
    try {
      const { id } = request.data;
      if (!id) {
        throw new HttpsError("invalid-argument", "Product ID is required");
      }

      const db = admin.firestore();
      const productDoc = await db.collection("pharma_products").doc(id).get();

      if (!productDoc.exists) {
        throw new HttpsError("not-found", "Product not found");
      }

      const productData = productDoc.data() as Product;
      const bucketName = "pharma_images";
      const imageUrls = await listImagesForCip(
        bucketName,
        productData.codereferent,
        3600
      );

      // Supprimer l'ID des données brutes s'il existe
      const { id: _, ...dataWithoutId } = productData;

      // Créer l'objet final avec le bon ID
      return Object.assign({}, dataWithoutId, {
        id: productDoc.id,
        images: imageUrls.length > 0 ? imageUrls : [],
        image_url: imageUrls.length > 0 ? imageUrls[0] : null,
      }) as Product;
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      throw new HttpsError("internal", "Error fetching product");
    }
  }
);

export const searchProducts = onCall(
  {
    region: "europe-west9",
    maxInstances: 10,
  },
  async (request) => {
    try {
      // Vérifier l'origine de la requête
      const origin =
        request.rawRequest.headers.origin || request.rawRequest.headers.referer;
      if (
        !origin ||
        !ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed))
      ) {
        throw new HttpsError("permission-denied", "Origin not allowed");
      }

      const { query } = request.data;
      if (!query || typeof query !== "string") {
        throw new HttpsError(
          "invalid-argument",
          "Query parameter is required and must be a string"
        );
      }

      const db = admin.firestore();
      const searchQuery = query.toLowerCase();

      // Rechercher les produits dont le code référent contient la chaîne de recherche
      const productsSnapshot = await db
        .collection("pharma_products")
        .where("codereferent", ">=", searchQuery)
        .where("codereferent", "<=", searchQuery + "\uf8ff")
        .limit(20)
        .get();

      const products = await Promise.all(
        productsSnapshot.docs.map(async (doc) => {
          const productData = { ...doc.data(), id: doc.id } as Product;
          const bucketName = "pharma_images";
          const imageUrls = await listImagesForCip(
            bucketName,
            productData.codereferent,
            3600
          );
          return {
            ...productData,
            images: imageUrls.length > 0 ? imageUrls : [],
            image_url:
              imageUrls.length > 0 ? imageUrls[0] : productData.image_url,
          };
        })
      );

      return {
        products,
      };
    } catch (error) {
      console.error("Error searching products:", error);
      throw new HttpsError("internal", "Error searching products");
    }
  }
);

export const listProductSlugs = onRequest(
  { region: "europe-west9", memory: "256MiB", timeoutSeconds: 60 },
  async (req, res) => {
    try {
      // Ne gérer que les GET
      if (req.method !== "GET") {
        res.status(405).send("Method Not Allowed");
        return;
      }

      // Récupère uniquement le champ last_update pour chaque doc
      const snapshot = await admin
        .firestore()
        .collection("pharma_products")
        .select("last_update")
        .get();

      const slugs = snapshot.docs.map((doc) => {
        const ts = doc.get("last_update");
        let formattedDate;
        
        if (ts?.toDate) {
          // Si c'est un Timestamp Firestore
          formattedDate = ts.toDate().toISOString().split("T")[0];
        } else if (ts instanceof Date) {
          // Si c'est déjà une Date
          formattedDate = ts.toISOString().split("T")[0];
        } else if (typeof ts === 'string') {
          // Si c'est une chaîne de caractères
          formattedDate = ts;
        }

        return {
          id: doc.id,
          last_update: formattedDate || undefined,
        };
      });

      // Cache côté CDN / build (1 h)
      res.set("Cache-Control", "public, max-age=3600");
      res.json(slugs);
    } catch (err) {
      console.error("Error listing product slugs:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);
