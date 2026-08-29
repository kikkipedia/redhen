<template>
  <v-container class="pa-0">
    <div class="d-flex align-center justify-space-between px-3 py-2">
      <v-btn
        icon="mdi-chevron-left"
        variant="text"
        @click="previousWeek"
      />

      <div class="text-subtitle-1 font-weight-medium">
        {{ weekLabel }}
      </div>

      <v-btn
        icon="mdi-chevron-right"
        variant="text"
        :disabled="weekOffset === 0"
        @click="nextWeek"
      />
    </div>

    <v-progress-linear
      v-if="loading"
      indeterminate
      color="secondary"
    />

    <div class="week-grid px-2 scrollable">
      <v-card
        v-for="day in currentWeek"
        :key="day.dateId"
        color="secondary"
        variant="outlined"
        class="day-card pa-2"
      >
        <v-container class="pa-0" fluid>
          <v-row class="align-stretch justify-space-between">
            <v-col class="date" cols="2">
              <div class="text-caption text-uppercase font-weight-bold">
                {{ day.weekday }}
              </div>

              <div class="text-body-1 font-weight-bold">
                {{ day.day }}
              </div>
            </v-col>

            <v-col
              v-if="day.entries.length > 0"
              cols="2"
              class="egg-column text-center"
            >
              🥚
              {{
                day.entries.reduce(
                  (sum, entry) => sum + Number(entry.eggs || 0),
                  0
                )
              }}
            </v-col>

            <v-col class="notes-column">
              <div
                v-for="entry in day.entries"
                :key="entry.id"
                class="report-entry"
              >
                <span v-if="entry.notes">
                  {{ entry.notes }}
                </span>

                <span
                  v-if="entry.displayName"
                  class="report-user"
                >
                  / {{ entry.displayName }}
                </span>
              </div>

              <div
                v-if="day.entries.length === 0"
                class="report-text text-medium-emphasis"
              >
                -
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import {
  fetchReportsForWeek,
  getDate
} from '../db'

const weekOffset = ref(0)
const currentWeek = ref([])
const loading = ref(false)

onMounted(() => {
  loadWeek()
})

async function loadWeek() {
  loading.value = true

  try {
    currentWeek.value = await getCurrentWeek()
  } catch (error) {
    console.error('Could not load week:', error)
  } finally {
    loading.value = false
  }
}

async function getCurrentWeek() {
  const today = new Date()
  const startOfWeek = new Date(today)

  const weekday = today.getDay() || 7

  startOfWeek.setDate(
    today.getDate() -
      weekday +
      1 +
      weekOffset.value * 7
  )

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(
    startOfWeek.getDate() + 6
  )

  const startId = getDate(startOfWeek)
  const endId = getDate(endOfWeek)

  const reports =
    await fetchReportsForWeek(
      startId,
      endId
    )

  const week = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)

    date.setDate(
      startOfWeek.getDate() + i
    )

    const dateId = getDate(date)

    week.push({
      date,
      dateId,

      weekday:
        date.toLocaleDateString(
          'sv-SE',
          {
            weekday: 'short',
          }
        ),

      day: date.getDate(),

      fullDate:
        date.toLocaleDateString(
          'sv-SE',
          {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }
        ),

      entries: reports.filter(
        entry => entry.date === dateId
      ),
    })
  }

  return week
}

async function previousWeek() {
  weekOffset.value -= 1
  await loadWeek()
}

async function nextWeek() {
  if (weekOffset.value < 0) {
    weekOffset.value += 1
    await loadWeek()
  }
}

const weekLabel = computed(() => {
  if (!currentWeek.value.length) {
    return ''
  }

  const start =
    currentWeek.value[0].date

  const end =
    currentWeek.value[6].date

  return `${start.toLocaleDateString(
    'sv-SE',
    {
      month: 'short',
      day: 'numeric',
    }
  )} - ${end.toLocaleDateString(
    'sv-SE',
    {
      month: 'short',
      day: 'numeric',
    }
  )}`
})
</script>

<style>
.week-grid {
  display: grid;
  /*grid-template-columns: repeat(7, minmax(0, 1fr)); */
  gap: 4px;
}

.text-medium-emphasis {
  padding-left: 8px;
}

.text-caption {
  font-size: 0.65rem;
  color: #666;
}

.v-card-text {
  padding: 0;
}

.v-overlay__content {
  width: 100%;
}

.scrollable {
  overflow-y: auto;
  max-height: 70%;
}

.report-entry {
  font-size: 12px !important;
}

.date .font-weight-bold {
  font-weight: bold;
}

.egg-column,
.notes-column {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>