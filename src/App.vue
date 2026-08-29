<script setup>
import { RouterView } from 'vue-router'
import { onMounted, ref } from 'vue'
import { useStore } from './stores/index.js'
import {
  watchAuthState,
  enableAuthPersistence
} from './db.js'

const store = useStore()

const authReady = ref(false)

onMounted(async () => {
  await enableAuthPersistence()

  watchAuthState((user) => {
    if (user) {
      store.uid = user.uid
      store.user =
        user.displayName ||
        user.email ||
        ''

      localStorage.setItem(
        'uid',
        user.uid
      )

      localStorage.setItem(
        'user',
        user.displayName ||
        user.email ||
        ''
      )
    } else {
      store.uid = null
      store.user = null

      localStorage.removeItem('uid')
      localStorage.removeItem('user')
    }

    authReady.value = true
  })
})
</script>

<template>
  <v-app>
    <v-main>
      <h2>
        Röda Hönans rapportsystem 🐓
      </h2>

      <RouterView v-if="authReady" />

      <div
        v-else
        class="d-flex justify-center pa-6"
      >
        <v-progress-circular
          indeterminate
          color="primary"
        />
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
h2 {
  margin: 1rem 0 0.25rem;
}
</style>