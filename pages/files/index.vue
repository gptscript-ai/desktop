<script lang="ts" setup>
  const files = useFiles()
  const allFiles = await files.findAll()

  const columns = [
    {key: 'filename', label: 'Name', sortable: true},
    {key: 'bytes', label: 'Size', sortable: true},
    {key: 'status', label: 'Status', sortable: true},
    {key: 'actions'}
  ]

  const suffixes = ['B','KB','MB','GB']
  function formatBytes(n=0) {
    let idx = 0
    while ( n > 1000 && idx < suffixes.length ) {
      idx++
      n /= 1000
    }

    return Math.ceil(n) + ' ' + suffixes[idx]
  }

  async function remove(id: string) {
    await files.remove(id)
  }

  function upload(files: object[]) {
    // @TODO reading whole files into JS, then send as JSON and parsing and all that is bad, mmkay
    for ( const f of files ) {
      $fetch('/v1/files', {
        method: 'POST',
        body: f
      })
    }
  }
</script>

<template>
  <div class="p-5">
    <h1 class="text-2xl">
      Files

      <div class="float-right">
        <FileInput @files="upload" />
      </div>
    </h1>
    <UDivider class="my-2"/>

    <UTable :rows="allFiles" :columns="columns">
      <template #actions-data="{ row }">
        <UButton icon="i-heroicons-trash" @click="remove(row.id)" class="float-right"/>
      </template>

      <template #bytes-data="{ row }">
        {{formatBytes(row.bytes) }}
      </template>

      <template #status-data="{ row }">
        <span style="text-transform: capitalize">{{row.status}}</span>
      </template>
    </UTable>
  </div>
</template>
