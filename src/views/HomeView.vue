<template>
  <div v-if="store.user">
    <Dashboard />
  </div>

  <div v-else class="auth">
    <v-btn @click="showLogin = true">
      Logga in
    </v-btn>

    <v-btn @click="showRegister = true">
      Registrera
    </v-btn>
  </div>

  <v-dialog
    v-model="showLogin"
    max-width="500"
  >
    <v-sheet
      class="pa-6 position-relative"
      rounded="lg"
      elevation="8"
    >
      <v-btn
        icon="mdi-close"
        variant="text"
        class="close-button"
        @click="showLogin = false"
      />
      <Login @close="showLogin = false" />
    </v-sheet>
  </v-dialog>

  <v-dialog
    v-model="showRegister"
    max-width="500"
  >
    <v-sheet
      class="pa-6 position-relative"
      rounded="lg"
      elevation="8"
    >
      <v-btn
        icon="mdi-close"
        variant="text"
        class="close-button"
        @click="showRegister = false"
      />

      <Register @close="showRegister = false" />
    </v-sheet>
  </v-dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import { useStore } from '../stores/index.js'


const store = useStore()

const user = ref(null)

const showLogin = ref(false)
const showRegister = ref(false)

onMounted(() => {
  const storedUser = localStorage.getItem('user')

  if (storedUser) {
    user.value = storedUser
  }
})


</script>

<style>
.auth {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 5rem;
  align-items: center;
  gap: 3rem;
}

.close-button {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}

.v-dialog > .v-overlay__content {
  min-height: 80vh;
}
</style>