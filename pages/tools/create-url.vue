<script lang="ts" setup>
import { type InferType, object, string } from 'yup'
import type { FormSubmitEvent } from '#ui/types'
import type ToolObject from '@/config/types'

const tools = useTools()
const saving = ref(false)

const schema = object({
  name: string().required(),
  description: string().optional(),
  url: string().required(),
  subtool: string().optional(),
})

  type Schema = InferType<typeof schema>

const state = reactive<ToolObject>({
  name: '',
  description: '',
  url: '',
  subtool: '',
})

window.state = state

async function go(e: FormSubmitEvent<Schema>) {
  saving.value = true

  try {
    await tools.create(state as ToolObject)
    navigateTo({ name: 'tools' })
  }
  catch (e) {
    useToast().add({
      timeout: 0,
      title: 'Error Saving Tool',
      description: `${e}`,
    })
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="p-5">
    <h1 class="text-2xl">
      Create Tool
    </h1>
    <UDivider class="my-2" />

    <UForm :schema="schema" :state="state" class="space-y-4" @submit="go">
      <UFormGroup label="Name" required>
        <UInput v-model="state.name" autofocus required />
      </UFormGroup>

      <UFormGroup label="Description">
        <UTextarea v-model="state.description" autoresize />
      </UFormGroup>

      <UFormGroup label="Source Code URL" required>
        <UInput v-model="state.url" />
      </UFormGroup>

      <UFormGroup label="Subtool">
        <UInput v-model="state.subtool" />
      </UFormGroup>

      <UButton :loading="saving" type="submit">
        <template v-if="saving">
          Creating…
        </template>
        <template v-else>
          Create
        </template>
      </UButton>
    </UForm>
  </div>
</template>
