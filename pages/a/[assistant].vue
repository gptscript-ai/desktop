<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const assistantId = fromArray(route.params.assistant)

const assistant = await $fetch(`/v1/assistants/${encodeURIComponent(assistantId)}`)

async function send(e: ChatEvent) {
  try {
    const thread = await $fetch('/v1/threads', {
      method: 'post',
      body: {
        assistantId: assistant.id,
        message: e.message
      }
    })

    navigateTo({name: 't-thread', params: {thread: thread.id}})
  } catch (err) {

  } finally {
    e.cb()
  }
}
</script>

<template>
  <div>
    <h1>{{assistant.name}}</h1>
    <h2>{{assistant.description}}</h2>
    <div>{{assistant.instructions}}</div>

    <chat-input @message="send"/>
  </div>
</template>
