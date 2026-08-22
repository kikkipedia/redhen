<template>
  <v-container>
    <!-- Month navigation -->
    <div class="d-flex align-center justify-space-between mb-4">
      <v-btn
        icon="mdi-chevron-left"
        variant="text"
        @click="previousMonth"
      />

      <h2 class="text-h5">
        {{ monthLabel }}
      </h2>

      <v-btn
        icon="mdi-chevron-right"
        variant="text"
        @click="nextMonth"
      />
    </div>

    <!-- Weekday headers -->
    <div class="calendar-grid weekday-header">
      <div
        v-for="day in weekdays"
        :key="day"
        class="text-center font-weight-bold pa-2"
      >
        {{ day }}
      </div>
    </div>

    <!-- Calendar -->
    <div class="calendar-grid">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="calendar-day"
        :class="{
          'empty-day': !day,
          'today': day?.isToday
        }"
      >
        <template v-if="day">
          <div class="day-number">
            {{ day.date.getDate() }}
          </div>

          <div
            v-if="day.names.length"
            class="names"
          >
            <span
              v-for="name in day.names"
              :key="name"
              color="primary"
              @click.stop="openPerson(day, name)"
            >
              {{ name }}
        </span>
          </div>
        </template>
      </div>
    </div>

    <!-- Dialog -->
<!--     <v-dialog
      v-model="dialog"
      max-width="420"
    >
      <v-card
        v-if="selectedEntry"
        class="pa-4"
        rounded="lg"
      >
        <v-card-title>
          {{ selectedEntry.name }}
        </v-card-title>

        <v-card-subtitle>
          {{ formatFullDate(selectedEntry.date) }}
        </v-card-subtitle>

        <v-card-text>
          Här kan du lägga information om
          <strong>{{ selectedEntry.name }}</strong>.
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            color="primary"
            variant="text"
            @click="dialog = false"
          >
            Stäng
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog> -->
  </v-container>
</template>

<script setup>
import { computed, ref } from 'vue'

const dialog = ref(false)
const selectedEntry = ref(null)

const currentDate = ref(new Date())

const weekdays = [
  'Mån',
  'Tis',
  'Ons',
  'Tor',
  'Fre',
  'Lör',
  'Sön',
]

const weekSchedule = [
  { day: 'Måndag', names: ['Anna', 'Sari & Sofia'] },
  { day: 'Tisdag', names: ['Erika', 'Axel L'] },
  { day: 'Onsdag', names: ['Axel & Klara', 'Amanda & Elin'] },
  { day: 'Torsdag', names: ['Kicki', 'Ylva & Petter'] },
  { day: 'Fredag', names: ['Klara & Malte', 'Liam'] },
]

const scheduleByWeekday = {
  1: weekSchedule[0].names, // Monday
  2: weekSchedule[1].names,
  3: weekSchedule[2].names,
  4: weekSchedule[3].names,
  5: weekSchedule[4].names,
}

const weekendRotation = [
  weekSchedule[0].names, // Monday group
  weekSchedule[1].names, // Tuesday group
  weekSchedule[2].names, // Wednesday group
  weekSchedule[3].names, // Thursday group
  weekSchedule[4].names, // Friday group
]

// Known reference:
// Weekend 22–23 Aug 2026 = Thursday group
const referenceWeekend = new Date(2026, 7, 22) // Aug = 7
const referenceGroupIndex = 3

function getWeekendNames(date) {
  const weekday = date.getDay()
  // Only Saturday (6) and Sunday (0)
  if (weekday !== 6 && weekday !== 0) {
    return []
  }
  // Find the Saturday belonging to this weekend
  const saturday = new Date(date)
  if (weekday === 0) {
    saturday.setDate(saturday.getDate() - 1)
  }
  // Remove time portion
  saturday.setHours(0, 0, 0, 0)
  const reference = new Date(referenceWeekend)
  reference.setHours(0, 0, 0, 0)
  const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000
  const weeksDifference = Math.round(
    (saturday - reference) / millisecondsPerWeek
  )

  // JS modulo can be negative, so normalize it
  const groupIndex =
    ((referenceGroupIndex + weeksDifference) % 5 + 5) % 5

  return weekendRotation[groupIndex]
}

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const result = []

  // JS Sunday = 0.
  // Convert so Monday = 0.
  const startingOffset = (firstDay.getDay() + 6) % 7

  // Empty cells before first day of month
  for (let i = 0; i < startingOffset; i++) {
    result.push(null)
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day)
    const weekday = date.getDay()

    let names = scheduleByWeekday[weekday] || []

    // Saturday or Sunday
    if (weekday === 0 || weekday === 6) {
        names = getWeekendNames(date)
    }

    result.push({
        date,
        names,
        isToday: isToday(date),
    })
    }

  return result
})

const monthLabel = computed(() => {
  return currentDate.value.toLocaleDateString('sv-SE', {
    month: 'long',
    year: 'numeric',
  })
})

function previousMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
}

function nextMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
}

function openPerson(day, name) {
  selectedEntry.value = {
    name,
    date: day.date,
  }

  dialog.value = true
}

function isToday(date) {
  const today = new Date()

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

function formatFullDate(date) {
  return date.toLocaleDateString('sv-SE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.weekday-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
}

.calendar-day {
  min-height: 120px;
  padding: 8px;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.day-number {
  font-weight: 600;
  margin-bottom: 2px;
  font-size: 0.8rem;
}

.names {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}

span {
  color: rgb(var(--v-theme-primary));
  font-size: 0.6rem;
  cursor: pointer;
}

.today {
  background: rgba(var(--v-theme-primary), 0.08);
}

.today .day-number {
  color: rgb(var(--v-theme-primary));
}

.empty-day {
  background: rgba(0, 0, 0, 0.02);
}

@media (max-width: 600px) {
  .calendar-day {
    min-height: 85px;
    padding: 4px;
  }

  .name-chip {
    font-size: 0.65rem;
  }
}
</style>