<script lang="ts" setup>

import { useAssistants, useThreads } from '@/stores/steve'

const router = useRouter()
const assistants = await useAssistants().findAll()
const threads = useThreads()
const allThreads = await threads.findAll()

const assistantLinks = computed(() => {
  return assistants.map(x => { return {
    label: x.spec.name,
    icon: 'i-heroicons-academic-cap',
    to: `/a/${encodeURIComponent(x.id)}`
  }})
})

const threadLinks = computed(() => {
  return allThreads.map((x) => { return {
    label: x.metadata.name,
    icon: 'i-heroicons-chat-bubble-left',
    to: `/t/${encodeURIComponent(x.id)}`,
    id: x.id
  }})
})

async function remove(e: MouseEvent, id: any) {
  e.stopPropagation();
  e.preventDefault();
  debugger

  const thread = threads.byId(id)

  if ( thread ) {
    await thread.remove()

    if ( router.currentRoute.name === 't-thread' && router.currentRoute.params.thread === id ) {
      navigateTo('/')
    }
  }
}
</script>

<template>
  <div class="mt-5">
    <h4>Assistants</h4>
    <UVerticalNavigation :links="assistantLinks" />

    <h4 class="mt-5">
      Threads
    </h4>
    <UVerticalNavigation :links="threadLinks">
      <template #badge="{ link }">
        <UButton
          class="absolute right-2 delete-btn"
          icon="i-heroicons-trash"
          aria-label="Delete"
          @click="e => remove(e, link.id)"
          size="xs"
        />
      </template>
    </UVerticalNavigation>
  </div>
</template>

<style lang="scss" scoped>
  H4 {
    padding-left: 1rem;
  }

  LI {
    display: block;
  }
  .active {
    background-color: red;
  }

  .delete-btn {
    display: none;
  }

  :deep(A:hover .delete-btn) {
    display: initial;
  }
</style>
