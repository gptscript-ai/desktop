<script setup lang="ts">
const emit = defineEmits(['filesDropped'])

const active = ref(false)
const last = ref()

function enter(e: DragEvent) {
  last.value = e.target
  active.value = true
}

function leave(e: DragEvent) {
  if (e.target === last.value)
    active.value = false
}

function over(e: DragEvent) {
  e.preventDefault()
}

function drop(e: DragEvent) {
  e.preventDefault()
  active.value = false
  emit('filesDropped', [...e.dataTransfer!.files])
}

onMounted(() => {
  window.addEventListener('dragenter', enter)
  window.addEventListener('dragleave', leave)
  window.addEventListener('dragover', over)
  window.addEventListener('drop', drop)
})

onBeforeUnmount(() => {
  window.removeEventListener('dragenter', enter)
  window.removeEventListener('dragleave', leave)
  window.removeEventListener('dragover', over)
  window.removeEventListener('drop', drop)
})
</script>

<template>
  <Teleport to="body">
    <slot v-if="active" name="default">
      <div class="fixed top-0 right-0 bottom-0 left-0 bg-gray-100/80 dark:bg-gray-900/80" :class="[!active && 'hidden']" style="z-index: 100000;">
        <div class="grid h-screen place-items-center">
          <div class="rounded border-4 border-gray-500 border-dashed p-20 m-20">
            <h1 class="text-2xl">
              Drop to upload files
            </h1>
          </div>
        </div>
      </div>
    </slot>
  </Teleport>
</template>
