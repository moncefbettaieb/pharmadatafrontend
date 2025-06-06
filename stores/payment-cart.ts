import { defineStore } from "pinia";
import { loadStripe } from "@stripe/stripe-js";
import { httpsCallable } from "firebase/functions";

interface CartItem {
  productId: string;
  title: string;
  short_desc: string;
  image_url?: string;
  codereferent: string;
}

type FileFormat = "json" | "pdf";

export const usePaymentCartStore = defineStore("paymentCart", {
  state: () => ({
    loading: false,
    error: null as string | null,
    downloadUrls: [] as string[],
    zipUrl: null as string | null,
    selectedFormat: "pdf" as FileFormat,
  }),

  actions: {
    async createProductPaymentSession(items: CartItem[]) {
      this.loading = true;
      this.error = null;

      try {
        const { $firebaseFunctions } = useNuxtApp();
        if (!$firebaseFunctions) {
          throw new Error("Firebase Functions non initialisé");
        }

        // Filtrer les items invalides
        const validItems = items.filter((item) => item.productId);
        if (validItems.length === 0) {
          throw new Error("Aucun produit valide dans le panier");
        }

        if (validItems.length !== items.length) {
          console.warn(
            `${
              items.length - validItems.length
            } produit(s) invalide(s) ont été retirés du panier`
          );
        }

        // Appeler la Cloud Function pour créer la session
        const createSessionCall = httpsCallable(
          $firebaseFunctions,
          "createProductPaymentSession"
        );
        const result = await createSessionCall({
          items: validItems.map((item) => ({
            productId: item.productId,
            title: item.title,
            codereferent: item.codereferent,
          })),
        });

        const { sessionId } = result.data as { sessionId: string };

        // Obtenir la clé publique Stripe depuis la Cloud Function
        const getStripeInfoCall = httpsCallable(
          $firebaseFunctions,
          "getStripeRedirectUrl"
        );
        const stripeInfoResult = await getStripeInfoCall({ sessionId });

        const stripeInfo = stripeInfoResult.data as any;
        if (!stripeInfo.publicKey || !stripeInfo.sessionId) {
          throw new Error("Informations Stripe incomplètes");
        }

        // Initialiser Stripe avec la clé publique récupérée du serveur
        const stripe = await loadStripe(stripeInfo.publicKey);
        if (!stripe) {
          throw new Error("Erreur lors du chargement de Stripe");
        }

        // Rediriger vers la page de paiement Stripe
        const { error } = await stripe.redirectToCheckout({
          sessionId: stripeInfo.sessionId,
        });

        if (error) {
          throw error;
        }
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getProductFiles(sessionId: string, format: FileFormat = "json") {
      this.loading = true;
      this.error = null;
      this.selectedFormat = format;
      this.zipUrl = null;

      try {
        const { $firebaseFunctions } = useNuxtApp();
        if (!$firebaseFunctions) {
          throw new Error("Firebase Functions non initialisé");
        }

        const getFilesCall = httpsCallable(
          $firebaseFunctions,
          "getProductFiles"
        );
        const result = await getFilesCall({ sessionId, format });

        const { files } = result.data as { files: string[] };
        this.downloadUrls = files;

        return files;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getProductFilesAsZip(sessionId: string, format: FileFormat = "json") {
      this.loading = true;
      this.error = null;
      this.selectedFormat = format;

      try {
        const { $firebaseFunctions } = useNuxtApp();
        if (!$firebaseFunctions) {
          throw new Error("Firebase Functions non initialisé");
        }

        const getZipCall = httpsCallable(
          $firebaseFunctions,
          "getProductFilesAsZip"
        );
        const result = await getZipCall({ sessionId, format });

        const { zipUrl } = result.data as { zipUrl: string };
        this.zipUrl = zipUrl;

        return zipUrl;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    setFileFormat(format: FileFormat) {
      this.selectedFormat = format;
    },
  },
});
