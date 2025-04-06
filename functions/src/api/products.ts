import { onRequest, onCall, HttpsError } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import { Storage, GetSignedUrlConfig } from '@google-cloud/storage'

interface Product {
  cip_code: string
  brand: string
  title: string
  categorie: string
  sous_categorie_1: string
  sous_categorie_2: string
  sous_categorie_3: string
  short_desc: string
  long_desc: string
  image_url: string
  images?: string[]
  taxonomy_category: string
  taxonomy_sub_category1: string
  taxonomy_sub_category2: string
  taxonomy_sub_category3: string
  indication_contre_indication: string
  posologie: string
  presentation: string
  specificites: string
  composition: string
  conditionnement: string
  nombre_d_unites: string
  age_minimum: string
  volume: string
  substance_active: string
  nature_de_produit: string
  label: string
  contre_indication: string
  last_update: string
  
}

interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  category?: string
  subCategory1?: string
  subCategory2?: string
  brand?: string
}

interface ProductsResponse {
  products: Product[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasMore: boolean
  }
}

const storage = new Storage()


async function generateSignedUrl(bucketName: string, filePath: string, expirySeconds = 3600): Promise<string> {
  const options: GetSignedUrlConfig = {
    version: 'v4',
    action: 'read',
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
    prefix: cip + '/', // ex: "0070942904148/"
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

async function validateAndExtractToken(authHeader: string | undefined): Promise<string | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('Invalid or missing Authorization header')
    return null
  }

  const token = authHeader.split('Bearer ')[1]
  if (!token) {
    console.error('Token not found in Authorization header')
    return null
  }
  if (!token) return null

  const tokenDoc = await admin.firestore()
    .collection('api_tokens')
    .where('token', '==', token)
    .where('isRevoked', '==', false)
    .limit(1)
    .get()

  if (tokenDoc.empty) return null
  return tokenDoc.docs[0].id
}

async function trackTokenUsage(tokenId: string, endpoint: string, responseTime: number, success: boolean) {
  const db = admin.firestore()
  const tokenRef = db.collection('api_tokens').doc(tokenId)

  await db.runTransaction(async (transaction) => {
    const tokenDoc = await transaction.get(tokenRef)
    if (!tokenDoc.exists) return

    // Update last used timestamp
    transaction.update(tokenRef, {
      lastUsed: admin.firestore.FieldValue.serverTimestamp()
    })

    // Track API usage
    const usageRef = db.collection('api_usage').doc()
    transaction.set(usageRef, {
      userId: tokenDoc.data()?.userId,
      tokenId,
      endpoint,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      responseTime,
      success
    })
  })
}

export const getProducts = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {
  
  try {
    const db = admin.firestore()
    const {
      page = 1,
      limit = 12,
      sortBy = 'title',
      sortOrder = 'asc'
    } = request.data || {} as PaginationParams

    // Get total count of active products
    const countSnapshot = await db.collection('pharma_products')
      .count()
      .get()
    const total = countSnapshot.data().count

    // Get paginated products
    const productsSnapshot = await db.collection('pharma_products')
      .orderBy(sortBy, sortOrder)
      .offset((page - 1) * limit)
      .limit(limit)
      .get()

    const products = productsSnapshot.docs.map(doc => ({
      ...doc.data()
    })) as Product[]
    const bucketName = "pharma_images"
    for (const p of products) {
      const imageUrls = await listImagesForCip(bucketName, p.cip_code, 3600)
      p.images = imageUrls.length > 0 ? imageUrls : []
      if (imageUrls.length > 0) {
        p.image_url = imageUrls[0];
      }
    }

    const response: ProductsResponse = {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    }

    return response
  } catch (error) {
    console.error('Error fetching products:', error)
    throw new HttpsError('internal', 'Error fetching products')
  }
})

export const getProductByCip = onRequest({
  region: 'europe-west9',
  maxInstances: 10
}, async (req, res) => {
  const startTime = Date.now()

  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET')
  res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  // Validate token
  const tokenId = await validateAndExtractToken(req.headers.authorization)
  if (!tokenId) {
    res.status(401).json({ error: 'Invalid or missing token' })
    return
  }

  const pathParts = req.path.split('/')
  const cip_code = pathParts[pathParts.length - 1] as string
  if (!cip_code) {
    res.status(400).json({ error: 'CIP code is required' })
    return
  }

  try {
    const db = admin.firestore()
    const productDoc = await db.collection('pharma_products')
      .where('cip_code', '==', cip_code)
      .limit(1)
      .get()

    if (productDoc.empty) {
      await trackTokenUsage(tokenId, 'getProductByCip', Date.now() - startTime, false)
      res.status(404).json({ error: 'Product not found' })
      return
    }

    const productData = productDoc.docs[0].data() as Omit<Product, 'id'>

    const bucketName = "pharma_images"
    const imageUrls = await listImagesForCip(bucketName, cip_code, 3600)
    productData.images = imageUrls.length > 0 ? imageUrls : []
    if (imageUrls.length > 0) {
      productData.image_url = imageUrls[0];
    }
    // Construct the product object with the ID
    const product = productDoc.docs[0].data() as Product
    console.log('Product data:', productData)

    await trackTokenUsage(tokenId, 'getProductByCip', Date.now() - startTime, true)
    res.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    await trackTokenUsage(tokenId, 'getProductByCip', Date.now() - startTime, false)
    res.status(500).json({ error: 'Internal server error' })
  }
})