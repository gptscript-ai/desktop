<script setup lang="ts">
import ModalApiKeys from '@/components/modal/api-key.vue'

const gpt = useGpt()

useHead({ bodyAttrs: { class: 'bg-gray-100 dark:bg-gray-950' } })

const prefs = usePrefs()
const threads = useThreads()
const loaded = ref(false)

onMounted(async () => {
  await Promise.all([
    prefs.load(),
    threads.load(),
  ])
  loaded.value = true

  if ( !prefs.openaiApiKey ) {
    const modal = useModal()

    modal.open(ModalApiKeys, {
      onDone() {
        modal.close()
      },
    })
  }
})


</script>

<template>
  <div>
    <NuxtPage v-if="loaded"/>
    <div v-else>Loading…</div>
    <UModals/>
    <UNotifications/>
  </div>
</template>
