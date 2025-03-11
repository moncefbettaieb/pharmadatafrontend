import { onCall, HttpsError } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import * as nodemailer from 'nodemailer'

// Configurer le transporteur d'email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

export const sendSupportEmail = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'L\'utilisateur doit être authentifié')
  }

  const { subject, message, sessionId } = request.data
  if (!subject || !message || !sessionId) {
    throw new HttpsError('invalid-argument', 'Sujet, message et ID de session requis')
  }

  try {
    const db = admin.firestore()
    const userId = request.auth.uid

    // Récupérer les informations de l'utilisateur
    const userDoc = await db.collection('users').doc(userId).get()
    const userData = userDoc.data()

    // Récupérer les informations de la session
    const sessionDoc = await db.collection('product_payment_sessions').doc(sessionId).get()
    if (!sessionDoc.exists) {
      throw new HttpsError('not-found', 'Session non trouvée')
    }
    const sessionData = sessionDoc.data()

    // Créer le ticket de support
    const ticketRef = await db.collection('support_tickets').add({
      userId,
      userEmail: userData?.email || request.auth.token.email,
      sessionId,
      subject,
      message,
      status: 'new',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })

    // Envoyer l'email au support
    const emailContent = `
      Nouveau ticket de support #${ticketRef.id}
      
      De: ${userData?.email || request.auth.token.email}
      Session ID: ${sessionId}
      Sujet: ${subject}
      
      Message:
      ${message}
      
      Détails de la session:
      - Statut: ${sessionData?.status}
      - Créée le: ${sessionData?.createdAt.toDate().toLocaleString()}
      - Montant: ${sessionData?.amount / 100}€
    `

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SUPPORT_EMAIL,
      subject: `[Support] ${subject}`,
      text: emailContent
    })

    // Créer une notification pour l'utilisateur
    await db.collection('notifications').add({
      userId,
      title: 'Ticket de support créé',
      message: 'Votre message a été envoyé au support. Nous vous répondrons dans les plus brefs délais.',
      type: 'info',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })

    return {
      success: true,
      ticketId: ticketRef.id
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email au support:', error)
    throw new HttpsError('internal', 'Erreur lors de l\'envoi de l\'email au support')
  }
})