<script setup lang="ts">
import type { ChatInputEvent } from '~/types';

const route = useRoute();
const threads = useThreads()
const scroller = ref<HTMLElement>()
const id = fromArray(route.params.id,'')
const run = ref<RunWithOutput>()

const thread = await threads.find(id)
const previous = computed(() => {
  return (thread.history || []).filter(x => x.role === 'user').map(x => x.content)
})

onMounted(() => {
  scroll()
})

watch(thread, () => {
  scroll()

}, {deep: true})

function scroll() {
  const s = scroller.value
  if ( !s ) {
    return
  }

  nextTick(() => {
    s.scrollBy({top: 100000, behavior: 'smooth'})
  })
}

async function send(e: ChatInputEvent) {
  try {
    const res = await threads.chat(thread, e.message)
    run.value = res

    useSocket().once(`run:finished:${res.id}`, () => {
      e.cb();
    })
  } catch (err) {
    e.cb();
  }
}

</script>

<template>
  <div class="wrapper">
    <nav class="threads bg-gray-200 dark:bg-gray-900">
      <div class="relative bg-blue-400 text-blue-50 text-sm font-bold py-1 px-2">
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
      <ThreadLinks/>
    </nav>
    <main class="main border-x border-slate-300" ref="scroller">
      <div class="max-w-[900px] m-auto p-2">
        <Messages
          :thread="thread"
          :run="run"
        />

        <details>
          <summary class="text-gray-500 cursor-pointer">Debug</summary>

          <details class="px-2">
            <summary class="text-gray-500 cursor-pointer">Thread</summary>
            <code class="block border bg-gray-200 border-gray-300 rounded p-2"><pre class="text-sm">{{JSON.stringify(thread, null, 2) || 'None'}}</pre></code>
          </details>
          <details class="px-2">
            <summary class="text-gray-500 cursor-pointer">Run</summary>
            <code class="block border bg-gray-200 border-gray-300 rounded p-2"><pre class="text-sm">{{JSON.stringify(run, null, 2) || 'None'}}</pre></code>
          </details>
        </details>
      </div>
    </main>
    <nav class="files bg-gray-200 dark:bg-gray-900">
      <div class="relative bg-blue-400 text-blue-50 text-sm font-bold py-1 px-2">
        Files
      </div>
      <ThreadFiles :thread="thread" class="mt-2 px-2"/>
    </nav>
    <div class="input border-x border-slate-300">
      <ChatInput
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

    grid-template-areas: "threads main files" "threads input files";
    grid-template-columns: 200px 1fr 200px;
    grid-template-rows: 1fr min-content;

    @media all and (max-width: 767px)  {
      grid-template-areas: "threads main" "files main" "files input";
      grid-template-columns: 200px 1fr;
      grid-template-rows: 1fr 1fr min-content;
    }
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
