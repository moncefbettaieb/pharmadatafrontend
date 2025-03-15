import { onRequest, onCall, HttpsError } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import { Storage, GetSignedUrlConfig } from '@google-cloud/storage'

interface Product {
  id: string
  cip_code: string
  brand: string
  title: string
  category: string
  sub_category1: string
  sub_category2: string
  short_desc: string
  image_url: string
  images?: string[]
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
  console.log(`Recherche des fichiers pour CIP: ${cip}`);

  // 1) Lister tous les fichiers GCS avec un prefix = "<cip>/"
  const [files] = await storage.bucket(bucketName).getFiles({
    prefix: cip + '/', // ex: "0070942904148/"
  });

  if (files.length === 0) {
    console.log(`Aucune image trouvée pour ${cip}`);
    return [];
  }

  console.log(`Fichiers trouvés pour ${cip}:`, files.map(f => f.name));

  // 2) Générer les URLs signées
  const urls = await Promise.all(
    files.map((file) => generateSignedUrl(bucketName, file.name, expirySeconds))
  );

  return urls;
}

async function validateAndExtractToken(authHeader: string | undefined): Promise<string | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split('Bearer ')[1]
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
    const countSnapshot = await db.collection('final_pharma_table')
      .count()
      .get()
    const total = countSnapshot.data().count

    // Get paginated products
    const productsSnapshot = await db.collection('final_pharma_table')
      .orderBy(sortBy, sortOrder)
      .offset((page - 1) * limit)
      .limit(limit)
      .get()

    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[]
    const bucketName = "pharma_images"
    for (const p of products) {
      const imageUrls = await listImagesForCip(bucketName, p.cip_code, 3600)
      console.log(`Images trouvées pour ${p.cip_code}:`, imageUrls)
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

  const cip_code = req.query.cip_code as string
  if (!cip_code) {
    res.status(400).json({ error: 'CIP code is required' })
    return
  }

  try {
    const db = admin.firestore()
    const productDoc = await db.collection('final_pharma_table')
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
    console.log(`Images trouvées pour ${cip_code}:`, imageUrls)
    productData.images = imageUrls.length > 0 ? imageUrls : []
    if (imageUrls.length > 0) {
      productData.image_url = imageUrls[0];
    }
    const product = {
      id: productDoc.docs[0].id,
      ...productData
    }

    await trackTokenUsage(tokenId, 'getProductByCip', Date.now() - startTime, true)
    res.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    await trackTokenUsage(tokenId, 'getProductByCip', Date.now() - startTime, false)
    res.status(500).json({ error: 'Internal server error' })
  }
})