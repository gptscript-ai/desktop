<script setup lang="ts">
import type { ThreadDirEntry, ThreadFile } from '~/types';

interface Props {
  base: string
  children: ThreadDirEntry[]
  depth?: number
}

const { base, children: allFiles, depth } = withDefaults(defineProps<Props>(), {
  base: '',
  depth: 0
})

function iconFor(obj: ThreadDirEntry) {
  if ( obj.type === 'dir' ) {
    return 'i-heroicons-folder'
  } else {
    return 'i-heroicons-document'
  }
}

</script>

<template>
  <ul>
    <li
      :style="`padding-left: ${depth/2}rem`"
      v-for="obj in children" :key="base + '-' + obj.name"
    >
      <UIcon :name="iconFor(obj)"/>
      {{obj.name}}

      <ThreadFilesLevel
        v-if="obj.type === 'dir' && obj.children.length"
        :base="base+'-'+obj.name"
        :children="obj.children"
        :depth="depth+1"
      />
    </li>
  </ul>
</template>
