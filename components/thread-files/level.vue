<script setup lang="ts">
import type { ThreadDirEntry } from '@/types'

interface Props {
  base:        string
  children:    ThreadDirEntry[]
  depth?:      number
  activeFile?: string
}

const { base, children, depth } = withDefaults(defineProps<Props>(), {
  base:  '',
  depth: 0,
})

const emit = defineEmits<{
  open: [name: string]
}>()

function iconFor(obj: ThreadDirEntry) {
  if (obj.type === 'dir') {
    return 'i-heroicons-folder'
  } else {
    return 'i-heroicons-document-text'
  }
}

function classesFor(obj: ThreadDirEntry) {
  if (obj.type !== 'file') {
    return []
  }

  return [
    'hover:bg-blue-200',
    'hover:text-black',
    'cursor-pointer',
    'data-[active=true]:bg-blue-500',
    'data-[active=true]:text-white',
  ]
}
</script>

<template>
  <ul>
    <li
      v-for="obj in children"
      :key="`${base}-${obj.name}`"
    >
      <div
        class="relative px-2 py-1"
        :style="`padding-left: ${(depth + 1) / 2}rem`"
        :class="classesFor(obj)"
        :data-active="obj.type === 'file' && activeFile === obj.path"
        @click="obj.type === 'file' && emit('open', obj.path)"
      >
        <UIcon :name="iconFor(obj)" />
        {{ obj.name }}
      </div>

      <ThreadFilesLevel
        v-if="obj.type === 'dir' && obj.children.length"
        :base="`${base}-${obj.name}`"
        :children="obj.children"
        :depth="depth + 1"
        :active-file="activeFile"
        @open="file => emit('open', file)"
      />
    </li>
  </ul>
</template>
