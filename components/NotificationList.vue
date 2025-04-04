<template>
    <div class="space-y-4">
      <div v-if="loading" class="text-center py-4">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-r-transparent"></div>
      </div>
  
      <div v-else-if="error" class="text-center text-red-600">
        {{ error }}
        <button @click="onRetry" class="ml-2 text-indigo-600 hover:underline">Réessayer</button>
      </div>
  
      <div v-else-if="notifications.length === 0" class="text-center text-gray-500">
        Aucune notification
      </div>
  
      <div v-else>
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="bg-white shadow rounded-lg p-4 border-l-4"
          :class="getBorderClass(notification)"
        >
          <div class="flex justify-between">
            <div>
              <h4 class="text-sm font-medium text-gray-900">{{ notification.title }}</h4>
              <p class="text-sm text-gray-500">{{ notification.message }}</p>
              <p class="text-xs text-gray-400">
                {{ new Date(notification.createdAt).toLocaleString('fr-FR') }}
              </p>
            </div>
            <div class="flex items-start gap-2">
              <button
                v-if="!notification.read"
                @click="$emit('mark-as-read', notification.id)"
                class="text-indigo-600 text-sm hover:underline"
              >
                Marquer comme lu
              </button>
              <button @click="$emit('delete', notification.id)" class="text-gray-400 hover:text-red-500">
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    notifications: Array,
    loading: Boolean,
    error: String
  })
  
  defineEmits(['mark-as-read', 'delete', 'retry'])
  
  const onRetry = () => {
    emit('retry')
  }
  
  const getBorderClass = (notification) => {
    if (!notification.read) {
      switch (notification.type) {
        case 'success':
          return 'border-green-500'
        case 'error':
          return 'border-red-500'
        case 'warning':
          return 'border-yellow-500'
        default:
          return 'border-indigo-500'
      }
    }
    return ''
  }
  </script>
  