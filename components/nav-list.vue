<script lang="ts" setup>
  const router = useRouter()

  interface Props {
    links: NavOption[]
    actions?: NavAction[]
  }

  const { links, actions } = defineProps<Props>()

  const hasIcons = computed(() => {
    return !!links.find(x => !!x.icon)
  })

  function actionOptionsFor(idx: number) {
    return computed(() => {
      return (actions || []).map( y => y.map((x: NavAction) => {
        return {
          ...x,
          click: function(e: Event) {
            e.stopPropagation()
            e.preventDefault()
            x.click(e, links[idx], idx)
            open[idx] = false
          }
        }
      }))
    })
  }

  const actionOptions = computed(() => {
    const out = []

    for ( let i = 0 ; i < links.length ; i++ ) {
      out[i] = actionOptionsFor(i)
    }

    return out
  })

  const open = reactive<boolean[]>([])

  function clicked(e: MouseEvent, item: NavItem, _idx: number) {
    const isActions = !!(e.target as HTMLElement)?.closest('.actions')

    if ( isActions ) {
      e.preventDefault()
      e.stopPropagation()
      return
    }

    navigateTo(item.to)
  }

  function isActive(item: NavItem) {
    const active = router.resolve(router.currentRoute)

    if ( active.href === '/' ) {
      return false
    }

    const cur = router.resolve(item.to)

    return cur.href.startsWith(active.href)
  }
</script>

<template>
  <nav>
    <ul class="mx-1" :class="[hasIcons && 'with-icons', actions?.length && 'with-actions']">
      <li
        v-for="(item, idx) in links"
        :key="idx"
        class="nav-row relative grid items-center w-full focus:outline-none focus-visible:outline-none dark:focus-visible:outline-none focus-visible:before:ring-inset focus-visible:before:ring-1 focus-visible:before:ring-primary-500 dark:focus-visible:before:ring-primary-400 before:inset-px before:rounded-md disabled:cursor-not-allowed disabled:opacity-75 focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400 rounded-md font-medium text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 before:bg-gray-100 dark:before:bg-gray-800 dark:hover:text-white dark:hover:bg-gray-800/50 data-[active=true]:text-gray-900 data-[active=true]:dark:text-white data-[active=true]:bg-gray-100 data-[active=true]:dark:bg-gray-800"
        :class="[open[idx] && 'open']"
        :data-active="isActive(item)"
        @click.prevent="e => clicked(e, item, idx)"
      >
        <div class="icon text-center" v-if="hasIcons">
          <UIcon v-if="item.icon" :name="item.icon" size="lg" />
        </div>
        <div class="label relative">
          <nuxt-link :to="item.to" class="py-1.5 block">
            {{item.label}}
          </nuxt-link>
        </div>
        <div v-if="actionOptions[idx].length" class="actions">
          <UDropdown
            :items="actionOptions[idx]"
            v-model:open="open[idx]"
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
