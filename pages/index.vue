<script setup lang="ts">
import type { SelectOption, ChatInputEvent } from '@/types';

const threads = useThreads()
const sock = useSocket()
const prefs = usePrefs()

const tools = await sock.emitWithAck('tool:list')
const tool = ref(prefs.defaultTool || '')

if ( !tools.includes(tool.value) ) {
  tool.value = ''
}

const toolOptions = computed((): SelectOption => {
  return [
    {label: 'Default', value: ''},
    ...tools.map(x => {
      return {
        label: titleCase(x.replace(/\.gpt$/,'')),
        value: x
      }
    })
  ]
})

async function send(e: ChatInputEvent) {
  prefs.defaultTool = tool.value

  const thread = await threads.create(tool.value) as Thread

  navigateTo({name: 'id', params: {id: thread.id}})

  await threads.chat(thread, e.message)

  e.cb()
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
    <main class="main border-x border-slate-300">
      <div class="relative max-w-[900px] m-auto min-h-[100%] p-2">
        <div class="text-center">
          <h1 class="text-4xl my-5">Welcome to GPTStudio!</h1>
          <img src="/img/clicky.svg" class="w-[50%] mx-auto"/>
          <h1 class="text-xl my-5">Say something below to get started.</h1>
          <div class="w-[50%] mx-auto">
            <UFormGroup label="Tool">
              <USelect v-model="tool" :options="toolOptions"/>
            </UFormGroup>
          </div>
        </div>

        <div class="absolute bottom-0 left-0 right-0">
          <ChatInput
            @message="send"
          />
        </div>
      </div>
    </main>

    <nav class="files bg-gray-200 dark:bg-gray-900">
      <div class="relative bg-blue-400 text-blue-50 text-sm font-bold py-1 px-2">
        Files
      </div>
      <ThreadFiles class="mt-2 px-2"/>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
  .wrapper {
    display: grid;

    grid-template-areas: "threads main files";
    grid-template-columns: 200px 1fr 200px;

    @media all and (max-width: 767px)  {
      grid-template-areas: "threads main" "files main";
      grid-template-columns: 200px 1fr;
      grid-template-rows: 1fr 1fr;
    }

    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden
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
</style>
