<template>
  <div class="statistics">
    <canvas ref="weekly"></canvas>
  </div>
  <div class="monthly-chart">
    <canvas ref="monthly"></canvas>
  </div>
</template>


<script setup>
import { onMounted, ref } from 'vue'
import Chart from 'chart.js/auto'
import { useStore } from '../stores/index.js'
import { fetchReportsForWeek, fetchReportsForRange } from '../db.js'
import { getDate } from '../db.js'

const store = useStore()

const weekly = ref(null)
const weekNumbers = ref([])
const weeklyEggs = ref([])
const monthly = ref(null)


let chart = null

onMounted(async () => {
  await loadStatistics()
  await createMonthlyChart()
})

async function loadStatistics() {
  const weeks = getLastSixWeeks()

  weekNumbers.value = weeks.map(
    week => `v. ${week.weekNumber}`
  )

  // Fetch ALL six weeks in one Firestore query
  const firstDate = weeks[0].startDate
  const lastDate = weeks[weeks.length - 1].endDate

  const reports = await fetchReportsForWeek(
    firstDate,
    lastDate
  )

  // Sum eggs for each week
  weeklyEggs.value = weeks.map(week => {
    return reports
      .filter(report => {
        return (
          report.date >= week.startDate &&
          report.date <= week.endDate
        )
      })
      .reduce(
        (sum, report) =>
          sum + Number(report.eggs || 0),
        0
      )
  })

  createChart()
}

function getLastSixWeeks() {
  const selected = store.selectedDate || getDate(new Date())

  const [year, month, day] = selected
    .split('-')
    .map(Number)

  const selectedDate = new Date(
    year,
    month - 1,
    day
  )

  // Find Monday of selected week
  const weekday = selectedDate.getDay() || 7

  const currentMonday = new Date(selectedDate)

  currentMonday.setDate(
    selectedDate.getDate() - weekday + 1
  )

  const weeks = []

  // Oldest -> newest
  for (let i = 5; i >= 0; i--) {
    const monday = new Date(currentMonday)

    monday.setDate(
      currentMonday.getDate() - i * 7
    )

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    weeks.push({
      startDate: getDate(monday),
      endDate: getDate(sunday),
      weekNumber: getISOWeekNumber(monday),
    })
  }

  return weeks
}

function getISOWeekNumber(date) {
  const temp = new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    )
  )

  const day = temp.getUTCDay() || 7

  temp.setUTCDate(
    temp.getUTCDate() + 4 - day
  )

  const yearStart = new Date(
    Date.UTC(temp.getUTCFullYear(), 0, 1)
  )

  return Math.ceil(
    (
      (
        (temp - yearStart) /
        86400000
      ) +
      1
    ) / 7
  )
}

function createChart() {
  if (!weekly.value) return

  // Important if component/chart gets recreated
  if (chart) {
    chart.destroy()
  }

  const ctx = weekly.value.getContext('2d')

  chart = new Chart(ctx, {
    type: 'bar',

    data: {
      labels: weekNumbers.value,

      datasets: [
        {
          label: 'Antal ägg',
          data: weeklyEggs.value,

          backgroundColor:
            'rgba(197, 40, 80, 0.2)',

          borderColor:
            'rgb(197, 40, 80)',

          borderWidth: 1,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false,
        },
      },

      scales: {
        y: {
          beginAtZero: true,

          ticks: {
            precision: 0,
          },
        },
      },
    },
  })
}

function getLast6months() {
  const today = new Date()
  const months = []

  for (let i = 5; i >= 0; i--) {
    const month = new Date(
      today.getFullYear(),
      today.getMonth() - i,
      1
    )

    const year = month.getFullYear()
    const monthIndex = month.getMonth()

    const startDate = new Date(
      year,
      monthIndex,
      1
    )

    const endDate = new Date(
      year,
      monthIndex + 1,
      0
    )

    months.push({
      key: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,

      label: month.toLocaleDateString('sv-SE', {
        month: 'short',
        year: 'numeric',
      }),

      startDate: getDate(startDate),
      endDate: getDate(endDate),
    })
  }

  return months
}

async function loadMonthlyData() {
  const months = getLast6months()

  const reports = await fetchReportsForRange(
    months[0].startDate,
    months[months.length - 1].endDate
  )

  const monthlyEggs = months.map(month => {
    return reports
      .filter(report => {
        return (
          report.date >= month.startDate &&
          report.date <= month.endDate
        )
      })
      .reduce(
        (sum, report) =>
          sum + Number(report.eggs || 0),
        0
      )
  })

  return {
    labels: months.map(month => month.label),
    eggs: monthlyEggs,
  }
}

async function createMonthlyChart() {
  const data = await loadMonthlyData()

  const ctx = monthly.value.getContext('2d')

  new Chart(ctx, {
    type: 'line',

    data: {
      labels: data.labels,

      datasets: [
        {
          label: 'Ägg per månad',
          data: data.eggs,
          borderColor: '#c52850',
          backgroundColor: 'rgba(197, 40, 80, 0.15)',
          tension: 0.3,
          fill: false,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      interaction: {
        mode: 'index',
        intersect: false,
      },

      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  })
}
</script>

<style scoped>
.statistics {
  width: 100%;
  height: 300px;
}

.monthly-chart {
  width: 100%;
  height: 300px;
}
</style>