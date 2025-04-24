import { defineStore } from "pinia";

interface Plan {
  id: string;
  name: string;
  price: number;
  requestsPerMonth: number;
  features: string[];
}

export const usePlansStore = defineStore("plans", {
  state: () => ({
    plans: [
      {
        id: "free",
        name: "Gratuit",
        price: 0,
        requestsPerMonth: 100,
        features: [
          "100 fiches par mois",
          "Documentation complète",
          "Support par email",
          "Idéal pour tester l'API",
        ],
      },
      {
        id: "basic",
        name: "Basique",
        price: 9.99,
        requestsPerMonth: 1000,
        features: [
          "1 000 fiches par mois",
          "Documentation complète",
          "Support par email",
        ],
      },
      {
        id: "pro",
        name: "Professionnel",
        price: 19.99,
        requestsPerMonth: 5000,
        features: [
          "5 000 fiches par mois",
          "Documentation complète",
          "Support prioritaire",
        ],
      },
      {
        id: "enterprise",
        name: "Entreprise",
        price: 49.99,
        requestsPerMonth: 30000,
        features: [
          "30 000 fiches par mois",
          "Documentation complète",
          "Support dédié 24/7",
          "API personnalisée",
          "SLA garanti",
        ],
      },
      {
        id: "lifetime",
        name: "Lifetime",
        oneTimePrice: 999,
        productSheetsPerMonth: null, // illimité
        features: [
          "Accès illimité à vie",
          "Documentation complète",
          "Requêtes illimitées",
          "Support prioritaire à vie",
          "Accès aux futures fonctionnalités",
        ],
      },
    ] as Plan[],
    loading: false,
    error: null as string | null,
  }),
});
