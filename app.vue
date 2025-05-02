<template>
  <div class="min-h-screen bg-gray-50">
    <TheHeader />
    <!-- Ajout d'un padding-top pour compenser le header fixe -->
    <div class="pt-16">
      <NuxtPage />
    </div>
    <TheFooter />
  </div>
</template>

<script setup>
import { useHead } from '#imports'
import 'vue-toastification/dist/index.css'

const config = useRuntimeConfig()

useHead({
  script: [
    {
      src: 'https://www.googletagmanager.com/gtag/js?id=G-4MPTRJ8W59',
      async: true
    },
    {
      children: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-4MPTRJ8W59');
      `
    }
  ]
})
</script>

<style>
.Vue-Toastification__container {
  z-index: 40 !important;
}

.Vue-Toastification__toast--default {
  background-color: #4F46E5 !important;
  border-radius: 0.5rem !important;
}

.Vue-Toastification__toast--success {
  background-color: #059669 !important;
  border-radius: 0.5rem !important;
}

.Vue-Toastification__toast--error {
  background-color: #DC2626 !important;
  border-radius: 0.5rem !important;
}
</style>