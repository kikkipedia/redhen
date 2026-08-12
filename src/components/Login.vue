<template>
    <h2>Logga in</h2>
  <v-btn
    block
    size="large"
    variant="outlined"
    prepend-icon="mdi-google"
    class="mb-6"
    @click="loginWithGoogle"
  >
    Fortsätt med Google
  </v-btn>

  <v-divider class="mb-6">
    <span class="text-medium-emphasis">eller</span>
  </v-divider>

  <v-form @submit.prevent="login">
    <v-text-field
      v-model="email"
      label="Email"
      type="email"
      prepend-inner-icon="mdi-email"
      variant="outlined"
      autocomplete="email"
    />

    <v-text-field
      v-model="password"
      label="Lösenord"
      type="password"
      prepend-inner-icon="mdi-lock"
      variant="outlined"
      autocomplete="current-password"
    />

    <v-btn
      type="submit"
      block
      color="primary"
      size="large"
      class="mt-2"
    >
      Logga in
    </v-btn>
  </v-form>
</template>

<script setup>
import { ref } from 'vue'
import { signInWithGoogle, loginUser } from '../db.js'
import { useStore } from '../stores/index.js'

const emit = defineEmits(['close'])
const store = useStore()

const email = ref('')
const password = ref('')

async function login() {
  const user = await loginUser(email.value, password.value)
  setUser(user.displayName)
  store.user = user.displayName
  store.uid = user.uid
  emit('close')
}

async function loginWithGoogle() {
  const user = await signInWithGoogle() 
  store.user = user.displayName
  store.uid = user.uid
  setUser(user.displayName)
  emit('close')
}

const setUser = (user) => {
  localStorage.setItem('user', user)
  localStorage.setItem('uid', store.uid)
}
</script>