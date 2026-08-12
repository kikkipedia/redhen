<template>
  <div class="reports-container">
    

  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { fetchReports } from '../db'; 

const reports = ref(null);

onMounted(async() => {
  reports.value = await fetchReports();
  console.log('Reports component mounted', reports.value);
});
</script>