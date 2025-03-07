import { onCall, HttpsError } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'

interface NotificationData {
  userId: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  read: boolean
  createdAt: FirebaseFirestore.Timestamp
}

export const getNotifications = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  try {
    const db = admin.firestore()
    const userId = request.auth.uid

    const notificationsSnapshot = await db.collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()

    const notifications = notificationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as NotificationData
    }))

    return { notifications }
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error)
    throw new HttpsError('internal', 'Erreur lors de la récupération des notifications')
  }
})

export const markNotificationAsRead = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  const { notificationId } = request.data

  if (!notificationId) {
    throw new HttpsError('invalid-argument', 'ID de notification manquant')
  }

  try {
    const db = admin.firestore()
    const userId = request.auth.uid

    const notificationRef = db.collection('notifications').doc(notificationId)
    const notification = await notificationRef.get()

    if (!notification.exists) {
      throw new HttpsError('not-found', 'Notification non trouvée')
    }

    const notificationData = notification.data() as NotificationData
    if (notificationData.userId !== userId) {
      throw new HttpsError('permission-denied', 'Accès non autorisé à cette notification')
    }

    await notificationRef.update({
      read: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    return { success: true }
  } catch (error) {
    console.error('Erreur lors du marquage de la notification:', error)
    throw new HttpsError('internal', 'Erreur lors du marquage de la notification comme lue')
  }
})

export const createNotification = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  const { title, message, type = 'info' } = request.data

  if (!title || !message) {
    throw new HttpsError('invalid-argument', 'Titre et message requis')
  }

  try {
    const db = admin.firestore()
    const userId = request.auth.uid

    const notification: Omit<NotificationData, 'id'> = {
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp
    }

    const notificationRef = await db.collection('notifications').add(notification)

    return {
      id: notificationRef.id,
      success: true
    }
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error)
    throw new HttpsError('internal', 'Erreur lors de la création de la notification')
  }
})

export const deleteNotification = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  const { notificationId } = request.data

  if (!notificationId) {
    throw new HttpsError('invalid-argument', 'ID de notification manquant')
  }

  try {
    const db = admin.firestore()
    const userId = request.auth.uid

    const notificationRef = db.collection('notifications').doc(notificationId)
    const notification = await notificationRef.get()

    if (!notification.exists) {
      throw new HttpsError('not-found', 'Notification non trouvée')
    }

    const notificationData = notification.data() as NotificationData
    if (notificationData.userId !== userId) {
      throw new HttpsError('permission-denied', 'Accès non autorisé à cette notification')
    }

    await notificationRef.delete()

    return { success: true }
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error)
    throw new HttpsError('internal', 'Erreur lors de la suppression de la notification')
  }
})