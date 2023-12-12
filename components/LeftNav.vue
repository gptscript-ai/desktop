<script lang="ts" setup>
const {data: threads, refresh: refreshThreads} = await useFetch('/v1/threads')
const {data: assistants, refresh: refreshAssistants} = await useFetch('/v1/assistants')

async function addThread() {
  const thread = await $fetch('/v1/threads', {method: 'post'})
  refreshThreads()
}
</script>

<template>
  <div>
    <ul>
      <li><nuxt-link :to="{name: 'index'}">Home</nuxt-link></li>
      <li>
        <div>
          Threads
          <UButton icon="i-heroicons-plus" @click="addThread"/>
        </div>
        <ul>
          <li v-for="(a, idx) in threads" :key="idx">
            <nuxt-link :to="{name: 'thread-id', params: {id: a.id}}">{{a.id}}</nuxt-link>
          </li>
        </ul>
      </li>
      <li>
        Assistants
        <ul>
          <li v-for="(a, idx) in assistants" :key="idx">
            {{a}}
          </li>
        </ul>
      </li>

    </ul>
  </div>
</template>


<style lang="scss" scoped>

</style>
