<script lang="ts" setup>
import { useAssistants } from '@/stores/assistants';
import { useThreads } from '@/stores/threads';
import dayjs from 'dayjs';

const router = useRouter();
const assistants = useAssistants()
const threads = useThreads()
const allAssistants = await assistants.findAll()
const allThreads = await threads.findAll()

const assistantLinks = computed(() => {
  return allAssistants.sort((a, b) => {
    let aa = a.name?.toLocaleLowerCase() || ''
    let bb = b.name?.toLocaleLowerCase() || ''

    return aa.localeCompare(bb)
  }).map(x => { return {
    label: x.name,
    icon: 'i-heroicons-academic-cap',
    to: `/a/${x.id}`,
    id: x.id
  }})
})

const moreLinks = computed(() => {
  return [
    {
      label: 'Files',
      icon: 'i-heroicons-document-text',
      to: '/files',
    },
    // {
    //   label: 'Tools',
    //   icon: 'i-heroicons-wrench',
    //   to: '/tools',
    // },
  ]
})

function groupFor(ts: number) {
  const t = dayjs(ts*1000)
  const now = dayjs().local()
  const midnight = now.hour(0).minute(0).second(0)
  const yesterday = midnight.subtract(1, 'day')
  const last7 = midnight.subtract(7, 'day')

  if ( t.isAfter(midnight) ) {
    return 'Today'
  }

  if ( t.isAfter(yesterday) ) {
    return 'Yesterday'
  }

  if ( t.isAfter(last7) ) {
    return 'Last 7 Days'
  }

  return 'Older'
}

interface ThreadLink {
  id: string
  group: string
  label: string
  icon: string
  to: string
}

const threadLinks = computed(() => {
 const sorted = (allThreads || []).sort((a, b) => b.created_at - a.created_at)

 const out: Record<string,ThreadLink[]> = {}

 for ( const x of sorted ) {
  const group = groupFor(x.created_at)
  if (  !out[group] ) {
    out[group] = []
  }

  out[group].push({
    id: x.id,
    group,
    label: x.id.split('_')[1].substring(0,8),
    icon: 'i-heroicons-chat-bubble-left',
    to: `/t/${x.id}`,
  })
 }

 return out
})

async function removeThread(e: MouseEvent, id: any) {
  e.stopPropagation();
  e.preventDefault();

  await threads.remove(id);

  if ( router.currentRoute.value.name === 't-thread' && router.currentRoute.value.params.thread === id ) {
    navigateTo('/')
  }
}
</script>

<template>
  <div class="mt-2">
    <h4 class="h-8 leading-8">Assistants <UButton size="xs" class="float-right mr-2 align-middle" :to="{name: 'a-create'}" icon="i-heroicons-plus"/></h4>
    <UVerticalNavigation :links="assistantLinks"/>

    <UDivider class="my-5" />

    <UVerticalNavigation :links="moreLinks"/>

    <UDivider class="my-5" />

    <div v-for="(group, k) in threadLinks" :key="k" class="mb-5">
      <h5>{{k}}</h5>
      <UVerticalNavigation :links="group">
        <template #badge="{ link }">
          <UButton
            class="absolute right-2 delete-btn"
            icon="i-heroicons-trash"
            aria-label="Delete"
            @click="e => removeThread(e, link.id)"
            size="xs"
          />
        </template>
      </UVerticalNavigation>
    </div>
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
.delete-btn {
  display: none;
}

:deep(A:hover .delete-btn) {
  display: initial;
}
</style>
