<script setup lang="ts">
import { useRoute } from 'vue-router'
import type { MessageContentText, ThreadMessage } from 'openai/resources/beta/threads/index.mjs'
import dayjs from 'dayjs'
import { useThreads } from '@/stores/threads'
import { renderMarkdown } from '@/utils/markdown'

const route = useRoute()
const assistantId = fromArray(route.params.assistant)
const assistant = await useAssistants().find(assistantId)
const threads = useThreads()

const fakeMessages = reactive<ThreadMessage[]>([])
const waiting = ref(false)

useHead({ title: assistant.name })

async function send(e: ChatEvent) {
  try {
    clear(fakeMessages)
    fakeMessages.push({
      assistant_id: '',
      content: [{
        text: { value: e.message },
        type: 'text',
      }] as MessageContentText[],
      created_at: dayjs().valueOf() / 1000,
      file_ids: [],
      id: 'pending',
      metadata: {},
      object: 'thread.message',
      role: 'user',
      run_id: '',
      thread_id: '',
    })

    waiting.value = true

    const { thread, run } = await threads.create(assistant.id, e.message)

    if (run?.last_error) {
      useToast().add({
        timeout: 0,
        title: 'Error Sending',
        description: `${run.last_error.message}`,
      })
    }

    navigateTo({ name: 't-thread', params: { thread: thread.id } })
  }
  catch (e) {
    useToast().add({
      timeout: 0,
      title: 'Error',
      description: `${e}`,
    })
  }
  finally {
    waiting.value = false
    e.cb()
  }
}

async function edit() {
  navigateTo({ name: 'a-assistant-edit', params: { assistant: assistantId } })
}
</script>

<template>
  <div class="px-5 py-2">
    <h1 class="text-2xl">
      {{ assistant.name }}

      <div class="float-right">
        <UButton
          icon="i-heroicons-pencil"
          aria-label="Edit"
          size="xs"
          @click="edit"
        />
      </div>
    </h1>
    <UDivider class="mt-2" />
    <h2 v-if="assistant.description" class="text-gray-500" v-html="renderMarkdown(assistant.description)" />

    <Messages v-if="waiting" v-model="fakeMessages" :waiting="true" :assistant="assistant" />

    <chat-input @message="send" />
  </div>
</template>
