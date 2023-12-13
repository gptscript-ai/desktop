<script setup lang="ts">
import dayjs from 'dayjs';
import type { MessageContentText, ThreadMessage } from 'openai/resources/beta/threads';
import { useRoute } from 'vue-router'
import { SparklesIcon } from '@heroicons/vue/24/outline'
import { UserIcon } from '@heroicons/vue/24/solid'

const route = useRoute()
const threadId = fromArray(route.params.thread)
const messages: ThreadMessage[] = reactive([])
const container = ref<HTMLDivElement>()

const { thread, messages: initialMessages } = await $fetch(`/v1/threads/${encodeURIComponent(threadId)}`)

messages.push(...initialMessages)

onMounted(() => {
  scroll()
})

const arrangedMessages = computed(() => {
  return messages.sort((a, b) => a.created_at - b.created_at)
})

function scroll() {
  nextTick(() => {
    container.value?.scrollBy({top: 10000})
  })
}

async function send(ev: ChatEvent) {
  try {
    messages.push({
      created_at: dayjs().valueOf()/1000,
      id: 'pending',
      role: 'user',
      content: <MessageContentText[]>[{
        text: {value: ev.message},
        type: 'text'
      }]
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
</script>

<template>
  <div>
    <div class="messages" ref="container">
      <div v-for="m in arrangedMessages" :key="m.id" :class="['message', m.role]">
        <div class="content">
          <template v-for="(c, idx) of m.content" :key="idx">
            <template v-if="c.type === 'text'">
              {{c.text.value}}
            </template>
            <template v-else>
              {{c}}
            </template>
          </template>
        </div>
        <div class="date">
          <UserIcon v-if="m.role === 'user'" class="icon"/>
          <SparklesIcon v-else class="icon"/>
          <RelativeDate v-model="m.created_at"/>
        </div>
      </div>
    </div>

    <chat-input @message="send"/>
  </div>
</template>

<style lang="scss" scoped>
  .messages {
      display: grid;
      grid-template-columns: 1fr 3fr 1fr;

      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      max-height: calc(100vh - 130px);
      overflow: auto;

      padding-top: 20px;
  }

  .message {
    padding: 1rem;
    margin: 1rem;
    border-radius: 1rem;
    position: relative;

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
      font-size: 10px;
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
