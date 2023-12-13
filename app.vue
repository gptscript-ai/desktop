<template>
  <div class="root bg-rubra-100 dark:bg-rubra-950">
    <nav class="bg-rubra-200 dark:bg-rubra-900">
      <LeftNav />
    </nav>
    <aside class="bg-rubra-200 dark:bg-rubra-900">
      <ThemeToggle />
    </aside>
    <main>
      <NuxtPage />
    </main>
  </div>
</template>

<style lang="scss" scoped>
  .root {
    --nav-width: 300px;
    --aside-height: 50px;

    display: grid;
    grid-template-areas: "nav main"
                         "aside main";
    grid-template-columns: var(--nav-width) 1fr;
    grid-template-rows: 1fr var(--aside-height);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    NAV {
      grid-area: nav;
      overflow: auto;
    }

    ASIDE {
      grid-area: aside;
      line-height: var(--aside-height);
    }

    MAIN {
      grid-area: main;
      overflow: auto;
      position: relative;
    }
  }
</style>
