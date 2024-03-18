<script lang="ts" setup>
const tools = useTools()
const allTools = await tools.findAll()

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'description', label: 'Description', sortable: true },
  { key: 'location', label: 'Location', sortable: true },
  { key: 'actions' },
]

const addOptions = [[
  {
    label: 'From a URL',
    click: () => {
      navigateTo({ name: 'tools-create-url' })
    },
  },
  {
    label: 'Custom',
    disabled: true,
    click: () => {
      navigateTo({ name: 'tools-create-custom' })
    },
  },
]]

async function remove(id: string) {
  await tools.remove(id)
}
</script>

<template>
  <div class="p-5">
    <h1 class="text-2xl">
      Tools

      <div class="float-right">
        <UButton variant="link" to="https://tools.gptscript.ai/" target="_blank" rel="noopener nofollow noreferrer" class="relative bottom-1">
          Find more tools
        </UButton>
        <UDropdown :items="addOptions" :popper="{ placement: 'bottom-start' }">
          <UButton
            icon="i-heroicons-plus"
            aria-label="Add"
            size="sm"
            class="mr-4"
          >
            Add
          </UButton>
        </UDropdown>
      </div>
    </h1>
    <UDivider class="my-2" />

    <UTable :rows="allTools" :columns="columns">
      <template #actions-data="{ row }">
        <UButton icon="i-heroicons-trash" class="float-right" @click="remove(row.id)" />
      </template>
    </UTable>
  </div>
</template>
