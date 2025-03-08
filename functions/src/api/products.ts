import { onRequest } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'

interface Product {
  id: string
  cip_code: string
  brand: string
  title: string
  category: string
  sub_category1: string
  sub_category2: string
  short_desc: string
  active: boolean
}

interface ProductResponse {
  products: Product[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasMore: boolean
  }
}

interface ProductFilters {
  category?: string
  subCategory1?: string
  subCategory2?: string
  brand?: string
}

async function incrementTokenUsage(tokenDoc: FirebaseFirestore.DocumentSnapshot, endpoint: string): Promise<void> {
  const db = admin.firestore()
  const userId = tokenDoc.data()?.userId

  if (!userId) {
    throw new Error('User ID not found in token data')
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const usageRef = db.collection('api_usage')
    .doc(`${userId}_${today.toISOString().split('T')[0]}`)

  await db.runTransaction(async (transaction) => {
    const usageDoc = await transaction.get(usageRef)

    if (!usageDoc.exists) {
      transaction.set(usageRef, {
        userId,
        date: today,
        requests: 1,
        endpoints: {
          [endpoint]: 1
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      })
    } else {
      transaction.update(usageRef, {
        requests: admin.firestore.FieldValue.increment(1),
        [`endpoints.${endpoint}`]: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })
    }

    // Mettre à jour la dernière utilisation du token
    transaction.update(tokenDoc.ref, {
      lastUsed: admin.firestore.FieldValue.serverTimestamp()
    })
  })
}

export const getProductByCip = onRequest({
  region: 'europe-west9',
  maxInstances: 10
}, async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed')
    return
  }

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).send('Unauthorized')
    return
  }

  const token = authHeader.split('Bearer ')[1]
  const cipCode = req.query.cip as string

  if (!cipCode) {
    res.status(400).json({ error: 'CIP code is required' })
    return
  }

  try {
    const db = admin.firestore()

    // Vérifier le token
    const tokensSnapshot = await db.collection('api_tokens')
      .where('token', '==', token)
      .where('isRevoked', '==', false)
      .limit(1)
      .get()

    if (tokensSnapshot.empty) {
      res.status(401).send('Invalid token')
      return
    }

    const tokenDoc = tokensSnapshot.docs[0]

    // Incrémenter l'utilisation du token
    await incrementTokenUsage(tokenDoc, 'getProductByCip')

    // Rechercher le produit par CIP
    const productsSnapshot = await db.collection('final_pharma_table')
      .where('cip_code', '==', cipCode)
      .limit(1)
      .get()

    if (productsSnapshot.empty) {
      res.status(404).json({ error: 'Product not found' })
      return
    }

    const productDoc = productsSnapshot.docs[0]
    const productData = productDoc.data() as Product

    res.json({
      ...productData,
      id: productDoc.id
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

export const getProducts = onRequest({
  region: 'europe-west9',
  maxInstances: 10
}, async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed')
    return
  }

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).send('Unauthorized')
    return
  }

  const token = authHeader.split('Bearer ')[1]

  try {
    const db = admin.firestore()

    // Vérifier le token
    const tokensSnapshot = await db.collection('api_tokens')
      .where('token', '==', token)
      .where('isRevoked', '==', false)
      .limit(1)
      .get()

    if (tokensSnapshot.empty) {
      res.status(401).send('Invalid token')
      return
    }

    const tokenDoc = tokensSnapshot.docs[0]

    // Incrémenter l'utilisation du token
    await incrementTokenUsage(tokenDoc, 'getProducts')

    // Paramètres de pagination
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100)
    const sortBy = (req.query.sortBy as string) || 'title'
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc'
    const offset = (page - 1) * limit

    // Construire la requête de base
    let query = db.collection('final_pharma_table')
      .limit(limit)
      //.where('active', '==', true)

    // Appliquer les filtres
    const filters: ProductFilters = {
      category: req.query.category as string,
      subCategory1: req.query.subCategory1 as string,
      subCategory2: req.query.subCategory2 as string,
      brand: req.query.brand as string
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        query = query.where(key, '==', value)
      }
    })

    // Ajouter le tri
    query = query.orderBy(sortBy, sortOrder)

    // Obtenir le nombre total de produits pour la pagination
    const totalQuery = query.count()
    const [productsSnapshot, totalSnapshot] = await Promise.all([
      query.limit(limit).offset(offset).get(),
      totalQuery.get()
    ])

    const total = totalSnapshot.data().count
    const totalPages = Math.ceil(total / limit)

    const products = productsSnapshot.docs.map(doc => ({
      ...doc.data() as Product,
      id: doc.id
    }))

    const responseData: ProductResponse = {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages
      }
    }

    res.json(responseData)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})