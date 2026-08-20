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
        />
        <v-fab
            icon="mdi-finance"
            color="secondary"
            variant="text"
        />
    </nav>
    <Report/>
    <v-overlay
    v-model="reportsOpen"
    persistent
  >
    <v-card
      class="align-center justify-center pa-1 ma-4 reports-card"
      rounded="lg"
      elevation="3"
    >
      <!-- <v-card-title>Rapporter</v-card-title> -->
      <v-card-text>
        <Reports/>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
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
import Calendar from '@/components/Calendar.vue';
import { ref } from 'vue'
import Report from '@/components/Report.vue';
import Reports from '@/views/Reports.vue'

const reportsOpen = ref(false)
</script>