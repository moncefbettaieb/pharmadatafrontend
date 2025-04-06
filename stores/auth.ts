import { defineStore } from "pinia";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  updateProfile as firebaseUpdateProfile,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  OAuthProvider,
  RecaptchaVerifier,
  signInWithCredential,
  type User,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  getFirestore,
  serverTimestamp,
  collection,
  DocumentReference,
  type DocumentData,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

interface UserRegistration {
  email: string;
  password: string;
  displayName: string;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    loading: false,
    error: null as string | null,
    verificationId: null as string | null,
    emailVerificationSent: false,
    isMacOS: false,
    recaptchaVerifier: null as RecaptchaVerifier | null,
    initialized: false,
  }),

  actions: {
    async createUserDocument(user: User, emailVerified: boolean = false) {
      const { $firebaseDb, $firebaseFunctions } = useNuxtApp();
      
      if (!$firebaseDb || !$firebaseFunctions) {
        throw new Error("Services Firebase non initialisés");
      }

      try {
        // Créer ou mettre à jour le document utilisateur
        const userRef = doc($firebaseDb, "users", user.uid);
        const userSnapshot = await getDoc(userRef);
        await createOrUpdateUserDocument(userRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified,
          lastLoginAt: serverTimestamp(),
        });

        // Si l'email est vérifié et qu'il n'y a pas d'abonnement
        if (emailVerified) {
          const subscriptionId = userSnapshot.exists()
            ? userSnapshot.data()?.subscriptionId
            : null;
          if (!subscriptionId) {
            // Créer l'abonnement
            const subscriptionRef = doc(collection($firebaseDb, "subscriptions"));
            await setDoc(subscriptionRef, {
              userId: user.uid,
              planId: "free",
              name: "Gratuit",
              status: "active",
              requestsPerMonth: 100,
              remainingRequests: 100,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
              createdAt: serverTimestamp(),
            });

            await setDoc(
              userRef,
              { subscriptionId: subscriptionRef.id },
              { merge: true }
            );
            // Générer le token API
            try {
              const generateTokenCall = httpsCallable($firebaseFunctions, "generateToken");
              const tokenResult = await generateTokenCall();
              console.log("Token généré:", tokenResult);
              if (tokenResult.data && typeof tokenResult.data === "object") {
                const { token, id } = tokenResult.data as { token: string; id: string };
                await setDoc(doc(collection($firebaseDb, "api_usage")), {
                  userId: user.uid,
                  tokenId: id,
                  token: token,
                  requests: 0,
                  lastUsed: null,
                  createdAt: serverTimestamp(),
                });
              }
            } catch (error) {
              console.error("Erreur détaillée lors de la génération du token:", {
                error,
                message: error.message,
                code: error.code,
                details: error.details
              });
              // Continuer l'exécution même si la génération du token échoue
            }
            // Create notification document
            const notifRef = doc(collection($firebaseDb, "notifications"));
            await setDoc(
              notifRef,
              {
              userId: user.uid,
              title: "Création de compte utilisateur",
              type: "info",
                read: "false",
              message: "Utilisateur créé avec succès",
              createdAt: serverTimestamp(),
              },
              { merge: false }
            );
          }
        }
      } catch (error) {
        console.error("Erreur lors de la création/mise à jour du document utilisateur:", error);
        throw error;
      }
    },

    async register({ email, password, displayName }: UserRegistration) {
      const { $firebaseAuth } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        if (!$firebaseAuth) {
          throw new Error("Firebase authentication is not initialized");
        }
        const userCredential = await createUserWithEmailAndPassword(
          $firebaseAuth,
          email,
          password
        );
        await firebaseUpdateProfile(userCredential.user, { displayName });
        await sendEmailVerification(userCredential.user);
        this.emailVerificationSent = true;
        await this.createUserDocument(userCredential.user, false);
        this.user = userCredential.user;
      } catch (error: any) {
        this.error = this.getErrorMessage(error.code);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async resendVerificationEmail() {
      if (!this.user) {
        throw new Error("Utilisateur non connecté");
      }

      try {
        await sendEmailVerification(this.user);
        this.emailVerificationSent = true;
      } catch (error: any) {
        this.error = this.getErrorMessage(error.code);
        throw error;
      }
    },

    async login(email: string, password: string) {
      const { $firebaseAuth } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        if (!$firebaseAuth) {
          throw new Error("Firebase authentication is not initialized");
        }

        const userCredential = await signInWithEmailAndPassword(
          $firebaseAuth,
          email,
          password
        );
        // Reload the user to get the updated emailVerified status
        await userCredential.user.reload();
        const verified = userCredential.user.emailVerified;
        // Now we create/update the user document with the actual verification status
        await this.createUserDocument(userCredential.user, verified);
        this.user = userCredential.user;
      } catch (error: any) {
        this.error = this.getErrorMessage(error.code);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async loginWithGoogle() {
      this.loading = true;
      this.error = null;
      try {
        const { $firebaseAuth } = useNuxtApp();
        if (!$firebaseAuth) {
          throw new Error("Firebase authentication is not initialized");
        }
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup($firebaseAuth, provider);
        await userCredential.user.reload();
        const verified = userCredential.user.emailVerified;
        await this.createUserDocument(userCredential.user, verified);
        this.user = userCredential.user;
      } catch (error: any) {
        this.error = this.getErrorMessage(error.code);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async loginWithApple() {
      this.loading = true;
      this.error = null;
      try {
        const { $firebaseAuth } = useNuxtApp();
        if (!$firebaseAuth) {
          throw new Error("Firebase authentication is not initialized");
        }
        const provider = new OAuthProvider("apple.com");
        provider.addScope("email");
        provider.addScope("name");

        const userCredential = await signInWithPopup($firebaseAuth, provider);

        // Same reloading logic for Apple
        await userCredential.user.reload();
        const verified = userCredential.user.emailVerified;

        await this.createUserDocument(userCredential.user, verified);
        this.user = userCredential.user;
      } catch (error: any) {
        this.error = this.getErrorMessage(error.code);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    initRecaptcha() {
      const { $firebaseAuth } = useNuxtApp();
      if (!$firebaseAuth) {
        throw new Error("Firebase authentication is not initialized");
      }

      this.recaptchaVerifier = new RecaptchaVerifier(
        $firebaseAuth,
        "recaptcha-container",
        {
          size: "normal",
          callback: () => {
            // Le reCAPTCHA a été résolu avec succès
          },
          "expired-callback": () => {
            // Le reCAPTCHA a expiré
            this.error = "Le reCAPTCHA a expiré, veuillez réessayer";
          },
        }
      );
    },

    // Méthode pour l'authentification par téléphone
    async sendPhoneVerification(phoneNumber: string) {
      this.loading = true;
      this.error = null;

      try {
        const { $firebaseAuth } = useNuxtApp();
        if (!$firebaseAuth) {
          throw new Error("Firebase authentication is not initialized");
        }

        // Initialize reCAPTCHA if it doesn't exist
        if (!this.recaptchaVerifier) {
          this.initRecaptcha();
        }

        // Send verification code
        const confirmationResult = await signInWithPhoneNumber(
          $firebaseAuth,
          phoneNumber,
          this.recaptchaVerifier!
        );

        this.verificationId = confirmationResult.verificationId;
      } catch (error: any) {
        this.error = this.getErrorMessage(error.code);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async verifyPhoneCode(code: string) {
      if (!this.verificationId) {
        throw new Error("No verification code sent");
      }

      this.loading = true;
      this.error = null;

      try {
        const { $firebaseAuth } = useNuxtApp();
        if (!$firebaseAuth) {
          throw new Error("Firebase authentication is not initialized");
        }

        const credential = PhoneAuthProvider.credential(
          this.verificationId,
          code
        );
        const userCredential = await signInWithCredential($firebaseAuth, credential);
        this.user = userCredential.user;

        // Create user document only on first sign-up
        const userDoc = await getFirestore()
          .collection("users")
          .doc(userCredential.user.uid)
          .get();
        if (!userDoc.exists) {
          await this.createUserDocument(userCredential.user);
        }

        this.verificationId = null;
      } catch (error: any) {
        this.error = this.getErrorMessage(error.code);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Méthode pour mettre à jour le mot de passe
    async updatePassword(currentPassword: string, newPassword: string) {
      this.loading = true;
      this.error = null;

      try {
        const { $firebaseAuth } = useNuxtApp();
        if (!$firebaseAuth || !$firebaseAuth.currentUser || !$firebaseAuth.currentUser.email) {
          throw new Error("Utilisateur non authentifié");
        }

        // Réauthentifier l'utilisateur avant de changer le mot de passe
        const credential = EmailAuthProvider.credential(
          $firebaseAuth.currentUser.email,
          currentPassword
        );

        if (!$firebaseAuth.currentUser) {
          throw new Error("Utilisateur non authentifié");
        }

        if ($firebaseAuth.currentUser) {
          await reauthenticateWithCredential($firebaseAuth.currentUser, credential);
          await firebaseUpdatePassword($firebaseAuth.currentUser, newPassword);
        } else {
          throw new Error("Utilisateur non authentifié");
        }
      } catch (error: any) {
        this.error = this.getErrorMessage(error.code);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      const { $firebaseAuth } = useNuxtApp();
      if ($firebaseAuth) {
        await signOut($firebaseAuth);
      }
      this.user = null;
    },

    getErrorMessage(code: string): string {
      switch (code) {
        case "auth/email-already-in-use":
          return "Cette adresse email est déjà utilisée";
        case "auth/invalid-email":
          return "Adresse email invalide";
        case "auth/operation-not-allowed":
          return "Opération non autorisée";
        case "auth/weak-password":
          return "Le mot de passe est trop faible";
        case "auth/email-not-verified":
          return "Veuillez vérifier votre adresse email";
        case "auth/user-disabled":
          return "Ce compte a été désactivé";
        case "auth/user-not-found":
          return "Aucun compte ne correspond à cette adresse email";
        case "auth/wrong-password":
          return "Mot de passe incorrect";
        case "auth/invalid-password":
          return "Le mot de passe doit être d'au moins six caractères Contenant des miniscules, des majuscule et des chiffres";
        case "auth/invalid-verification-code":
          return "Code de vérification invalide";
        case "auth/invalid-phone-number":
          return "Numéro de téléphone invalide";
        case "auth/popup-closed-by-user":
          return "La fenêtre de connexion a été fermée";
        case "auth/apple-auth-error":
          return "Erreur d'authentification Apple";
        case "cancelled-popup-request":
          return "La demande de connexion a été annulée";
        case "auth/invalid-api-key":
          return "Configuration Firebase manquante ou invalide";
        case "auth/requires-recent-login":
          return "Cette opération nécessite une authentification récente. Veuillez vous reconnecter.";
        case "auth/code-expired":
          return "Le code de vérification a expiré";
        case "auth/too-many-requests":
          return "Trop de tentatives, veuillez réessayer plus tard";
        default:
          return "Une erreur est survenue";
      }
    },

    initAuthListener() {
      const { $firebaseAuth } = useNuxtApp();
      
      if (!$firebaseAuth) {
        console.error("Firebase Auth n'est pas initialisé");
        return;
      }
      
      return new Promise((resolve) => {
        onAuthStateChanged($firebaseAuth, async (user) => {
          this.loading = true;
          try {
            if (user) {
              this.user = user;
              
              // Si l'email est vérifié, mettre à jour le document utilisateur
              if (user.emailVerified) {
                await this.createUserDocument(user, true);
              }
            } else {
              console.log("Utilisateur déconnecté");
              this.user = null;
            }
          } catch (error) {
            console.error("Erreur dans l'écouteur d'authentification:", error);
          } finally {
            this.loading = false;
            this.initialized = true;
            resolve(user);
          }
        });
      });
    },

    async updateProfile(profileData: {
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      birthdate?: string;
      profession?: string;
      address?: string;
      city?: string;
      postalCode?: string;
      country?: string;
      preferredLanguage?: string;
    }) {
      this.loading = true;
      this.error = null;

      try {
        const { $firebaseAuth, $firebaseDb } = useNuxtApp();
        
        if (!$firebaseAuth || !$firebaseAuth.currentUser) {
          throw new Error("Utilisateur non authentifié");
        }
        
        if (!$firebaseDb) {
          throw new Error("Firestore non initialisé");
        }

        // Construire le displayName à partir du prénom et du nom
        const displayName = `${profileData.firstName} ${profileData.lastName}`.trim();
        
        // Mettre à jour le profil sur Firebase Auth
        await firebaseUpdateProfile($firebaseAuth.currentUser, {
          displayName
        });
        
        // Mettre à jour le document utilisateur dans Firestore
        const userRef = doc($firebaseDb, "users", $firebaseAuth.currentUser.uid);
        
        // Préparer les données à mettre à jour
        const userData = {
          displayName,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phoneNumber: profileData.phoneNumber || null,
          birthdate: profileData.birthdate || null,
          profession: profileData.profession || null,
          address: profileData.address || null,
          city: profileData.city || null,
          postalCode: profileData.postalCode || null,
          country: profileData.country || null,
          preferredLanguage: profileData.preferredLanguage || 'fr',
          updatedAt: serverTimestamp()
        };
        
        // Mettre à jour le document utilisateur
        await setDoc(userRef, userData, { merge: true });
        
        // Mettre à jour l'objet user local
        if (this.user) {
          // On ne peut pas directement modifier l'objet user retourné par Firebase,
          // mais on peut mettre à jour certaines propriétés exposées par Firebase
          await this.user.reload();
        }
        
        return true;
      } catch (error: any) {
        console.error("Erreur lors de la mise à jour du profil:", error);
        this.error = error.message || "Erreur lors de la mise à jour du profil";
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },

  persist: {
    key: 'pharma-auth',
    storage: persistedState.localStorage,
    paths: ['user', 'emailVerificationSent'],
  },
});

async function createOrUpdateUserDocument(
  userRef: DocumentReference<DocumentData, DocumentData>,
  arg1: {
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
    lastLoginAt: import("firebase/firestore").FieldValue;
  }
) {
  const existingSnap = await getDoc(userRef);

  if (!existingSnap.exists()) {
    // If document doesn't exist yet, set createdAt once
    await setDoc(
      userRef,
      {
        createdAt: serverTimestamp(),
        ...arg1,
      },
      { merge: true }
    );
  } else {
    // If document already exists, skip createdAt so it won't be overwritten
    await setDoc(userRef, arg1, { merge: true });
  }
}
