<script setup lang="ts">
import dayjs from 'dayjs';
import { useRoute } from 'vue-router'
import type { MessageContentText, ThreadMessage, Thread } from 'openai/resources/beta/threads';
import type { Assistant } from 'openai/resources/beta/assistants';

import { SparklesIcon } from '@heroicons/vue/24/outline'
import { UserIcon } from '@heroicons/vue/24/solid'

import MarkdownIt from 'markdown-it'

const route = useRoute()
const threadId = fromArray(route.params.thread)
const messages: ThreadMessage[] = reactive([])
const thread = ref<Thread>()
const assistants = useAssistants()
const upper = ref<HTMLDivElement>()

const {data, pending } = useFetch(`/v1/threads/${encodeURIComponent(threadId)}`)

const assistant = computed(() => {
  const assistantId = (thread.value.metadata as any)?.assistantId || ''

  return assistants.byId(assistantId)
})

watch(() => data.value, async (neu) => {
  if  (!neu ) {
    return
  }

  thread.value = neu.thread
  messages.length = 0
  messages.push(...(neu.messages || []))
  scroll()
})

onMounted(() => {
  scroll()
})

const arrangedMessages = computed(() => {
  // return messages.sort((a, b) => a.created_at - b.created_at)
  return messages.slice().reverse()
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

    replaceWith(messages, ...res.messages)
    scroll()
  }
  catch (e) {
  }
  finally {
    ev.cb()
  }
}

async function remove() {
  await $fetch(`/v1/threads/${encodeURIComponent(threadId)}`, {method: 'DELETE'})
  navigateTo('/')
}

function markdownToHtml(markdownText: string) {
  const md = new MarkdownIt();
  return md.render(markdownText);
};
</script>

<template>
  <div v-if="pending" class="my-10 text-center">Loading…</div>
  <div v-else>
    <div class="upper" ref="upper">
      <header class="px-5 py-2">
        <h1 class="text-2xl">{{assistant?.name}}
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
      <div class="messages">
        <div v-for="m in arrangedMessages" :key="m.id" :class="['message', m.role]">
          <div class="content">
            <template v-for="(c, idx) in m.content" :key="idx">
              <!-- Check if the content is of type 'text' and render it as Markdown -->
              <div v-if="c.type === 'text'" v-html="markdownToHtml(c.text.value)"></div>
              <!-- Fallback for other types -->
              <template v-else>
                {{ c }}
              </template>
            </template>
          </div>
          <div class="date">
            <UTooltip>
              <template #text>
                <RelativeDate v-model="m.created_at"/>
              </template>

              <template v-if="m.role === 'user'">
                <UserIcon class="icon"/> You
              </template>
              <template v-else>
                <SparklesIcon class="icon"/> Rubra
              </template>
            </UTooltip>
          </div>
        </div>
      </div>
    </div>

    <chat-input @message="send"/>
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
  .messages {
      display: grid;
      grid-template-columns: 1fr 3fr 1fr;
      padding-top: 20px;
  }

  .message {
    padding: 1rem;
    margin: 1rem;
    border-radius: 1rem;
    position: relative;

    .content {
      word-wrap: break-word;
      word-break: break-all;
    }

    &.user .content {
      color: white;
    }

    &.user {
      grid-column: 1/ span 2;

      background-color: #5676ff;
      border: 1px solid #0c0eff;
    }

    &.assistant {
      grid-column: 2/ span 2;
      background-color: rgba(128, 128, 128, 0.1);
      border: 1px solid rgba(128, 128, 128, 0.2);
    }

    .date {
      position: absolute;
      left: 0;
      top: -20px;
      line-height: 16px;
    }

    .icon {
      height: 16px;
      display: inline-block;
      position: relative;
      top: -2px;
      margin-right: 5px;
    }
  }
</style>
