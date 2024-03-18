<script lang="ts" setup>
const files = useFiles()
const allFiles = await files.findAll()

const columns = [
  { key: 'filename', label: 'Name', sortable: true },
  { key: 'bytes', label: 'Size', sortable: true },
  // {key: 'status', label: 'Status', sortable: true},
  { key: 'actions' },
]

const suffixes = ['B', 'KB', 'MB', 'GB']
function formatBytes(n = 0) {
  let idx = 0
  while (n > 1000 && idx < suffixes.length) {
    idx++
    n /= 1000
  }

  return `${Math.ceil(n)} ${suffixes[idx]}`
}

async function remove(id: string) {
  await files.remove(id)
}

function upload(f: { name: string, value: string }) {
  return files.upload(f.name, f.value)
}
</script>

<template>
  <div class="p-5">
    <h1 class="text-2xl">
      Files

      <div class="float-right">
        <FileInput @file="upload" />
      </div>
    </h1>
    <UDivider class="my-2" />

    <UTable :rows="allFiles" :columns="columns">
      <template #actions-data="{ row }">
        <UButton icon="i-heroicons-trash" class="float-right" @click="remove(row.id)" />
      </template>

      <template #bytes-data="{ row }">
        {{ formatBytes(row.bytes) }}
      </template>

      <!-- <template #status-data="{ row }">
        <span style="text-transform: capitalize">{{row.status}}</span>
      </template> -->
    </UTable>
  </div>
</template>
