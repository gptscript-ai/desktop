<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useThreads } from '@/stores/threads';
import { type ThreadMessage, type MessageContentText } from 'openai/resources/beta/threads/index.mjs';
import dayjs from 'dayjs';

const route = useRoute()
const assistantId = fromArray(route.params.assistant)
const assistant = await useAssistants().find(assistantId)
const threads = useThreads()

const fakeMessages = reactive<ThreadMessage[]>([])
const waiting = ref(false)

async function send(e: ChatEvent) {
  try {
    clear(fakeMessages)
    fakeMessages.push({
      assistant_id: '',
      content: <MessageContentText[]>[{
        text: {value: e.message},
        type: 'text'
      }],
      created_at: dayjs().valueOf()/1000,
      file_ids: [],
      id: 'pending',
      metadata: {},
      object: 'thread.message',
      role: 'user',
      run_id: '',
      thread_id: ''
    })

    waiting.value = true

    const thread = await threads.create(assistant.id, e.message)
    navigateTo({name: 't-thread', params: {thread: thread.id}})
  } catch (e) {
    useToast().add({
      timeout: 0,
      title: 'Error',
      description: `${e}`
    })
  } finally {
    waiting.value = false
    e.cb()
  }
}

async function edit() {
  navigateTo({name: 'a-assistant-edit', params: {assistant: assistantId}})
}
</script>

<template>
  <div class="px-5 py-2">
    <h1 class="text-2xl">
      {{assistant.name}}

      <div class="float-right">
        <UButton
          icon="i-heroicons-pencil"
          aria-label="Edit"
          @click="edit"
          size="xs"
        />
      </div>
    </h1>
    <UDivider class="mt-2"/>
    <h2 v-if="assistant.description">{{assistant.description}}</h2>

    <Messages v-if="waiting" :waiting="true" v-model="fakeMessages" :assistant="assistant" />

    <chat-input @message="send"/>
  </div>
</template>
