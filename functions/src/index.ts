import * as admin from 'firebase-admin'
import { generateToken, revokeToken } from './api/tokens'
import { getApiUsage } from './api/usage'
import { getProducts, getProductByCip } from './api/products'
import { trackApiUsage, getApiStats } from './api/stats'
import { createProductPaymentSession} from './api/product-payment'
import { createSubscription} from './api/subscription-payment'
import { handleStripeWebhook} from './api/webhook'
import { getProductFiles } from './api/product-files'
import { sendSupportEmail } from './api/support'
import { 
  getNotifications, 
  markNotificationAsRead, 
  createNotification, 
  deleteNotification 
} from './api/notifications'
import {
  trackApiCall,
  getApiAnalytics,
  getEndpointPerformance
} from './api/analytics'
import {
  reportError,
  getErrorReports,
  updateErrorReport,
  deleteErrorReport
} from './api/error-reporting'

admin.initializeApp()

// Exporter les fonctions
export {
  generateToken,
  revokeToken,
  getApiUsage,
  getProducts,
  handleStripeWebhook,
  trackApiUsage,
  getApiStats,
  getNotifications,
  markNotificationAsRead,
  createNotification,
  deleteNotification,
  trackApiCall,
  getApiAnalytics,
  getEndpointPerformance,
  reportError,
  getErrorReports,
  updateErrorReport,
  deleteErrorReport,
  getProductByCip,
  createProductPaymentSession,
  createSubscription,
  getProductFiles,
  sendSupportEmail
}