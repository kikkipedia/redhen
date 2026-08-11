<script setup>
import { RouterView } from 'vue-router'
import { onMounted, ref } from 'vue'

const user = ref(null)
import { useStore } from './stores/index.js'

const store = useStore()

onMounted(() => {
  const storedUser = localStorage.getItem('user')

  if (storedUser) {
    user.value = storedUser
    //set in store
    store.user = storedUser
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
  margin-top: 1rem;
}
</style>