<script setup lang="ts">
import isEmpty from 'lodash-es/isEmpty.js'
import isArray from 'lodash-es/isArray.js'
import { splitLimit } from '@/utils/string'

interface Props {
  modelValue    : Record<string, string> | string[]
  keyLabel?     : string
  valueLabel?   : string
  addLabel?     : string
  addInitialRow?: boolean
  showSeparator?: boolean
  as?           : 'map' | 'array'
  separator?    : string
}

const {
  modelValue: initialValue,
  as = 'map',
  addInitialRow = false,
  showSeparator = true,
  keyLabel = 'Key',
  valueLabel = 'Value',
  addLabel = 'Add',
  separator = '=',
} = defineProps<Props>()

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, string> | string[]): void
}>()

interface Entry {
  key  : string
  value: string
}

const rows = reactive<Entry[]>([])

if (isArray(initialValue)) {
  for (const kv of initialValue || []) {
    const [key, value] = splitLimit(kv, separator, 2)

    rows.push({ key, value })
  }
} else {
  for (const k in initialValue || {}) {
    rows.push({ key: k, value: initialValue[k] })
  }
}

if (addInitialRow && !rows.length) {
  rows.push({ key: '', value: '' })
}

watchEffect(() => {
  if (as === 'map') {
    const out: Record<string, string> = {}

    for (const row of rows) {
      if (!isEmpty(row.key) && !isEmpty(row.value)) {
        out[row.key] = row.value
      }
    }

    emit('update:modelValue', out)
  } else {
    const out: string[] = []

    for (const row of rows) {
      if (!isEmpty(row.key) && !isEmpty(row.value)) {
        out.push(`${ row.key }${ separator }${ row.value }`)
      }
    }

    emit('update:modelValue', out)
  }
})

function add() {
  rows.push({ key: '', value: '' })
}

function remove(idx: number) {
  removeAt(rows, idx)
}

function onPaste(idx: number, e: ClipboardEvent) {
  const val = e.clipboardData?.getData('text') || ''

  if (!val.includes(separator)) {
    return
  }

  e.preventDefault()
  e.stopPropagation()

  const lines = val.split(/\r?\n/)

  remove(idx)

  for (const line of lines) {
    const [key, value] = splitLimit(line, separator, 2)

    rows.push({ key, value })
  }

  add()
}
</script>

<template>
  <div>
    <table class="w-full" cellspacing="5" cellpadding="5">
      <tr v-if="rows.length">
        <td width="40%">
          {{ keyLabel }}
        </td>
        <td v-if="showSeparator" width="30">
          &nbsp;
        </td><td>
          {{ valueLabel }}
        </td>
        <td width="50" align="right">
          &nbsp;
        </td>
      </tr>
      <tr v-for="(entry, idx) in rows" :key="idx" :gutter="10" class="mb-10px">
        <td class="key-col">
          <UInput v-model="entry.key" autofocus @paste="(e) => onPaste(idx, e)" />
        </td>
        <td v-if="showSeparator" class="separator-col">
          {{ separator }}
        </td>
        <td class="value-col">
          <UInput v-model="entry.value" />
        </td>
        <td class="remove-col">
          <UButton icon="i-heroicons-x-mark" @click="remove(idx)" />
        </td>
      </tr>
      <tr>
        <td colspan="3">
          <UButton icon="i-heroicons-plus" @click="add">
            {{ addLabel }}
          </UButton>
        </td>
      </tr>
    </table>
  </div>
</template>

<style scoped lang="scss">
  .key-col {
    flex: 1 1 auto;
    max-width: initial;
  }

  .value-col {
    flex: 4 4 auto;
    max-width: initial;
  }

  .remove-col, .separator-col {
    flex: 0 0 min-content;
    max-width: initial;
  }

  .remove-col {
    text-align: right;
  }
  .separator-col {
    text-align: center;
  }
</style>
