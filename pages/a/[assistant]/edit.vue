<script lang="ts" setup>
const route = useRoute()
const assistantId = fromArray(route.params.assistant)
</script>

<template>
  <div>
    <EditAssistant :id="assistantId" />
  </div>
</template>
