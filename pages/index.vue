<template>
    <div>
      <h1>Test de l'API - Authentification & Subscription</h1>
  
      <!-- Formulaire d'inscription -->
      <section>
        <h2>Inscription</h2>
        <form @submit.prevent="registerUser">
          <input v-model="registerEmail" type="email" placeholder="Email" required />
          <input v-model="registerPassword" type="password" placeholder="Password" required />
          <button type="submit">S'inscrire</button>
        </form>
        <pre v-if="registerResult">{{ registerResult }}</pre>
      </section>
  
      <!-- Formulaire de connexion -->
      <section>
        <h2>Connexion</h2>
        <form @submit.prevent="loginUser">
          <input v-model="loginEmail" type="email" placeholder="Email" required />
          <input v-model="loginPassword" type="password" placeholder="Password" required />
          <button type="submit">Se connecter</button>
        </form>
        <p v-if="token">Token: {{ token }}</p>
        <pre v-if="loginResult">{{ loginResult }}</pre>
      </section>
  
      <!-- Appel au service protégé subscription/me -->
      <section v-if="token">
        <h2>Mon Abonnement</h2>
        <button @click="fetchSubscription">Obtenir Mon Abonnement</button>
        <pre v-if="subscriptionResult">{{ subscriptionResult }}</pre>
      </section>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { useRuntimeConfig } from '#app'

  const registerEmail = ref('')
  const registerPassword = ref('')
  const registerResult = ref<any>(null)
  
  const loginEmail = ref('')
  const loginPassword = ref('')
  const loginResult = ref<any>(null)
  const token = ref<string| null>(null)
  
  const subscriptionResult = ref<any>(null)
  
  const config = useRuntimeConfig();
  console.log('config: ', config);
  console.log('config.public: ', config.public);

  // Utilisez runtimeConfig.public.apiBase comme source de vérité
  const API_URL = config.public.apiBase;
  const apiBaseTest = config.public.apiBaseTest;
  const apiBaseTest2 = config.public.apiBaseTest2;

  console.log('API_URL from config:', API_URL);
  console.log('API_URL from config test:', apiBaseTest);
  console.log('API_URL from config test2:', apiBaseTest2);
  
  async function registerUser() {
    const res = await fetch(`${API_URL}/api/v1/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: registerEmail.value,
        password: registerPassword.value
      })
    })
  
    if (!res.ok) {
      const err = await res.json()
      registerResult.value = err
      return
    }
    const data = await res.json()
    registerResult.value = data
  }
  
  async function loginUser() {
    // Selon votre implémentation backend, 
    // si vous utilisez OAuth2PasswordRequestForm, 
    // le "username" = email, "password" = password.
    const formData = new FormData()
    formData.append('username', loginEmail.value)
    formData.append('password', loginPassword.value)
    
    const res = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      body: formData
    })
  
    if (!res.ok) {
      const err = await res.json()
      loginResult.value = err
      return
    }
  
    const data = await res.json()
    loginResult.value = data
    token.value = data.access_token
  }
  
  async function fetchSubscription() {
    if (!token.value) return
  
    const res = await fetch(`${API_URL}/api/v1/subscription/me`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
  
    if (!res.ok) {
      const err = await res.json()
      subscriptionResult.value = err
      return
    }
  
    const data = await res.json()
    subscriptionResult.value = data
  }
  </script>
  
  <style scoped>
  h1, h2 {
    font-family: Arial, sans-serif;
  }
  
  section {
    margin-bottom: 20px;
  }
  
  input {
    display: block;
    margin-bottom: 10px;
  }
  
  pre {
    background: #f5f5f5;
    padding: 10px;
  }
  </style>
  