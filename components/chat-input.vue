<script setup lang="ts">

declare global {
  interface ChatEvent {
    message: string,
    cb: () => void
  }
}

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: 'message', value: ChatEvent): void
}>()

const waiting = ref(false)
const message = ref('')

async function send() {
  const ev: ChatEvent = {
    message: message.value,
    cb: () => {
      waiting.value = false
    }
  }

  waiting.value = true
  message.value = ''
  console.log('Send', ev)
  emit('message', ev)
}

function keypress(e: KeyboardEvent) {
  if ( e.code === 'Enter' && !e.shiftKey ) {
    e.preventDefault()
    e.stopPropagation()
    send()
  }
}
</script>

<template>
  <div class="input">
    <UTextarea v-if="waiting" placeholder="Thinking…"/>
    <UTextarea v-else placeholder="Say something…" v-model="message" @keypress="keypress" autofocus class="inside-btn">
      <UButton :disabled="waiting || !message" @click="send" class="send" icon="i-heroicons-arrow-uturn-right"/>
    </UTextarea>
  </div>
</template>

<style lang="scss" scoped>
.input {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
}
.inside-btn {
  position: relative;

  :deep(TEXTAREA) {
    padding-right: 64px;
  }

  .send {
    position: absolute;
    top: calc(50% - 16px);
    right: 25px;
  }
}
</style>
