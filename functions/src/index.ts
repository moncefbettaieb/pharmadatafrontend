import * as admin from "firebase-admin";
import {
  generateToken,
  revokeToken,
  getTokenHistory,
  getToken,
} from "./api/tokens";
import { getApiUsage } from "./api/usage";
import {
  getProducts,
  getProductById,
  getProductByCip,
  getBrands,
  getProductsByBrand,
  getCategories,
  getProductsByCategory,
  getSubCategories1,
  getSubCategories2,
  searchProducts,
  listProductSlugs,
} from "./api/products";
import { trackApiUsage, getApiStats } from "./api/stats";
import { createProductPaymentSession } from "./api/product-payment";
import {
  createSubscription,
  createLifetimeSession,
} from "./api/subscription-payment";
import { handleStripeWebhook } from "./api/webhook";
import { getProductFiles, getProductFilesAsZip } from "./api/product-files";
import { sendSupportEmail, sendContactEmail } from "./api/support";
import { rateLimit } from "./utils/rate-limit";
import { getStripeRedirectUrl } from "./api/stripe-redirect";
import {
  getNotifications,
  markNotificationAsRead,
  createNotification,
  deleteNotification,
} from "./api/notifications";
import {
  trackApiCall,
  getApiAnalytics,
  getEndpointPerformance,
} from "./api/analytics";
import {
  reportError,
  getErrorReports,
  updateErrorReport,
  deleteErrorReport,
} from "./api/error-reporting";

admin.initializeApp();

// Exporter les fonctions
export {
  generateToken,
  getToken,
  revokeToken,
  getTokenHistory,
  getApiUsage,
  getProducts,
  getProductById,
  getProductByCip,
  getBrands,
  getProductsByBrand,
  getCategories,
  getProductsByCategory,
  getSubCategories1,
  getSubCategories2,
  searchProducts,
  listProductSlugs,
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
  createProductPaymentSession,
  createSubscription,
  createLifetimeSession,
  getProductFiles,
  getProductFilesAsZip,
  sendSupportEmail,
  sendContactEmail,
  rateLimit,
  getStripeRedirectUrl,
};
