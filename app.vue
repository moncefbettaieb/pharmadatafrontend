<template>
  <div class="min-h-screen bg-gray-50">
    <TheHeader />
    <!-- Ajout d'un padding-top pour compenser le header fixe -->
    <div class="pt-16">
      <NuxtPage />
    </div>
    <TheFooter />
    <div id="toast-container" class="!top-20"></div>
  </div>
</template>

<script setup>
import { useToast } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const toast = useToast()

// Make toast available globally
provide('toast', toast)
</script>

<style>
.Vue-Toastification__container {
  z-index: 40 !important;
}
</style>