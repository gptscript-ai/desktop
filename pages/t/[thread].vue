<script setup lang="ts">
import dayjs from 'dayjs';
import { useRoute } from 'vue-router'
import type { MessageContentText, ThreadMessage, Thread } from 'openai/resources/beta/threads';

const route = useRoute()
const threadId = fromArray(route.params.thread)
const messages: ThreadMessage[] = reactive([])
const thread = ref<Thread>()
const assistants = useAssistants()
const upper = ref<HTMLDivElement>()
const waiting = ref(false)

try {
  const data = await $fetch(`/v1/threads/${encodeURIComponent(threadId)}`)

  if ( data ) {
    thread.value = data.thread
    messages.length = 0
    messages.push(...(data.messages || []))
  }
} catch (e) {
}

const assistant = computed(() => {
  const assistantId = (thread.value?.metadata as any)?.assistantId || ''

  return assistants.byId(assistantId)
})

onMounted(() => {
  if ( !thread.value ) {
    useToast().add({
      timeout: 0,
      title: 'Error',
      description: `Unable to load thread: ${threadId}`
    })

    return navigateTo('/')
  }

  scroll()
})

const arrangedMessages = computed(() => {
  // return messages.sort((a, b) => a.created_at - b.created_at)
  return messages.slice().reverse()
})

const previousMessages = computed(() => {
  return arrangedMessages.value.filter(x => x.role === 'user').map(x => x.content?.[0]?.text?.value || '').filter(x => !!x)
})

function scroll() {
  nextTick(() => {
    const div = upper.value
    if ( !div ) {
      return
    }

    div.scrollBy({top: Number.MAX_SAFE_INTEGER})
  })
}

async function send(ev: ChatEvent) {
  try {
    waiting.value = true

    messages.unshift({
      assistant_id: '',
      content: <MessageContentText[]>[{
        text: {value: ev.message},
        type: 'text'
      }],
      created_at: dayjs().valueOf()/1000,
      file_ids: [],
      id: 'pending',
      metadata: {},
      object: 'thread.message',
      role: 'user',
      run_id: '',
      thread_id: `${thread?.id}`,
    })

    scroll()

    const res = await $fetch(`/v1/threads/${encodeURIComponent(threadId)}/send`, {
      method: 'post',
      body: {
        message: ev.message
      },
    })

    if ( res.run.last_error ) {
      useToast().add({
        timeout: 0,
        title: 'Error Sending',
        description: `${res.run.last_error.message}`
      })
    }


    waiting.value = false

    if ( res.messages ) {
      replaceWith(messages, ...res.messages)
    }

    scroll()
  }
  catch (e) {
    useToast().add({
      timeout: 0,
      title: 'Error Sending',
      description: `${e}`
    })
  }
  finally {
    ev.cb()
    waiting.value = false
  }
}

async function remove() {
  await $fetch(`/v1/threads/${encodeURIComponent(threadId)}`, {method: 'DELETE'})
  navigateTo('/')
}

</script>

<template>
  <div>
    <div class="upper" ref="upper">
      <header class="px-5 py-2">
        <h1 class="text-2xl">{{assistant?.name || '?'}}: {{threadId.split('_')[1].substring(0,8)}}
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
      </header>
      <Messages :assistant="assistant" :waiting="waiting" v-model="arrangedMessages"/>
    </div>

    <ChatInput @message="send" :previous="previousMessages"/>
  </div>
</template>

<style lang="scss" scoped>
  .upper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 130px;
    overflow: auto;
  }
</style>
