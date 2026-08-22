<template>
  <v-card
    class="ma-4 pa-6 mx-auto"
    max-width="420"
    rounded="lg"
    elevation="3"
  >

    <Calendar/>

    <div v-if="!reportExists"">

    <div class="report-row mt-4">
      <div class="egg-stepper">
        <v-btn
          icon="mdi-minus"
          size="small"
          variant="tonal"
          color="primary"
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
          color="primary"
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
      color="secondary"
      size="large"
      :loading="loading"
      :disabled="loading"
      @click="submitReport"
    >
      Rapportera 🐓
    </v-btn>
    </div>
    <div v-else class="text-center mt-4">
      <v-icon
        color="secondary"
        size="48"
      >
        mdi-check-circle
      </v-icon>
      <div class="text-h6 mt-2">
        Dagens rapport har redan skickats in.
      </div>
      <v-btn
        color="primary"
        variant="outlined"
        size="large"
        class="mt-4"
        @click="updateReport = true"
      >
        Uppdatera rapport
      </v-btn>
    </div>
  </v-card>

</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useStore } from '../stores/index.js'
import { saveReport, fetchReportsByDate } from '@/db.js'
import Calendar from './Calendar.vue'

const store = useStore()

const eggs = ref(0)
const notes = ref('')

const loading = ref(false)
const successMessage = ref('')
const reportExists = ref(false)

const updateReport = ref(false)

onMounted(async() => {
  // Load todays report if it exists 
  //and add update button if it does
  store.selectedDate = new Date().toISOString().split('T')[0]
  checkReportExists()
})

async function checkReportExists() {
  const date = store.selectedDate
  console.log('Checking report for date:', date)
  await fetchReportsByDate(date).then(reports => {
    if (reports && reports.length > 0) {
      console.log('Report exists for today:' , reports[0])
      reportExists.value = true
    }
    else {
      console.log('No report exists for today.')
      reportExists.value = false
    }
  })
}

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
      eggs: eggs.value,
      notes: notes.value.trim(),
      date: store.selectedDate,
      userId: localStorage.getItem('uid') || ' ',
    }
  console.log('Chicken report:', report)
    await saveReport(report)
    successMessage.value = 'Dagens rapport har sparats.'
    store.reportExists = true
    reportExists.value = true
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

//watch date change in calendar
watch(
  () => store.selectedDate,
  (newDate) => {
    if (newDate) {
      console.log('Selected date changed to:', newDate)
      checkReportExists()
      successMessage.value = ''
      //resetForm()
    }
  }
)
</script>

<style scoped>
.report-row {
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
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

.overlay__content {
  width: 100%;
}
</style>