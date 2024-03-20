<script lang="ts" setup>
import dayjs from 'dayjs'
import type { RouteLocationRaw } from 'vue-router'
import { useAssistants } from '@/stores/assistants'
import { useThreads } from '@/stores/threads'

const router = useRouter()
const assistants = useAssistants()
const threads = useThreads()
const allAssistants = await assistants.findAll()
const allThreads = await threads.findAll()

const assistantLinks = computed(() => {
  return allAssistants.slice().sort((a, b) => {
    const aa = a.name?.toLocaleLowerCase() || ''
    const bb = b.name?.toLocaleLowerCase() || ''

    return aa.localeCompare(bb)
  }).map((x) => {
    return {
      label: x.name,
      icon:  'i-heroicons-sparkles',
      to:    { name: 'a-assistant', params: { assistant: x.id } },
      id:    x.id,
    }
  })
})

const assistantActions = [[
  {
    label: 'Edit',
    icon:  'i-heroicons-pencil',
    click: (_, link: object) => {
      navigateTo({ name: 'a-assistant-edit', params: { assistant: link.id } })
    },
  },
  {
    label: 'Remove',
    icon:  'i-heroicons-trash',
    click: async (_: Event, link: object) => {
      await assistants.remove(link.id)

      if (router.currentRoute.value.name === 'a-assistant' || router.currentRoute.value.name.startsWith('a-assistant-')) {
        navigateTo('/')
      }
    },
  },
]]

const moreLinks = computed(() => {
  return [
    {
      label: 'Files',
      icon:  'i-heroicons-document-text',
      to:    { name: 'files' },
    },
    {
      label: 'Tools',
      icon:  'i-heroicons-wrench',
      to:    { name: 'tools' },
    },
  ]
})

function groupFor(ts: number) {
  const t = dayjs(ts * 1000)
  const now = dayjs().local()
  const midnight = now.hour(0).minute(0).second(0)
  const yesterday = midnight.subtract(1, 'day')
  const last7 = midnight.subtract(7, 'day')

  if (t.isAfter(midnight)) {
    return 'Today'
  }

  if (t.isAfter(yesterday)) {
    return 'Yesterday'
  }

  if (t.isAfter(last7)) {
    return 'Last 7 Days'
  }

  return 'Older'
}

interface ThreadLink {
  id   : string
  group: string
  label: string
  icon : string
  to   : RouteLocationRaw
}

const threadLinks = computed(() => {
  const sorted = (allThreads || []).slice().sort((a, b) => b.created_at - a.created_at)

  const out: Record<string, ThreadLink[]> = {}

  for (const x of sorted) {
    const group = groupFor(x.created_at)
    const assistantId = (x.metadata as any || {}).assistantId || ''
    const assistant = assistants.byId(assistantId)
    const label = threadName(x, assistant)

    if (!out[group]) {
      out[group] = []
    }

    out[group].push({
      id:   x.id,
      group,
      label,
      icon: 'i-heroicons-chat-bubble-left',
      to:   { name: 't-thread', params: { thread: x.id } },
    })
  }

  return out
})

const threadActions = [[
  {
    label: 'Remove',
    icon:  'i-heroicons-trash',
    click: async (_: Event, link: object) => {
      await threads.remove(link.id)

      if (router.currentRoute.value.name === 't-thread' && router.currentRoute.value.params.thread === link.id) {
        navigateTo('/')
      }
    },
  },
]]

const showConfirm = ref(false)
let confirmTimer: NodeJS.Timeout

function confirmHistory() {
  showConfirm.value = true
  confirmTimer = setTimeout(() => {
    showConfirm.value = false
  }, 5000)
}

function clearHistory() {
  clearTimeout(confirmTimer)
  showConfirm.value = false

  eachLimit(allThreads, 4, async (t) => {
    await threads.remove(t.id)
  })

  if (useRoute().name.startsWith('t-')) {
    navigateTo('/')
  }
}
</script>

<template>
  <div class="mt-2">
    <h4 class="h-8 leading-8">
      Assistants
      <UButton
        size="xs"
        class="float-right mr-2 align-middle"
        :to="{ name: 'a-create' }"
        icon="i-heroicons-plus"
      />
    </h4>
    <NavList :links="assistantLinks" :actions="assistantActions" class="mr-2.5" />

    <UDivider class="my-2" />

    <NavList :links="moreLinks" class="mr-2.5" />

    <UDivider class="my-2" />

    <div v-for="(group, k) in threadLinks" :key="k" class="mb-5">
      <h5>{{ k }}</h5>
      <NavList :links="group" :actions="threadActions" class="mr-2.5" />
    </div>

    <UButton v-if="allThreads.length && !showConfirm" variant="link" color="red" icon="i-heroicons-fire" @click="confirmHistory">
      Clear chat history
    </UButton>
    <UButton v-else-if="showConfirm" variant="link" color="red" icon="i-heroicons-fire" @click="clearHistory">
      Are you sure?
    </UButton>
  </div>
</template>

<style lang="scss" scoped>
H4 {
  padding-left: 1rem;
}

H5 {
  padding-left: 1rem;
  font-size: 75%;
}

LI {
  display: block;
}

.active {
  background-color: red;
}
</style>
