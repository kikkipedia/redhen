<template>
  <div>
    <h2 class="text-h5 mb-6">
      Registrera
    </h2>

    <v-btn
      block
      size="large"
      variant="outlined"
      prepend-icon="mdi-google"
      class="mb-6"
      :loading="loading"
      :disabled="loading"
      @click="handleGoogleSignIn"
    >
      Fortsätt med Google
    </v-btn>

    <v-divider class="mb-6">
      <span class="text-medium-emphasis">
        eller registrera med e-post
      </span>
    </v-divider>

    <v-form @submit.prevent="register">
      <v-text-field
        v-model="displayName"
        label="Namn"
        type="text"
        prepend-inner-icon="mdi-account"
        variant="outlined"
        autocomplete="name"
        :disabled="loading"
        required
      />

      <v-text-field
        v-model="email"
        label="Email"
        type="email"
        prepend-inner-icon="mdi-email"
        variant="outlined"
        autocomplete="email"
        :disabled="loading"
        required
      />

      <v-text-field
        v-model="password"
        label="Lösenord"
        type="password"
        prepend-inner-icon="mdi-lock"
        variant="outlined"
        autocomplete="new-password"
        :disabled="loading"
        :rules="passwordRules"
        required
      />

      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        class="mb-4"
      >
        {{ errorMessage }}
      </v-alert>

      <v-alert
        v-if="successMessage"
        type="success"
        variant="tonal"
        class="mb-4"
      >
        {{ successMessage }}
      </v-alert>

      <v-btn
        type="submit"
        block
        color="primary"
        size="large"
        :loading="loading"
        :disabled="loading"
      >
        Registrera
      </v-btn>
    </v-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  registerUser,
  signInWithGoogle,
} from '../db.js'

const emit = defineEmits(['close'])

const email = ref('')
const password = ref('')
const displayName = ref('')

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const passwordRules = [
  value => !!value || 'Ange lösenord',
  value => value.length >= 6 || 'Lösenordet måste innehålla minst 6 tecken',
]

async function handleGoogleSignIn() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const user = await signInWithGoogle()

    localStorage.setItem('user', JSON.stringify(user))

    successMessage.value =
      `Inloggad som ${user.displayName || user.email}`

    emit('close')
  } catch (error) {
    errorMessage.value =
      error.message || 'Google-inloggningen misslyckades.'
  } finally {
    loading.value = false
  }
}

async function register() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const user = await registerUser({
      email: email.value,
      password: password.value,
      displayName: displayName.value,
    })

    localStorage.setItem('user', JSON.stringify(user))

    successMessage.value = `Kontot skapades för ${user.email}`

    email.value = ''
    password.value = ''
    displayName.value = ''

    emit('close')
  } catch (error) {
    errorMessage.value =
      error.message || 'Registreringen misslyckades.'
  } finally {
    loading.value = false
  }
}
</script>