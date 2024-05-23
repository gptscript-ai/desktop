<script setup lang="ts">
import dayjs from 'dayjs'

interface Props {
  modelValue: number
}

const { modelValue } = defineProps<Props>()

const parsed = computed(() => {
  return dayjs(modelValue * 1000).local()
})

const long = computed(() => {
  const v = parsed.value

  return v.format('ddd MMM D, YYYY h:mm:ss A')
})

const short = computed(() => {
  const v = parsed.value

  if (v.isToday()) {
    return v.format('h:mm:ss A')
  } else {
    return long.value
  }
})
</script>

<template>
  <span v-if="long === short">
    {{ long }}
  </span>
  <UTooltip v-else :text="long">
    {{ short }}
  </UTooltip>
</template>
