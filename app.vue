<template>
<div class="min-h-screen bg-gray-50">
  <TheHeader />
  <!-- Ajout d'un padding-top pour compenser le header fixe -->
  <div class="pt-16">
    <NuxtPage />
  </div>
  <TheFooter />
  <div id="toast-container"></div>
</div>
</template>

<script setup>
import { useToast } from 'vue-toastification'
import "vue-toastification/dist/index.css"

const toast = useToast()

// Make toast available globally
provide('toast', toast)
</script>