<script setup lang="ts">
import { throttledWatch } from '@vueuse/core'
import type ChatInput from '~/components/chat-input.vue'
import type { ChatInputEvent, Thread } from '~/types'

const route = useRoute()
const prefs = usePrefs()
const threads = useThreads()
const scroller = ref<HTMLElement>()
const chatInput = ref<InstanceType<typeof ChatInput>>()
const id = fromArray(route.params.id, '')
const run = ref<RunWithOutput>()

const thread = await threads.find(id)
const initialMessage = ref(fromArray(route.query.msg, '') || '')

const previous = reactive((thread.history || []).filter((x) => x.role === 'user').map((x) => x.content))

throttledWatch(() => run.value?.output, () => {
  scroll()
}, { throttle: 500 })

const view = ref(route.query.view || 'chat')
const openFile = ref('')

watch(view, (neu) => {
  if (neu === 'chat') {
    navigateTo({ query: { view: undefined } })
  } else {
    navigateTo({ query: { view: neu } })
  }
})

const toolSrc = ref(thread?.tool || '')
const updating = ref(false)

async function updateTool() {
  updating.value = true
  try {
    const neu = await useSocket().emitWithAck('thread:updateTool', thread.id, toolSrc.value) as Thread

    threads.update(neu)
  } finally {
    setTimeout(() => {
      updating.value = false
    }, 1000)
  }
}

function closeFile() {
  view.value = 'chat'
  openFile.value = ''
}

onMounted(() => {
  scroll(false)

  if (initialMessage.value) {
    chatInput.value?.send()
    navigateTo({ query: { msg: undefined } })
  }
})

watch(thread, () => {
  scroll()
}, { deep: true })

function scroll(smooth = true) {
  const s = scroller.value

  if (!s) {
    return
  }

  nextTick(() => {
    s.scrollBy({ top: 100000, behavior: (smooth ? 'smooth' : 'instant') })
  })
}

async function send(e: ChatInputEvent) {
  try {
    previous.push(e.message)

    const res = await useRuns().chat(thread.id, e.message)

    run.value = res

    useSocket().once(`run:finished:${ res.id }`, () => {
      e.cb()
    })
  } catch (err) {
    e.cb()
  }
}
</script>

<template>
  <div class="wrapper">
    <nav class="threads bg-gray-200 dark:bg-gray-900">
      <div class="relative bg-emerald-500 text-emerald-50 text-sm font-bold py-1 px-2">
        Threads
        <UButton
          icon="i-heroicons-plus"
          variant="ghost"
          color="black"
          size="xs"
          class="absolute right-[0.125rem] top-0"
          @click.stop="navigateTo('/')"
        />
      </div>
      <ThreadLinks />
    </nav>
    <div class="switcher py-4 text-center border-x border-slate-300">
      <UButtonGroup size="sm" orientation="horizontal">
        <UButton
          icon="i-heroicons-wrench"
          label="Tool"
          :color="view === 'tool' ? 'emerald' : 'white'"
          @click="view = 'tool'"
        />
        <UButton
          icon="i-heroicons-chat-bubble-left"
          label="Chat"
          :color="view === 'chat' ? 'emerald' : 'white'"
          @click="view = 'chat'"
        />
        <UButton
          v-if="openFile"
          :key="openFile"
          icon="i-heroicons-document-text"
          :color="view === openFile ? 'emerald' : 'white'"
          :label="openFile"
          @click="view = openFile"
        >
          {{ openFile }}
          <UButton
            icon="i-heroicons-x-circle"
            size="xs"
            variant="subtle"
            @click.stop="closeFile()"
          />
        </UButton>
      </UButtonGroup>
    </div>
    <main ref="scroller" class="main border-x border-slate-300">
      <div v-if="view === 'chat'" class="max-w-[900px] m-auto p-2">
        <Messages
          :thread="thread"
          :run="run"
        />

        <details v-if="prefs.debug">
          <summary class="text-gray-500 cursor-pointer">
            Debug
          </summary>

          <details class="px-2">
            <summary class="text-gray-500 cursor-pointer">
              Thread
            </summary>
            <code class="block border bg-gray-200 border-gray-300 rounded p-2"><pre class="text-sm">{{ JSON.stringify(thread, null, 2) || 'None' }}</pre></code>
          </details>
          <details class="px-2">
            <summary class="text-gray-500 cursor-pointer">
              Run
            </summary>
            <code class="block border bg-gray-200 border-gray-300 rounded p-2"><pre class="text-sm">{{ JSON.stringify(run, null, 2) || 'None' }}</pre></code>
          </details>
        </details>
      </div>
      <div v-else-if="view === 'tool'" class="max-w-[900px] m-auto p-2">
        <UTextarea v-model="toolSrc" autocomplete="off" autocapitalize="off" autoresize />
        <UButton
          class="my-4"
          label="Save"
          :disabled="toolSrc.trim() === thread.tool.trim()"
          :loading="updating"
          @click="updateTool()"
        />
      </div>
      <div v-else>
        {{ view }}
      </div>
    </main>
    <nav class="files bg-gray-200 dark:bg-gray-900">
      <div class="relative bg-emerald-500 text-emerald-50 text-sm font-bold py-1 px-2">
        Files
      </div>

      <ThreadFiles
        :active-file="openFile"
        :thread="thread"
        class="mt-2"
        @open="(file) => { openFile = file; view = file }"
      />
    </nav>
    <div class="input border-x border-slate-300">
      <ChatInput
        v-if="view === 'chat'"
        ref="chatInput"
        :initial-message="initialMessage"
        :previous="previous"
        @message="send"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .wrapper {
    display: grid;
    height: 100vh;
    overflow: hidden;

    grid-template-areas: "threads switcher files"
                         "threads main files"
                         "threads input files";
    grid-template-columns: 200px 1fr 200px;
    grid-template-rows: min-content 1fr min-content;

    @media all and (max-width: 767px)  {
      grid-template-areas:  "threads switcher"
                            "threads main"
                            "files main"
                            "files input";
      grid-template-columns: 200px 1fr;
      grid-template-rows: min-content 1fr 1fr min-content;
    }
  }

  .switcher {
    grid-area: switcher;
  }

  .threads {
    grid-area: threads;
    overflow: hidden;
    overflow-y: auto;
  }

  .main {
    grid-area: main;
    overflow: hidden;
    overflow-y: auto;
  }

  .files {
    grid-area: files;
    overflow: hidden;
    overflow-y: auto;
  }

  .input {
    grid-area: input;
  }
</style>
