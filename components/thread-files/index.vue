<script setup lang="ts">
import type { Thread } from '~/types'

interface Props {
  thread?:     Thread
  activeFile?: string
}

const { thread, activeFile } = defineProps<Props>()

const emit = defineEmits<{
  open: [name: string]
}>()

const threads = useThreads()
const uploading = ref(0)

async function onDrop(files: File[]) {
  const form = new FormData()

  if (!thread) {
    return
  }

  for (const file of files) {
    form.append(file.name, file)
  }

  uploading.value = files.length

  try {
    await $fetch(addParam('/api/upload', 'thread', thread!.id), {
      method: 'POST',
      body:   form,
    })
  } finally {
    await threads.refresh(thread.id)
    uploading.value = 0
  }
}
</script>

<template>
  <div>
    <ThreadFilesLevel
      v-if="thread?.workspace?.length"
      :key="`${thread?.id}-${thread?.generation}`"
      :children="thread.workspace"
      base=""
      class="text-sm"
      :active-file="activeFile"
      @open="file => emit('open', file)"
    />
    <div v-else class="text-sm text-gray-500 p-2">
      Drag files into this window to give Clicky access to them.<br><br>
      Files he creates will appear here too.
    </div>
    <FileDrop v-if="thread" @files-dropped="onDrop" />

    <div v-if="uploading" class="absolute p-4 w-[200px] right-0 bottom-0 border-t border-gray-300">
      <div class="text-gray-600 text-sm">
        <span v-if="uploading > 1">Adding {{ uploading }} files…</span>
        <span v-else> 1">Adding file…</span>
      </div>
      <div class="pt-2">
        <UProgress animation="carousel" />
      </div>
    </div>
  </div>
</template>
