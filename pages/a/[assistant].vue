<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useThreads } from '@/stores/threads';

const route = useRoute()
const assistantId = fromArray(route.params.assistant)
const assistant = await useAssistants().find(assistantId)
const threads = useThreads()

async function send(e: ChatEvent) {
  try {
    const thread = await threads.create(assistant.id, e.message)
    navigateTo({name: 't-thread', params: {thread: thread.id}})
  } catch (err) {

  } finally {
    e.cb()
  }
}

async function remove() {
  await $fetch(`/v1/assistants/${encodeURIComponent(assistantId)}`, {method: 'DELETE'})
  navigateTo('/')
}
</script>

<template>
  <div class="p-5">
    <h1 class="text-2xl">
      {{assistant.name}}

      <div class="float-right">
        <UButton
          icon="i-heroicons-trash"
          aria-label="Delete"
          @click="remove"
          size="xs"
        />
      </div>
    </h1>
    <UDivider class="mt-2"/>
    <h2>{{assistant.description}}</h2>
    <div>{{assistant.instructions}}</div>

    <UAccordion :items="[{label: 'Show Raw', content: ''}]" class="mt-5">
      <template #item>
        <code><pre>{{JSON.stringify(assistant, null, 2)}}</pre></code>
      </template>
    </UAccordion>

    <chat-input @message="send"/>
  </div>
</template>
