import { createPersistedState } from 'pinia-plugin-persistedstate'

export default defineNuxtPlugin(({ $pinia }) => {
  $pinia.use(createPersistedState({
    storage: localStorage,
    key: prefix => `pharmadata_${prefix}`,
    debug: true
  }))
}) 