<script setup>
import { RouterView } from 'vue-router'
import { onMounted, ref } from 'vue'

const user = ref(null)
import { useStore } from './stores/index.js'

const store = useStore()

//on mounted, check if user and uid are stored in localStorage, if so, set them in the store, else, redirect to login page
onMounted(() => {
  const storedUser = localStorage.getItem('user')
  const storedUid = localStorage.getItem('uid')
  if (storedUser && storedUid) {
    user.value = storedUser
    //set in store
    store.user = storedUser
    store.uid = storedUid
  }
  if (storedUser == null || storedUid == null) {
    localStorage.removeItem('uid')
    localStorage.removeItem('user')
  }
  else if (!store.user || !store.uid) {
    localStorage.removeItem('uid')
    localStorage.removeItem('user')
  }
})

</script>

<template>
  <v-app>
    <v-main>
      <h2>Röda Hönans rapportsystem 🐓</h2>
      <RouterView />
    </v-main>
  </v-app>
</template>

<style scoped>
h2 {
  margin: 1rem 0 0.25rem;
}
</style>