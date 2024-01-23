<script setup lang="ts">
import { MESSAGE, THREAD } from '@/config/schemas';
import { useRoute } from 'vue-router'

const route = useRoute()
const assistantId = fromArray(route.params.assistant)

const assistants = useAssistants()
const messages = useMessages()
const threads = useThreads()
const assistant = await assistants.find(assistantId)

async function send(e: ChatEvent) {
  try {
    const msg = await messages.create({
      type: MESSAGE,
      metadata: {
        namespace: assistant.metadata.namespace,
        generateName: 'ui-'
      },
      spec: {
        input: {
          content: [{
            text: e.message
          }]
        }
      }
    })

    await msg.save()

    const thread = await threads.create({
      type: THREAD,
      metadata: {
        namespace: msg.metadata.namespace,
        generateName: 'ui-'
      },
      spec: {
        assistantName: assistant.metadata.name!,
        startMessageName: msg.metadata.name
      }
    })

    await thread.save()


    navigateTo({name: 't-thread', params: {thread: thread.id}})
  } catch (err) {
    console.error(err)
    debugger
  } finally {
    e.cb()
  }
}
</script>

<template>
  <div>
    <h1>{{assistant.spec.name}}</h1>
    <h2>{{assistant.spec.description}}</h2>
    <div>{{assistant.spec.instructions}}</div>

    <chat-input @message="send"/>
  </div>
</template>
