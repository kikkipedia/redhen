<template>
  <v-card
    class="ma-4 pa-6"
    max-width="420"
    rounded="lg"
    elevation="3"
  >

    <div class="report-row">
      <div class="egg-stepper">
        <v-btn
          icon="mdi-minus"
          size="small"
          variant="tonal"
          :disabled="eggs <= 0"
          @click="decreaseEggs"
        />

        <span class="egg-count">
          {{ eggs }}
        </span>

        <v-btn
          icon="mdi-plus"
          size="small"
          variant="tonal"
          @click="increaseEggs"
        />
      </div>

      <span class="report-label">
        🥚 Ägg
      </span>
    </div>


    <v-textarea
      v-model="notes"
      label="Övrigt"
      variant="outlined"
      rows="3"
      auto-grow
      class="mt-4"
    />

    <v-alert
      v-if="successMessage"
      type="success"
      variant="tonal"
      class="mb-4"
    >
      {{ successMessage }}
    </v-alert>

    <v-btn
      block
      color="primary"
      size="large"
      :loading="loading"
      :disabled="loading"
      @click="submitReport"
    >
      Rapportera 🐓
    </v-btn>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from '../stores/index.js'

const store = useStore()

const eggs = ref(0)
const notes = ref('')

const loading = ref(false)
const successMessage = ref('')

import { onMounted } from 'vue'

onMounted(() => {
  // Load todays report if it exists 
  if (store.reportExists) {
    // Load the report data here
  }
})

function increaseEggs() {
  eggs.value += 1
}

function decreaseEggs() {
  if (eggs.value > 0) {
    eggs.value -= 1
  }
}

async function submitReport() {
  loading.value = true
  successMessage.value = ''

  try {
    const report = {
      uid: store.user?.uid || null,
      eggs: eggs.value,
      notes: notes.value.trim(),
      date: new Date(),
    }

    console.log('Chicken report:', report)

    // Later:
    // await saveChickenReport(report)

    successMessage.value = 'Dagens rapport har sparats.'
    store.reportExists = true
    resetForm()
  } catch (error) {
    console.error('Could not save report:', error)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  eggs.value = 0
  notes.value = ''
}
</script>

<style scoped>
.report-row {
  min-height: 52px;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 8px;
}

.report-label {
  font-size: 1rem;
}

.egg-stepper {
  min-width: 128px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.egg-count {
  min-width: 28px;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
}
</style>