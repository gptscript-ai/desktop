<script setup lang="ts">
interface Props {
  previous?: string[]
}

const { previous = [] } = defineProps<Props>()

const emit = defineEmits<{
  (e: 'message', value: ChatEvent): void
}>()

declare global {
  interface ChatEvent {
    message: string
    cb: () => void
  }
}

const waiting = ref(false)
const message = ref('')

async function send() {
  const ev: ChatEvent = {
    message: message.value,
    cb: () => {
      waiting.value = false
    },
  }

  waiting.value = true
  message.value = ''
  emit('message', ev)
}

function keypress(e: KeyboardEvent) {
  if (e.code === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    e.stopPropagation()
    send()
  }
}

function keyup(e: KeyboardEvent) {
  const idx = previous.indexOf(message.value || '')

  if (e.code === 'ArrowUp' && !message.value)
    message.value = previous[previous.length - 1]
  else if (e.code === 'ArrowUp' && idx > 0)
    message.value = previous[idx - 1]
  else if (e.code === 'ArrowDown' && idx >= 0 && idx + 1 === previous.length)
    message.value = ''
  else if (e.code === 'ArrowDown' && idx >= 0 && idx + 1 < previous.length)
    message.value = previous[idx + 1]
}
</script>

<template>
  <div class="input">
    <UTextarea v-if="waiting" disabled placeholder="Thinking…" />
    <UTextarea v-else v-model="message" placeholder="Say something…" autofocus class="inside-btn" @keyup="keyup" @keypress="keypress">
      <UButton :disabled="waiting || !message" class="send" icon="i-heroicons-arrow-uturn-right" @click="send" />
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
