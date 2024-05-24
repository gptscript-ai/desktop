<script setup lang="ts">
import type { ChatInputEvent } from '~/types'

interface Props {
  previous?:       string[]
  initialMessage?: string
}

const {
  previous,
  initialMessage,
} = defineProps<Props>()

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: 'message', value: ChatInputEvent): void
}>()

const waiting = ref(false)
const message = ref(initialMessage || '')

defineExpose({ send })

async function send() {
  const ev: ChatInputEvent = {
    message: message.value,
    cb() {
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

function keydown(e: KeyboardEvent) {
  const el = e.target as HTMLTextAreaElement

  if (!el || !previous?.length) {
    return
  }

  const idx = previous.indexOf(message.value || '')

  const start = el.selectionStart
  const end = el.selectionEnd
  const len = el.value.length

  if (start !== end) {
    return
  }

  // if (start === 0 && e.code === 'ArrowUp') {
  //   emit('focusUp')
  // } else if (start === len && e.code === 'ArrowDown') {
  // }

  let newIdx = -1
  const toEnd = e.code === 'ArrowDown'

  if (e.code === 'ArrowUp' && start === 0) {
    if (message.value) {
      newIdx = idx - 1
    } else {
      newIdx = previous.length - 1
    }
  } else if (e.code === 'ArrowDown' && start === len && message.value) {
    if (idx >= 0 && (idx + 1) === previous.length) {
      message.value = ''

      return
    } else {
      newIdx = idx + 1
    }
  }

  if (newIdx !== -1) {
    newIdx = Math.max(0, Math.min(newIdx, previous.length - 1))
    message.value  = previous[newIdx]
    if (toEnd) {
      nextTick(() => {
        el.setSelectionRange(el.value.length, el.value.length)
      })
    }
  }
}

const placeholder = computed(() => {
  return `Say something…\nHit Enter to send, Shift+Enter to add a line-break${  previous?.length ? '\nUp/Down to access previous messages' : '' }`
})
</script>

<template>
  <div class="input">
    <UTextarea
      v-if="waiting"
      disabled
      placeholder="Thinking…"
    />
    <UTextarea
      v-else
      v-model="message"
      :placeholder="placeholder"
      autofocus
      class="inside-btn"
      @keydown="keydown"
      @keypress="keypress"
    >
      <UButton
        class="send"
        :disabled="waiting || !message"
        icon="i-heroicons-arrow-uturn-right"
        @click="send"
      />
    </UTextarea>
  </div>
</template>

<style lang="scss" scoped>
.input {
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
