<script lang="ts" setup>
  import { object, string, type InferType, array } from 'yup'
  import type { FormSubmitEvent } from '#ui/types'

  const schema = object({
    name: string().required(),
    model: string().required(),
    description: string().optional(),
    instructions: string().optional(),
    tools: array(string()).optional(),
    file_ids: array(string()).optional(),
    metadata: object(),
  })

  type Schema = InferType<typeof schema>

  const state = reactive({
    name: undefined,
    model: undefined,
    description: undefined,
    instructions: undefined,
    tools: [],
    file_ids: [],
    metadata: {},
  })

  window.state = state

  const toolOptions = ['code_interpreter','retrieval','function']
  const assistants = useAssistants()
  const allFiles = await useFiles().findAll()
  const allModels = await useModels().findAll()

  async function go(e: FormSubmitEvent<Schema>) {
    const res = await assistants.create(state)
    navigateTo({name: 'a-assistant', params: { assistant: res.id }})
  }
</script>

<template>
  <div class="p-5">
    <h1 class="text-2xl">Create Assistant</h1>
    <UDivider class="my-2"/>

    <UForm :schema="schema" :state="state" class="space-y-4" @submit="go">
      <UFormGroup label="Name">
        <UInput v-model="state.name" autofocus />
      </UFormGroup>

      <UFormGroup label="Description">
        <UTextarea v-model="state.description" autoresize />
      </UFormGroup>

      <UFormGroup label="Instructions">
        <UTextarea v-model="state.instructions" autoresize />
      </UFormGroup>

      <UFormGroup label="Tools">
        <USelectMenu v-model="state.tools" :options="toolOptions" multiple placeholder="Select Tools">
          <template #label>
            <span v-if="state.tools.length" class="truncate">{{ state.tools.join(', ') }}</span>
            <span v-else>No Tools</span>
          </template>
        </USelectMenu>
      </UFormGroup>

      <UFormGroup label="Files">
        <USelectMenu
          v-model="state.file_ids"
          :options="allFiles"
          multiple
          placeholder="Select Files"
          option-attribute="filename"
          value-attribute="id"
        >
          <template #label>
            <span v-if="state.file_ids.length" class="truncate">{{ state.file_ids.map(x => allFiles.find(y => y.id === x)?.filename).join(', ') }}</span>
            <span v-else>No Files</span>
          </template>
        </USelectMenu>
      </UFormGroup>

      <UFormGroup label="Model">
        <USelectMenu
          v-model="state.model"
          :options="allModels"
          placeholder="Select Model"
          option-attribute="id"
          value-attribute="id"
        />
      </UFormGroup>

      <UButton type="submit">Create</UButton>
    </UForm>
  </div>
</template>
