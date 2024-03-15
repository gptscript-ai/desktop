<script lang="ts" setup>
  import { object, string, type InferType, array } from 'yup'
  import type { FormSubmitEvent } from '#ui/types'
  import type ToolObject from '@/config/types'

  const tools = useTools()

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
    subtool: ''
  })

  window.state = state

  const toolOptions = ['code_interpreter','retrieval','internet_search', 'site_browsing']

async function go(e: FormSubmitEvent<Schema>) {
  const res = await tools.create(state as ToolObject)
  navigateTo({name: 'tools'})
}
</script>

<template>
  <div class="p-5">
    <h1 class="text-2xl">Create Tool</h1>
    <UDivider class="my-2"/>

    <UForm :schema="schema" :state="state" class="space-y-4" @submit="go">
      <UFormGroup label="Name" required>
        <UInput v-model="state.name" autofocus required />
      </UFormGroup>

      <UFormGroup label="Description">
        <UTextarea v-model="state.description" autoresize />
      </UFormGroup>

      <UFormGroup label="Source Code URL" required>
        <UInput v-model="state.url"/>
      </UFormGroup>

      <UFormGroup label="Subtool">
        <UInput v-model="state.subtool"/>
      </UFormGroup>

      <UButton type="submit" @click.prevent="go">Create</UButton>
    </UForm>
  </div>
</template>
