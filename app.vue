<script lang="ts" setup>
useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'format-detection', content: 'telephone=no' },
    { name: 'viewport', content: `width=device-width, height=device-height` },
  ],
})

const router = useRouter()
const root = ref<HTMLDivElement>()

watch(router.currentRoute, () => {
  root.value?.classList.remove('open')
})

function toggle() {
  root.value?.classList.toggle('open')
}
</script>

<template>
  <div ref="root" class="root bg-gray-50 dark:bg-gray-950">
    <header class="flex bg-purple-700 dark:bg-purple-950 text-white py-1 pl-4 pr-2.5">
      <div class="flex-initial">
        <nuxt-link :to="{ name: 'index' }">
          <img src="~/assets/logo.svg" class="h-10 my-1">
        </nuxt-link>
      </div>
      <div class="flex-initial">
        <nuxt-link :to="{ name: 'index' }">
          <img src="~/assets/logotype.svg" class="invert" style="height: 30px; margin: 12px 0 8px 5px;">
        </nuxt-link>
      </div>
      <div class="flex-grow" />
      <div class="flex-initial p-2">
        <ThemeToggle />
      </div>
      <div class="toggle flex-initial p-2">
        <UButton icon="i-heroicons-bars-3" @click="toggle" />
      </div>
    </header>
    <nav class="bg-purple-100 dark:bg-purple-900">
      <LeftNav />
    </nav>
    <main>
      <NuxtPage />
    </main>
    <UNotifications />
  </div>
</template>

<style lang="scss" scoped>
  .root {
    --nav-width: 270px;
    --header-height: 60px;

    display: grid;
    grid-template-areas: "header header"
                         "nav main";
    grid-template-columns: var(--nav-width) 1fr;
    grid-template-rows: var(--header-height) 1fr;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    HEADER {
      grid-area: header;
    }

    NAV {
      grid-area: nav;
      overflow: auto;
    }

    MAIN {
      grid-area: main;
      overflow: auto;
      position: relative;
    }
  }

  // Desktop
  @media all and (min-width: 768px)  {
    .root {
      .toggle {
        display: none;
      }
    }
  }

  // Mobile
  @media all and (max-width: 767px)  {
    .root {
      grid-template-columns: 0 100%;
      transition: grid-template-columns 250ms;

      .left-nav { opacity: 0; }
      MAIN { opacity: 1}
    }
    .root.open {
      grid-template-columns: 100% 0;

      .left-nav { opacity: 1; }
      MAIN { opacity: 0; }
    }
  }
</style>
