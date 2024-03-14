<script lang="ts" setup>
  const tools = useTools()
  const allTools = await tools.findAll()

  const columns = [
    {key: 'name', label: 'Name', sortable: true},
    {key: 'description', label: 'Description', sortable: true},
    {key: 'location', label: 'Location', sortable: true},
    {key: 'actions'}
  ]

  async function remove(id: string) {
    await tools.remove(id)
  }
</script>

<template>
  <div class="p-5">
    <h1 class="text-2xl">
      Tools

      <div class="float-right">
        <UButton
          icon="i-heroicons-plus"
          aria-label="Add"
          to="/tools/create"
          size="sm"
          class="mr-4"
        >Add</UButton>
      </div>
    </h1>
    <UDivider class="my-2"/>

    <UTable :rows="allTools" :columns="columns">
      <template #actions-data="{ row }">
        <UButton icon="i-heroicons-trash" @click="remove(row.id)" class="float-right"/>
      </template>
    </UTable>
  </div>
</template>
