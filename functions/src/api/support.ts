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
  if (!subject || !message) {
    throw new HttpsError('invalid-argument', 'Sujet et message requis')
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

    let sessionData: any = null
    // Récupérer les informations de la session (si elle existe)
    if (sessionId) {
      const sessionDoc = await db.collection('product_payment_sessions').doc(sessionId).get()
      if (sessionDoc.exists) {
        sessionData = sessionDoc.data()
      } else {
        console.warn(`Session ${sessionId} non trouvée dans la base de données`)
      }
    } else {
      console.warn('Aucun ID de session fourni')
    }

    // Créer le ticket de support même si la session n'existe pas
    const ticketRef = await db.collection('support_tickets').add({
      userId,
      userEmail: userData?.email || request.auth.token.email,
      sessionId: sessionId || 'non-spécifié',
      subject,
      message,
      status: 'new',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })

    console.log('Ticket de support créé:', ticketRef.id)

    // Configuration SMTP
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
      host: smtpHost, 
      port: smtpPort, 
      secure: smtpSecure,
      user: smtpUser ? 'défini' : 'non défini',
      pass: smtpPass ? 'défini' : 'non défini'
    })

    // Créer le transporteur SMTP
    const transporter = nodemailer.createTransport(smtpConfig)

    try {
      console.log('Vérification de la connexion SMTP...')
      await transporter.verify()
      console.log('Connexion SMTP vérifiée avec succès')
    } catch (error: any) {
      console.error('Erreur de vérification SMTP:', error)
      throw new Error('Erreur de connexion au serveur SMTP: ' + (error.message || 'Raison inconnue'))
    }

    // Préparer et envoyer l'email
    const emailContent = `
      Nouveau ticket de support #${ticketRef.id}
      
      De: ${userData?.email || request.auth.token.email}
      Session ID: ${sessionId || 'Non spécifié'}
      Sujet: ${subject}
      
      Message:
      ${message}
      
      ${sessionData ? `
      Détails de la session:
      - Statut: ${sessionData?.status}
      - Créée le: ${sessionData?.createdAt?.toDate().toLocaleString() || 'non disponible'}
      - Montant: ${sessionData?.amount || 'non disponible'} €
      ` : 'Aucune information de session disponible'}
    `

    const mailOptions = {
      from: smtpUser,
      to: smtpUser,
      subject: `[Support] ${subject}`,
      text: emailContent,
      headers: {
        'X-Ticket-ID': ticketRef.id,
        'X-Session-ID': sessionId || 'non-specifie'
      }
    }

    console.log('Envoi de l\'email...')
    const info = await transporter.sendMail(mailOptions)
    console.log('Email envoyé avec succès', info.messageId)

    // Créer une notification pour l'utilisateur
    const notifRef = await db.collection('notifications').add({
      userId,
      title: 'Ticket de support créé',
      message: 'Votre message a été envoyé au support. Nous vous répondrons dans les plus brefs délais.',
      type: 'info',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })

    console.log('Notification créée:', notifRef.id)

    return {
      success: true,
      ticketId: ticketRef.id
    }
  } catch (error: any) {
    console.error('Erreur détaillée lors de l\'envoi de l\'email au support:', error)
    throw new HttpsError('internal', 'Erreur lors de l\'envoi de l\'email au support: ' + (error.message || 'Erreur inconnue'))
  }
})

export const sendContactEmail = onCall({
  region: 'europe-west9',
  maxInstances: 10
}, async (request) => {

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

    const smtpConfig = {
        host: smtpHost,
        port: parseInt(smtpPort, 10),
        secure: smtpSecure,
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false
        }
      }

    const transporter = nodemailer.createTransport(smtpConfig)

    try {
      await transporter.verify()
    } catch (error) {
      console.error('Erreur de vérification SMTP:', error)
      throw new Error('Erreur de connexion au serveur SMTP')
    }

    const mailOptions = {
      from: sessionId,
      to: smtpUser,
      subject: `[Contact] ${subject}`,
      text: message,
      headers: {
        'X-Session-ID': sessionId
      }
    }

    await transporter.sendMail(mailOptions)

    return {
      success: true,
      sessionId: sessionId
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    throw new HttpsError('internal', 'Erreur lors de l\'envoi de l\'email')
  }
})