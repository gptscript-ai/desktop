<script lang="ts" setup>
import { getFileContents } from '@/utils/file'

const {
  icon = true,
  size = 'sm',
  variant = 'solid',
  waiting = false,
} = defineProps<Props>()

const emit = defineEmits(['error', 'file'])

const uploader = ref<HTMLInputElement>()

interface Props {
  icon?   : boolean
  size?   : string
  variant?: string
  waiting?: boolean
}

function show() {
  if (!uploader.value) {
    return
  }

  uploader.value.click()
}

async function fileChange(event: InputEvent) {
  const input = event.target as HTMLInputElement

  if (!input) {
    return
  }

  const files = Array.from(input.files || [])

  try {
    const asyncFileContents = files.map(getFileContents)
    const fileContents = await Promise.all(asyncFileContents)

    for (const f of fileContents) {
      emit('file', f)
    }
  } catch (error) {
    emit('error', error)
  }
}
</script>

<template>
  <span>
    <slot name="default" :show="show">
      <UButton
        :icon="icon ? 'i-heroicons-arrow-up-tray' : ''"
        aria-label="Upload"
        :size="size"
        :variant="variant"
        :loading="waiting"
        :disabled="waiting"
        v-bind="$attrs"
        @click="show"
      >
        <template v-if="waiting">Uploading…</template>
        <template v-else>Upload</template>
      </UButton>
    </slot>

    <input
      ref="uploader"
      type="file"
      class="hidden"
      @change="(e) => fileChange(e as any)"
    >
  </span>
</template>
