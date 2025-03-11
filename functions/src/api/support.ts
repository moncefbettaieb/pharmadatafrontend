import { onCall, HttpsError } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import { defineBoolean, defineString } from 'firebase-functions/params'
import * as nodemailer from 'nodemailer'

// Récupérer la configuration SMTP depuis Firebase
// Paramètres simples (texte, chiffres, etc.)
const SMTP_HOST = defineString('SMTP_HOST')
const SMTP_PORT = defineString('SMTP_PORT')
const SMTP_USER = defineString('SMTP_USER')
const SMTP_SECURE = defineBoolean('SMTP_SECURE')
const SMTP_PASS = defineString('SMTP_PASS')

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

  const smtpHost = SMTP_HOST.value() || 'smtp.gmail.com'
  const smtpPort = SMTP_PORT.value() || '587'
  const smtpSecure = SMTP_SECURE.value()|| false
  const smtpUser = SMTP_USER.value()
  const smtpPass = SMTP_PASS.value()

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

    const smtpConfig = {
        host: smtpHost,
        port: parseInt(smtpPort, 10),
        secure: smtpSecure, // dépend du port
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false
        }
      }

      console.log('Configuration SMTP:', {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        user: smtpConfig.auth.user,
        // Ne pas logger le mot de passe pour des raisons de sécurité
      })

    // Créer le transporteur SMTP
    const transporter = nodemailer.createTransport(smtpConfig)
    console.log('Transporter créé:', transporter)

    // Vérifier la connexion SMTP
    try {
      await transporter.verify()
      console.log('Connexion SMTP vérifiée avec succès')
    } catch (error) {
      console.error('Erreur de vérification SMTP:', error)
      throw new Error('Erreur de connexion au serveur SMTP')
    }

    // Préparer et envoyer l'email
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
      - Montant: ${sessionData?.amount} €
    `

    const mailOptions = {
      from: smtpUser,
      to: smtpUser,
      subject: `[Support] ${subject}`,
      text: emailContent,
      headers: {
        'X-Ticket-ID': ticketRef.id,
        'X-Session-ID': sessionId
      }
    }

    console.log('Envoi de l\'email avec les options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    })

    await transporter.sendMail(mailOptions)
    console.log('Email envoyé avec succès')

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