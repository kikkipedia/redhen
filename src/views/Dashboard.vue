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
            variant="plain"
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
      class="align-center justify-center pa-1 ma-4 reports-card"
      rounded="lg"
      elevation="3"
    >
      <v-card-text>
        <Reports/>
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
</template>


<script setup>
import Schedule from '@/components/Schedule.vue';
import { ref } from 'vue'
import Report from '@/components/Report.vue';
import Reports from '@/views/Reports.vue'

const reportsOpen = ref(false)
const scheduleOpen = ref(false)
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
</style>