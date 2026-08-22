<template>
  <div class="calendar-container">
    <div v-if="selectedDate" class="selected-date">
     {{ formattedDate }}
    </div>
    <div class="d-flex justify-center">
      <v-date-input
        class="date-input"
        v-model="selectedDate"
        label="Välj annat datum"
        locale="sv"
        variant="outlined"
        color="primary"
        prepend-icon=""
        prepend-inner-icon="$calendar"
        @click:clear="resetToToday"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useStore } from '../stores/index.js'
import { getDate } from '../db.js'

const store = useStore()

function resetToToday() {
  selectedDate.value = new Date()
}

const selectedDate = ref(new Date())

const formattedDate = computed(() => {
  if (!selectedDate.value) {
    return ''
  }

  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'full',
  }).format(new Date(selectedDate.value))
})

watch(selectedDate, (newDate) => {
  if (!newDate) return

  store.selectedDate = getDate(newDate)
})
</script>

<style scoped>
.calendar-container {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  padding: 1rem;
}

.selected-date {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: #c52850;
}

.date-input {
  width: 80%;
}
</style>