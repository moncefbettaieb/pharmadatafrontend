import { onCall, HttpsError } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'

interface ErrorReportBase {
  message: string
  stack?: string
  context?: {
    url?: string
    userAgent?: string
    timestamp: number
    [key: string]: any
  }
  metadata?: {
    [key: string]: any
  }
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'new' | 'investigating' | 'resolved'
}

interface ErrorReportDocument extends ErrorReportBase {
  userId: string
  createdAt: FirebaseFirestore.Timestamp
  updatedAt?: FirebaseFirestore.Timestamp
}

interface ErrorReportResponse extends ErrorReportBase {
  id: string
  userId: string
  createdAt: string
  updatedAt?: string
}

interface ErrorStats {
  total: number
  bySeverity: Record<string, number>
  byStatus: Record<string, number>
}

export const reportError = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  const { message, stack, context, metadata, severity = 'medium' } = request.data as ErrorReportBase

  if (!message) {
    throw new HttpsError('invalid-argument', 'Le message d\'erreur est requis')
  }

  try {
    const db = admin.firestore()
    const userId = request.auth.uid

    const errorReport: ErrorReportDocument = {
      message,
      stack,
      context: {
        ...context,
        timestamp: Date.now()
      },
      metadata,
      severity,
      status: 'new',
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp
    }

    const reportRef = await db.collection('error_reports').add(errorReport)

    if (severity === 'critical') {
      await db.collection('admin_notifications').add({
        type: 'error_report',
        message: `Erreur critique détectée: ${message}`,
        errorReportId: reportRef.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'unread'
      })
    }

    return {
      success: true,
      reportId: reportRef.id
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du rapport:', error)
    throw new HttpsError('internal', 'Erreur lors de l\'enregistrement du rapport')
  }
})

export const getErrorReports = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  const { status, severity, startDate, endDate, limit = 50 } = request.data || {}

  try {
    const db = admin.firestore()
    const userId = request.auth.uid

    let query = db.collection('error_reports')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')

    if (status) {
      query = query.where('status', '==', status)
    }
    if (severity) {
      query = query.where('severity', '==', severity)
    }
    if (startDate) {
      query = query.where('createdAt', '>=', new Date(startDate))
    }
    if (endDate) {
      query = query.where('createdAt', '<=', new Date(endDate))
    }

    const snapshot = await query.limit(limit).get()

    const reports: ErrorReportResponse[] = snapshot.docs.map(doc => {
      const data = doc.data() as ErrorReportDocument
      return {
        id: doc.id,
        message: data.message,
        stack: data.stack,
        context: data.context,
        metadata: data.metadata,
        severity: data.severity,
        status: data.status,
        userId: data.userId,
        createdAt: data.createdAt.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString()
      }
    })

    const stats: ErrorStats = {
      total: reports.length,
      bySeverity: reports.reduce<Record<string, number>>((acc, report) => {
        acc[report.severity] = (acc[report.severity] || 0) + 1
        return acc
      }, {}),
      byStatus: reports.reduce<Record<string, number>>((acc, report) => {
        acc[report.status] = (acc[report.status] || 0) + 1
        return acc
      }, {})
    }

    return { reports, stats }
  } catch (error) {
    console.error('Erreur lors de la récupération des rapports:', error)
    throw new HttpsError('internal', 'Erreur lors de la récupération des rapports')
  }
})

export const updateErrorReport = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  const { reportId, status, notes } = request.data

  if (!reportId || !status) {
    throw new HttpsError('invalid-argument', 'ID du rapport et statut requis')
  }

  try {
    const db = admin.firestore()
    const userId = request.auth.uid

    const reportRef = db.collection('error_reports').doc(reportId)
    const report = await reportRef.get()

    if (!report.exists) {
      throw new HttpsError('not-found', 'Rapport non trouvé')
    }

    const reportData = report.data() as ErrorReportDocument
    if (reportData.userId !== userId) {
      throw new HttpsError('permission-denied', 'Accès non autorisé à ce rapport')
    }

    await reportRef.update({
      status,
      notes,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    return { success: true }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rapport:', error)
    throw new HttpsError('internal', 'Erreur lors de la mise à jour du rapport')
  }
})

export const deleteErrorReport = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  const { reportId } = request.data

  if (!reportId) {
    throw new HttpsError('invalid-argument', 'ID du rapport requis')
  }

  try {
    const db = admin.firestore()
    const userId = request.auth.uid

    const reportRef = db.collection('error_reports').doc(reportId)
    const report = await reportRef.get()

    if (!report.exists) {
      throw new HttpsError('not-found', 'Rapport non trouvé')
    }

    const reportData = report.data() as ErrorReportDocument
    if (reportData.userId !== userId) {
      throw new HttpsError('permission-denied', 'Accès non autorisé à ce rapport')
    }

    await reportRef.delete()

    return { success: true }
  } catch (error) {
    console.error('Erreur lors de la suppression du rapport:', error)
    throw new HttpsError('internal', 'Erreur lors de la suppression du rapport')
  }
})