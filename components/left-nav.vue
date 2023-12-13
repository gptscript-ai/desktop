<script lang="ts" setup>
const { data: threads, refresh: refreshThreads } = await useFetch('/v1/threads')
const { data: assistants, refresh: refreshAssistants } = await useFetch('/v1/assistants')

const assistantLinks = computed(() => {
  return assistants.value!.sort((a, b) => a.name?.toLocaleLowerCase().localeCompare(b.name?.toLocaleLowerCase())).map(x => { return {
    label: x.name,
    icon: 'i-heroicons-academic-cap',
    to: `/a/${x.id}`
  }})
})

const threadLinks = computed(() => {
  return threads.value!.sort((a, b) => a.created_at - b.created_at).map((x) => { return {
    label: x.id.split('_')[1].substring(0,8),
    icon: 'i-heroicons-chat-bubble-left',
    to: `/t/${x.id}`
  }})
})
</script>

<template>
  <div class="mt-5">
    <h4>Assistants</h4>
    <UVerticalNavigation :links="assistantLinks" />

    <h4 class="mt-5">
      Threads
    </h4>
    <UVerticalNavigation :links="threadLinks" />
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
</style>
