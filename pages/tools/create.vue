<script lang="ts" setup>
  import { object, string, type InferType, array } from 'yup'
  import type { FormSubmitEvent } from '#ui/types'

  const schema = object({
    name: string().required(),
    description: string().optional(),
    url: string().optional(),
    contents: string().optional(),
    subtool: string().optional(),
  })

  type Schema = InferType<typeof schema>

  const state = reactive({
    name: '',
    description: '',
    url: '',
    contents: '',
    subtool: ''
  })

  window.state = state

  const toolOptions = ['code_interpreter','retrieval','function']

  async function go(e: FormSubmitEvent<Schema>) {
    // const res = await assistants.create(state)
    // navigateTo({name: 'a-assistant', params: { assistant: res.id }})
  }
</script>

<template>
  <div class="p-5">
    <h1 class="text-2xl">Create Tool</h1>
    <UDivider class="my-2"/>

    <UForm :schema="schema" :state="state" class="space-y-4" @submit="go">
      <UFormGroup label="Name">
        <UInput v-model="state.name" autofocus />
      </UFormGroup>

      <UFormGroup label="Description">
        <UTextarea v-model="state.description" autoresize />
      </UFormGroup>

      <UFormGroup label="Instructions">
        <UTextarea v-model="state.url" autoresize />
      </UFormGroup>

      <UButton type="submit">Create</UButton>
    </UForm>
  </div>
</template>
