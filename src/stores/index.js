import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useStore = defineStore('store', () => {
  const user = ref(null)
  const uid = ref(null)
  const reportExists = ref(false)
  const selectedDate = ref(new Date().toISOString().split('T')[0]) // Default to today's date

  return { user, uid, reportExists, selectedDate }

})
