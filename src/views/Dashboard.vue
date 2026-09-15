<template>
    <nav>
        <v-fab
            icon="mdi-calendar-month"
            color="secondary"
            variant="text"
            @click="reportsOpen = !reportsOpen"
        />
        <v-fab
            icon="mdi-calendar-clock"
            color="secondary"
            variant="text"
            @click="scheduleOpen = !scheduleOpen"
        />
        <v-fab
            icon="mdi-finance"
            color="secondary"
            variant="text"
            @click="statsOpen = !statsOpen"
        />
    </nav>
    <Report/>
    
    <v-overlay
    v-model="scheduleOpen"
    persistent
    >
    <v-card
        class="pa-1 ma-4 schedule-card"
        rounded="lg"
        elevation="3"
    >
        <v-card-text class="schedule-content">
        <Schedule />
        </v-card-text>

        <v-card-actions>
        <v-spacer />

        <v-btn
            color="secondary"
            variant="outlined"
            @click="scheduleOpen = false"
        >
            Stäng
        </v-btn>
        </v-card-actions>
    </v-card>
    </v-overlay>

    <v-overlay
  v-model="reportsOpen"
  persistent
>
  <v-card
    class="pa-1 reports-card"
    rounded="lg"
    elevation="3"
  >
    <v-card-text class="reports-content">
      <Reports />
    </v-card-text>

    <v-card-actions>
      <v-spacer />

      <v-btn
        color="secondary"
        variant="outlined"
        @click="reportsOpen = false"
      >
        Stäng
      </v-btn>
    </v-card-actions>
  </v-card>
</v-overlay>

<v-overlay
  v-model="statsOpen"
  persistent
>
  <v-card
    class="pa-1 stats-card"
    rounded="lg"
    elevation="3"
  >
    <v-card-text class="stats-content">
      <Stats />
    </v-card-text>

    <v-card-actions>
      <v-spacer />

      <v-btn
        color="secondary"
        variant="outlined"
        @click="statsOpen = false"
      >
        Stäng
      </v-btn>
    </v-card-actions>
  </v-card>
</v-overlay>
</template>


<script setup>
import Schedule from '@/components/Schedule.vue';
import { ref } from 'vue'
import Report from '@/components/Report.vue';
import Reports from '@/views/Reports.vue'
import Stats from '@/components/Stats.vue';

const reportsOpen = ref(false)
const scheduleOpen = ref(false)
const statsOpen = ref(false)
</script>

<style scoped>
.schedule-card {
  width: calc(100vw - 32px);
  max-height: 90dvh;

  display: flex;
  flex-direction: column;
}

.schedule-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  -webkit-overflow-scrolling: touch;
}

.reports-card {
  width: 90%;
  max-width: 600px;
  height: 90dvh;
  display: flex;
  flex-direction: column;
}

.reports-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.stats-card {
  width: 90%;
  max-width: 600px;
  height: 90dvh;
  display: flex;
  flex-direction: column;
}



.stats-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

:deep(.v-overlay__content) {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 12px;
}
</style>