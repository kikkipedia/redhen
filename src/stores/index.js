import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useStore = defineStore('store', () => {
  const user = ref(null)
  const uid = ref(null)
  const reportExists = ref(false)

  return { user, uid, reportExists }
})
