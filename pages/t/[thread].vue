<script setup lang="ts">
// import dayjs from 'dayjs';
import { useRoute } from 'vue-router'
import { SparklesIcon } from '@heroicons/vue/24/outline'
import { UserIcon } from '@heroicons/vue/24/solid'
import { useMessages } from '@/stores/steve';

const route = useRoute()
const threadId = fromArray(route.params.thread)
const container = ref<HTMLDivElement>()

const thread = await useThreads().find(threadId)
const messages = useMessages()

onMounted(() => {
  scroll()
})

const arrangedMessages = computed(() => {
  const out: DecoratedMessage[] = []

  function byName(name: string) {
    return messages.byId(thread.metadata.namespace + '/' + name)
  }

  let msg: DecoratedMessage|undefined

  if ( thread.spec?.startMessageName ) {
    msg = byName(thread.spec?.startMessageName)
  }

  while ( msg ) {
    out.push(msg)
    if ( msg.status?.nextMessageName ) {
      msg = byName(msg.status.nextMessageName)
    } else {
      msg = undefined
    }
  }

  return out
})

function scroll() {
  nextTick(() => {
    container.value?.scrollBy({top: 10000})
  })
}

async function send(ev: ChatEvent) {
  try {
    // messages.push({
    //   created_at: dayjs().valueOf()/1000,
    //   id: 'pending',
    //   role: 'user',
    //   content: <MessageContentText[]>[{
    //     text: {value: ev.message},
    //     type: 'text'
    //   }]
    // })

    // scroll()

    const res = await $fetch(`/v1/threads/${encodeURIComponent(threadId)}/send`, {
      method: 'post',
      body: {
        message: ev.message
      },
    })

    // replaceWith(messages, ...res.messages)
    scroll()
  }
  catch (e) {
  }
  finally {
    ev.cb()
  }
}

function textToHtml(text: string) {
  try {
    const res = JSON.parse(text)

    return nlToBr(JSON.stringify(res, null, 2))
  } catch (e) {
    return escapeHtml(text)
  }
}
</script>

<template>
  <div>
    <div class="messages" ref="container">
      <div v-for="m in arrangedMessages" :key="m.id" :class="['message', m.status.message.role]">
        <div class="content">
          <template v-for="(c, idx) of m.status.message.content" :key="idx">
            <span v-if="c.text" v-html="textToHtml(c.text)"/>
            <template v-else-if="c.image">
              <img :src="`data:${c.image.contentType};base64,${c.image.base64}`"/>
            </template>
            <template v-else-if="c.toolCall?.['function']">
              <pre><code class="break-words">{{c.toolCall['function'].name}}(<span v-html="textToHtml(c.toolCall['function'].arguments)"></span>)</code></pre>
            </template>
            <template v-else>
              {{c}}
            </template>
          </template>
        </div>
        <div class="date">
          <UserIcon v-if="m.status.message.role === 'user'" class="icon"/>
          <SparklesIcon v-else class="icon"/>
          <RelativeDate v-model="(m.metadata.creationTimestamp as string)"/>
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

    &.assistant, &.tool {
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
