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
        color="primary"
        variant="tonal"
        class="day-card pa-2"
        @click="openDay(day)"
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
          🥚 {{ day.entry?.eggs ?? 0 }}
        </v-col>
        <v-col>
          <span v-if="day.entry?.notes" class="report-text">
            {{ day.entry.notes }}
          </span>
          <span
            v-if="day.entry?.userId"
            class="report-text"
          >
            / {{ userNames[day.entry.userId] ?? '' }}
          </span>
        </v-col>
        </v-row>
      </v-container>
      </v-card>
    </div>

    <v-bottom-sheet v-model="sheet">
      <v-card v-if="selectedDay" class="pa-4">
        <v-card-title>
          {{ selectedDay.fullDate }}
        </v-card-title>

        <v-card-text>
          <div class="text-h5 mb-3">
            🥚 {{ selectedDay.entry?.eggs ?? 0 }}
          </div>

          <div v-if="selectedDay.entry?.note">
            {{ selectedDay.entry.note }}
          </div>

          <div v-else class="text-medium-emphasis">
            No note for this day.
          </div>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </v-container>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { fetchReports, getDate, fetchUserData } from '../db';

const reports = ref([]);
const weekOffset = ref(0);
const sheet = ref(false);
const selectedDay = ref(null);
const currentWeek = ref([]);
const userNames = ref({});

onMounted(async () => {
  reports.value = await fetchReports();
  await loadUserNames();
  currentWeek.value = getCurrentWeek();
});

async function loadUserNames() {
  const userIds = [
    ...new Set(
      reports.value
        .map(report => report.userId)
        .filter(Boolean)
    )
  ];

  for (const userId of userIds) {
    try {
      const userData = await fetchUserData(userId);

      userNames.value[userId] =
        userData.displayName || 'Unknown User';
    } catch (error) {
      console.error('Could not fetch user:', userId, error);
      userNames.value[userId] = 'Unknown User';
    }
  }
}

function getCurrentWeek() {
  const today = new Date();
  const startOfWeek = new Date(today);

  // Convert Sunday to 7 so Monday becomes start of week
  const day = today.getDay() || 7;

  startOfWeek.setDate(
    today.getDate() - day + 1 + weekOffset.value * 7
  );

  const week = [];

  for (let i = 0; i < 7; i++) {
  const date = new Date(startOfWeek);
  date.setDate(startOfWeek.getDate() + i);

  const dateId = getDate(date);
  const reportEntry = reports.value.find(
    entry => entry.id === dateId
  );

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
    entry: reportEntry || null,
  });
}

  return week;
}

function previousWeek() {
  weekOffset.value -= 1;
  currentWeek.value = getCurrentWeek();
}

function nextWeek() {
  if (weekOffset.value < 0) {
    weekOffset.value += 1;
    currentWeek.value = getCurrentWeek();
  }
}

function openDay(day) {
  selectedDay.value = day;
  sheet.value = true;
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