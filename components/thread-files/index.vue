<script setup lang="ts">
import type { Thread } from '~/types';

interface Props {
  thread?: Thread
}

const { thread } = defineProps<Props>()

</script>

<template>
  <div>
    <ThreadFilesLevel
      v-if="thread?.workspace?.length"
      :children="thread.workspace"
      base=""
    />
    <div v-else class="text-sm text-gray-500">
      Drag files here to give Clicky access to them.<br/><br/>
      Files he creates will appear here too.
    </div>
  </div>
</template>
