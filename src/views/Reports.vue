<template>
  <v-container class="pa-0">
    <div class="d-flex align-center justify-space-between px-3 py-2">
      <v-btn icon="mdi-chevron-left" variant="text" @click="previousWeek" />

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

    <div class="week-grid px-2 scrollable">
      <v-card
        v-for="day in currentWeek"
        :key="day.date"
        color="secondary"
        variant="outlined"
        class="day-card pa-2"
      >
      <v-container class="pa-0" fluid>
        <v-row class="align-start justify-space-between">
          <v-col class="date" cols="2">
          <div class="text-caption text-uppercase">
            {{ day.weekday }}
          </div>

          <div class="text-body-1 font-weight-bold">
            {{ day.day }}
          </div>
          </v-col>
           <v-col cols="2">
          🥚 {{ day.entries.reduce((sum, entry) => sum + (entry.eggs || 0), 0) }}
        </v-col>
        <v-col>
          <div
            v-for="entry in day.entries"
            :key="entry.id"
            class="report-text"
          >
            <span v-if="entry.notes">
              {{ entry.notes }}
            </span>

            <span v-if="entry.userId">
              / {{ userNames[entry.userId] ?? '' }}
            </span>
          </div>
        </v-col>
        </v-row>
      </v-container>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { fetchReportsByDate, getDate, fetchUserData } from '../db';

const reports = ref([]);
const weekOffset = ref(0);
const sheet = ref(false);
const selectedDay = ref(null);
const currentWeek = ref([]);
const userNames = ref({});

onMounted(async () => {
  currentWeek.value = await getCurrentWeek()

  console.log('Current week:', currentWeek.value)

  await loadUserNames()
})

async function loadUserNames() {
  const entries = currentWeek.value.flatMap(
    day => day.entries || []
  )

  console.log('All entries:', entries)

  const userIds = [
    ...new Set(
      entries
        .map(entry => entry.userId || entry.id)
        .filter(Boolean)
    )
  ]

  console.log('User IDs to load:', userIds)

  for (const userId of userIds) {
    try {
      const userData = await fetchUserData(userId)

      console.log('User data:', userId, userData)

      userNames.value[userId] =
        userData.displayName || 'Unknown User'
    } catch (error) {
      console.error('Could not fetch user:', userId, error)
      userNames.value[userId] = 'Unknown User'
    }
  }

  console.log('Loaded user names:', userNames.value)
}

async function getCurrentWeek() {
  const today = new Date();
  const startOfWeek = new Date(today);

  const day = today.getDay() || 7;

  startOfWeek.setDate(
    today.getDate() - day + 1 + weekOffset.value * 7
  );

  const week = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);

    const dateId = getDate(date);

    const entries = await fetchReportsByDate(dateId);

    week.push({
      date,
      dateId,
      weekday: date.toLocaleDateString('sv-SE', {
        weekday: 'short',
      }),
      day: date.getDate(),
      fullDate: date.toLocaleDateString('sv-SE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      entries,
    });
  }

  return week;
}

async function previousWeek() {
  weekOffset.value -= 1
  currentWeek.value = await getCurrentWeek()
  await loadUserNames()
}

async function nextWeek() {
  if (weekOffset.value < 0) {
    weekOffset.value += 1
    currentWeek.value = await getCurrentWeek()
    await loadUserNames()
  }
}

const weekLabel = computed(() => {
  if (!currentWeek.value.length) {
    return '';
  }

  const startOfWeek = currentWeek.value[0].date;
  const endOfWeek = currentWeek.value[6].date;

  return `${startOfWeek.toLocaleDateString('sv-SE', {
    month: 'short',
    day: 'numeric',
  })} - ${endOfWeek.toLocaleDateString('sv-SE', {
    month: 'short',
    day: 'numeric',
  })}`;
});

</script>

<style>
.week-grid {
  display: grid;
  /*grid-template-columns: repeat(7, minmax(0, 1fr)); */
  gap: 4px;
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

.report-text {
  font-size: 12px !important;
}
</style>