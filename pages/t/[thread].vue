<script setup lang="ts">
// import dayjs from 'dayjs';
import { useRoute } from 'vue-router'
import { SparklesIcon } from '@heroicons/vue/24/outline'
import { UserIcon } from '@heroicons/vue/24/solid'
import { useMessages } from '@/stores/steve';
import { MESSAGE } from '@/config/schemas';

const route = useRoute()
const threadId = fromArray(route.params.thread)
const container = ref<HTMLDivElement>()

const thread = await useThreads().find(threadId)
const messages = useMessages()

interface ThreadedMessage {
  msg: DecoratedMessage
  depth: number
}

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

  return out.map(msg => {
    let depth = 0
    let cur = msg

    while ( cur?.spec.parentMessageName ) {
      depth++
      cur = messages.byId(cur.metadata.namespace + '/' + cur.spec.parentMessageName)
    }

    return <ThreadedMessage>{msg, depth}
  })
})

const lastMessage = computed(() => {
  const msgs = arrangedMessages.value

  for ( let i = msgs.length - 1 ; i >= 0 ; i-- ) {
    if ( msgs[i].msg.status.message.role === 'assistant' ) {
      return msgs[i].msg
    }
  }
})

function scroll() {
  nextTick(() => {
    container.value?.scrollBy({top: 10000})
  })
}

async function send(ev: ChatEvent) {
  const parent = lastMessage.value

  if (!parent ) {
    ev.cb()
    return
  }

  try {
    const msg = await messages.create({
      type: MESSAGE,
      metadata: {
        namespace: 'acorn',
        generateName: 'ui-'
      },
      spec: {
        parentMessageName: parent.metadata.name,
        input: {
          content: [{
            text: ev.message
          }]
        }
      }
    })

    await msg.save()

    scroll()
  }
  catch (e) {
  }
  finally {
    ev.cb()
  }
}

function isJson(text: string) {
  if ( !text.match(/\s*{/) ) {
    return false
  }

  try {
    JSON.parse(text)
    return true
  } catch (e) {
    return false
  }
}

function toJsonText(text: string) {
  return escapeHtml(JSON.stringify(JSON.parse(text), null, 2))
}

</script>

<template>
  <div>
    <div class="messages" ref="container">
      <div v-for="m in arrangedMessages" :key="m.msg.id" :class="['message', m.msg.status.message.role]" :style="`margin-left: ${m.depth+1}rem`">
        <div class="content">
          <template v-for="(c, idx) of m.msg.status.message.content" :key="idx">
            <code v-if="c.text && isJson(c.text)"><pre v-html="toJsonText(c.text)"/></code>
            <span v-else-if="c.text">{{c.text}}</span>
            <template v-else-if="c.image">
              <img :src="`data:${c.image.contentType};base64,${c.image.base64}`"/>
            </template>
            <template v-else-if="c.toolCall?.['function']">
              <pre><code class="break-words">{{c.toolCall['function'].name}}(<span v-html="toJsonText(c.toolCall['function'].arguments)"/>)</code></pre>
            </template>
            <template v-else>
              {{c}}
            </template>
          </template>
        </div>
        <div class="date">
          <UserIcon v-if="m.msg.status.message.role === 'user'" class="icon"/>
          <SparklesIcon v-else class="icon"/>
          <RelativeDate v-model="(m.msg.metadata.creationTimestamp as string)"/>
          ({{m.depth}})
        </div>
      </div>
    </div>

    <chat-input @message="send"/>
  </div>
</template>

<style lang="scss" scoped>
  .messages {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      max-height: calc(100vh - 130px);
      overflow: auto;
  }

  .message {
    padding: 1rem;
    margin: 1rem;
    margin-bottom: 40px;
    border-radius: 1rem;
    position: relative;

    &.user .content {
      color: white;
    }

    &.user {
      background-color: #5676ff;
      border: 1px solid #0c0eff;
    }

    &.assistant, &.tool {
      background-color: rgba(128, 128, 128, 0.1);
      border: 1px solid rgba(128, 128, 128, 0.2);
    }

    .date {
      font-size: 10px;
      position: absolute;
      left: 0;
      bottom: -20px;
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
