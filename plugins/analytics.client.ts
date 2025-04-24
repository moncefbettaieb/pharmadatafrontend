// Types pour Axeptio et Plausible
interface AxeptioInstance {
  on(event: string, callback: (consent: boolean) => void): void;
}

declare global {
  interface Window {
    axeptioSettings: {
      clientId: string;
      cookiesVersion: string;
      blockedVendors: string[];
    };
    _axcb: ((axeptio: AxeptioInstance) => void)[];
    plausible?: (event: string) => void;
  }
}

export default defineNuxtPlugin(() => {
  if (!process.client) return;

  // Configuration Axeptio pour Plausible
  window.axeptioSettings = {
    clientId: process.env.NUXT_PUBLIC_AXEPTIO_ID as string,
    cookiesVersion: "pharmaData-base",
    blockedVendors: ["plausible"]  // Bloquer Plausible par défaut
  };

  // Écouter les changements de consentement
  window._axcb = window._axcb || [];
  window._axcb.push((axeptio: AxeptioInstance) => {
    // Initialiser Plausible uniquement si le consentement est donné
    axeptio.on("consent:plausible", (consent: boolean) => {
      if (consent) {
        window.plausible && window.plausible("pageview");
      }
    });
  });
});
