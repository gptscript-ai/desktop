<script lang="ts" setup>
import { type InferType, object, string } from 'yup'
import type { FormSubmitEvent } from '#ui/types'

const schema = object({
  name: string().required(),
  description: string().optional(),
  contents: string().optional(),
  subtool: string().optional(),
})

  type Schema = InferType<typeof schema>

const state = reactive({
  name: '',
  description: '',
  contents: '',
  subtool: '',
})

window.state = state

const toolOptions = ['code_interpreter', 'retrieval', 'internet_search', 'site_browsing']

async function go(e: FormSubmitEvent<Schema>) {

  // const res = await assistants.create(state)
  // navigateTo({name: 'a-assistant', params: { assistant: res.id }})
}
</script>

<template>
  <div class="p-5">
    <h1 class="text-2xl">
      Create Tool
    </h1>
    <UDivider class="my-2" />

    <UForm :schema="schema" :state="state" class="space-y-4" @submit="go">
      <UFormGroup label="Name">
        <UInput v-model="state.name" autofocus />
      </UFormGroup>

      <UFormGroup label="Description">
        <UTextarea v-model="state.description" autoresize />
      </UFormGroup>

      <UFormGroup label="Contents">
        <UTextarea v-model="state.contents" autoresize />
      </UFormGroup>

      <UButton type="submit" @click="go">
        Create
      </UButton>
    </UForm>
  </div>
</template>
