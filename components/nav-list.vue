<script lang="ts" setup>
import type { NavAction, NavItem, NavOption } from '@/config/types'

const { links, actions } = defineProps<Props>()

const router = useRouter()
const open = reactive<boolean[]>([])

interface Props {
  links: NavOption[]
  actions?: NavAction[]
}

const hasIcons = computed(() => {
  return !!links.find(x => !!x.icon)
})

function actionOptionsFor(link: NavOption) {
  return (actions || []).map(y => y.map((x: NavAction) => {
    const idx = links.findIndex(x => x === link)

    return {
      ...x,
      click(e: Event) {
        e.stopPropagation()
        e.preventDefault()
        x.click(e, link, idx)
        open[idx] = false
      },
    }
  }))
}

const actionOptions = computed(() => {
  const out = []

  for (let i = 0; i < links.length; i++)
    out[i] = actionOptionsFor(i)

  return out
})

function clicked(e: MouseEvent, item: NavItem, _idx: number) {
  const isActions = !!(e.target as HTMLElement)?.closest('.actions')

  if (isActions) {
    e.preventDefault()
    e.stopPropagation()
    return
  }

  navigateTo(item.to)
}

function isActive(item: NavItem) {
  const active = router.resolve(router.currentRoute)

  if (active.href === '/')
    return false

  const cur = router.resolve(item.to)

  return cur.href.startsWith(active.href)
}
</script>

<template>
  <nav>
    <ul class="mx-1" :class="[hasIcons && 'with-icons', actions?.length && 'with-actions']">
      <li
        v-for="(link, idx) in links"
        :key="idx"
        class="nav-row relative grid items-center w-full focus:outline-none focus-visible:outline-none dark:focus-visible:outline-none focus-visible:before:ring-inset focus-visible:before:ring-1 focus-visible:before:ring-primary-500 dark:focus-visible:before:ring-primary-400 before:inset-px before:rounded-md disabled:cursor-not-allowed disabled:opacity-75 focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400 rounded-md font-medium text-sm text-gray-500 dark:text-gray-300 hover:text-gray-900 before:bg-gray-100 dark:before:bg-gray-800 dark:hover:text-white dark:hover:bg-gray-800/50 data-[active=true]:text-gray-900 data-[active=true]:dark:text-white data-[active=true]:bg-gray-200 data-[active=true]:dark:bg-gray-800 data-[active=true]:font-bold"
        :class="[open[idx] && 'open']"
        :data-active="isActive(link)"
        @click.prevent="e => clicked(e, link, idx)"
      >
        <div v-if="hasIcons" class="icon text-center">
          <UIcon v-if="link.icon" :name="link.icon" size="lg" />
        </div>
        <div class="label relative">
          <nuxt-link :to="link.to" class="py-1.5 block">
            {{ link.label }}
          </nuxt-link>
        </div>
        <div v-if="actions?.length" class="actions">
          <UDropdown
            v-model:open="open[idx]"
            :items="actionOptionsFor(link)"
            :popper="{ offsetDistance: 0, placement: 'bottom-end' }"
          >
            <UButton
              icon="i-heroicons-ellipsis-vertical"
              aria-label="Menu"
              size="xs"
            />

            <template #item="{ item }">
              <span class="truncate">{{ item.label }}</span>

              <UIcon :name="item.icon" class="flex-shrink-0 h-4 w-4 text-gray-400 dark:text-gray-500 ms-auto" />
            </template>
          </UDropdown>
        </div>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
  UL {
    width: 100%;

    &.with-icons .nav-row {
      grid-template-columns: 0px 30px 1fr;
    }

    &.with-actions .nav-row {
      grid-template-columns: 0px 1fr 30px;
    }

    &.with-icons.with-actions .nav-row {
      grid-template-columns: 0px 30px 1fr 30px;
    }
  }

  .actions {
    display: none;
  }

  LI:hover .actions, LI.open .actions {
    display: initial;
  }
</style>
