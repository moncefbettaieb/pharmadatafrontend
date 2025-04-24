import { httpsCallable, getFunctions } from "firebase/functions";
import type { Product } from "~/types/product";

export const getProductByCip = async (codeReferent: string): Promise<Product | null> => {
  try {
    const functions = getFunctions(undefined, 'europe-west9');
    const getProductByCipCall = httpsCallable(functions, "getProductByCip");
    const result = await getProductByCipCall({ codeReferent });

    if (!result.data || typeof result.data !== "object") {
      return null;
    }

    return result.data as Product;
  } catch (error) {
    console.error("Error fetching product by CIP:", error);
    return null;
  }
}; 