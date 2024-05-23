<script lang="ts" setup>
import dayjs from 'dayjs'
import type { RouteLocationRaw } from 'vue-router'
import { useThreads } from '@/stores/threads'

const threads = useThreads()
const allThreads = await threads.findAll()

function remove(id: string) {
  threads.remove(id)
}

async function removeAll() {
  const promises = threads.list.map(x => threads.remove(x.id))

  await Promise.all(promises)
}

interface ThreadLink {
  id   : string
  group: string
  label: string
  icon : string
  to   : RouteLocationRaw
}

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

const threadLinks = computed(() => {
  const sorted = (allThreads || []).slice().sort((a, b) => b.createdAt - a.createdAt)

  const out: Record<string, ThreadLink[]> = {}

  for (const x of sorted) {
    const group = groupFor(x.createdAt)

    if (!out[group]) {
      out[group] = []
    }

    out[group].push({
      id:   x.id,
      group,
      label: x.name || '',
      icon: 'i-heroicons-chat-bubble-left',
      to:   { name: 'id', params: { id: x.id } },
    })
  }

  return out
})

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

  removeAll()
  navigateTo('/')
}

</script>

<template>
  <div class="mt-2">
    <div v-for="(group, k) in threadLinks" :key="k" class="mb-5">
      <h5 class="relative text-xs text-gray-700 dark:text-gray-400 px-2">
        {{ k }}
      </h5>

      <ul class="relative">
        <li
          v-for="(obj, idx) in group" :key="idx"
          class="group hover:bg-blue-300 relative cursor-pointer px-2 py-1"
          @click="navigateTo({ name: 'id', params: { id: obj.id } })"
        >
          <div class="overflow-hidden overflow-ellipsis mr-3" v-if="obj.label">
            <UIcon class="text-slate-500" name="i-heroicons-chat-bubble-left" />
            {{obj.label}}
          </div>
          <Waiting v-else/>
          <UButton
            icon="i-heroicons-trash"
            variant="ghost"
            size="xs"
            class="absolute right-[0.125rem] top-[0.125rem] invisible group-hover:visible"
            @click.stop="remove(obj.id)"
          />
        </li>
      </ul>
    </div>

    <div class="px-4 absolute bottom-2">
      <UButton v-if="allThreads.length && !showConfirm" variant="ghost" color="red" icon="i-heroicons-fire" @click="confirmHistory">
        Clear all threads
      </UButton>
      <UButton v-else-if="showConfirm" variant="link" color="red" icon="i-heroicons-fire" @click="clearHistory">
        Are you sure?
      </UButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
LI {
  display: block;
}

.active {
  background-color: red;
}
</style>
