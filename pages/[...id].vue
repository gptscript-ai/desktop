<script setup lang="ts">
const route = useRoute();
const threads = useThreads()

const id = fromArray(route.params.id,'')

await threads.load()
</script>

<template>
  <div class="wrapper">
    <nav class="threads">
      Threads
      <ul>
        <li><nuxt-link to="/">Home</nuxt-link></li>
        <li v-for="t in threads.list" :key="t.id">
          <nuxt-link :to="{name: 'id', params: {id: t.id}}">{{t.id}}</nuxt-link>
        </li>
      </ul>
    </nav>
    <main class="main">
      Main -- {{id}}
    </main>
    <nav class="files">
      Files
    </nav>
  </div>
</template>

<style lang="scss" scoped>
  .wrapper {
    display: grid;
    grid-template-areas: "threads main files";
    grid-template-columns: 200px 1fr 200px;
  }

  .threads {
    grid-area: threads;
    background-color: rgba(255,255,255,0.1)
  }

  .main {
    grid-area: main;
  }

  .files {
    grid-area: files;
    background-color: rgba(255,255,255,0.1)
  }
</style>
