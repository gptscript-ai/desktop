<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute()
const threadId = fromArray(route.params.id)

const thread = await $fetch(`/v1/threads/${encodeURIComponent(threadId)}`)


</script>

<template>
  <div>
    Thread: {{id}}
  </div>
</template>
