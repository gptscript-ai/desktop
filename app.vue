<script setup lang="ts">
const gpt = useGpt()

useHead({ bodyAttrs: { class: 'bg-gray-100 dark:bg-gray-900' } })
</script>

<template>
  <NuxtPage/>
  <UModals/>
  <UNotifications/>
</template>
