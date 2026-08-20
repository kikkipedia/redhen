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
  <div class="mt-4 text-center text-small text-medium-emphasis">
    Glömt lösenord? <span @click="openReset" class="text-primary cursor-pointer">Återställ lösenord</span>
  </div>
  <v-overlay
    v-model="openreset"
    absolute
    opacity="0.8"
  >
    <v-card
      class="pa-6 position-relative"
      rounded="lg"
      elevation="8"
    >
      <v-card-title>
        Återställ lösenord
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="email"
          label="Email"
          type="email"
          prepend-inner-icon="mdi-email"
          variant="outlined"
          autocomplete="email"
        />
        <v-btn
          block
          color="primary"
          size="large"
          class="mt-2"
          @click="resetPassword(email)"
        >
          Skicka återställningslänk
        </v-btn>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          icon="mdi-close"
          variant="text"
          class="close-button"
          @click="openreset = false"
        />
      </v-card-actions>
    </v-card>
  </v-overlay>
</template>

<script setup>
import { ref } from 'vue'
import { signInWithGoogle, loginUser, resetPassword } from '../db.js'
import { useStore } from '../stores/index.js'

const emit = defineEmits(['close'])
const store = useStore()

const email = ref('')
const password = ref('')

const openreset = ref(false)

async function login() {
  const user = await loginUser(email.value, password.value)
  setUser(user)
  emit('close')
}

async function loginWithGoogle() {
  const user = await signInWithGoogle() 
  setUser(user)
  emit('close')
}

const setUser = (user) => {
  store.user = user.displayName
  store.uid = user.uid
  localStorage.setItem('uid', user.uid)
  localStorage.setItem('user', user.displayName)
}

const openReset = () => {
  openreset.value = true
}

</script>