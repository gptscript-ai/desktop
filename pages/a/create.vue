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

  const assistants = useAssistants()
  const allFiles = await useFiles().findAll()
  const allModels = await useModels().findAll()
  const allTools = await useTools().findAll()


  const toolOptions = computed(() => {
    const out = [
      {index: 0, label: 'Internet Search (good for broad searches)', value: 'internet_search', builtin: true, gptscript: true},
      {index: 1, label: 'Website Browsing (good for intranet sites)', value: 'site_browsing', builtin: true, gptscript: true},
      {index: 2, label: 'Retrieval', value: 'retrieval', builtin: true, gptscript: false},
      {index: 3, label: 'Code Interpreter', value: 'code_interpreter', builtin: true, gptscript: false},
    ]

    for ( const t of allTools ) {
      out.push({
        label: t.name || t.id,
        value: t.id,
        builtin: false
      })
    }

    out.sort((a, b) => {
      if ( a.builtin && !b.builtin ) {
        return -1
      }

      if ( b.builtin && !a.builtin ) {
        return 1
      }
      
      if ( b.builtin && a.builtin ) {
        return a.builtin.index - b.builtin.index
      }

      return a.label.localeCompare(b.label)
    })

    return out
  })

  const modelOptions = computed(() => {
    return allModels.sort((a, b) => a.id.localeCompare(b.id))
  })

  async function go(e: FormSubmitEvent<Schema>) {
    const body: any = {...state}

    const builtinTools: string[] = []
    const gptScriptTools: string[] = []

    for ( const t of body.tools ) {
      const entry = toolOptions.value.find(x =>x.value === t)
      if ( entry && entry.builtin && !entry.gptscript) {
        builtinTools.push(t)
      } else {
        gptScriptTools.push(t)
      }
    }

    body.tools = builtinTools || []
    body.gptscript_tools = gptScriptTools || []

    const res = await assistants.create(body)
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
        <USelectMenu v-model="state.tools" :options="toolOptions" value-attribute="value" multiple placeholder="Select Tools">
          <template #label>
            <span v-if="state.tools.length" class="truncate">{{ state.tools.map(x => toolOptions.find(y => y.value === x)?.label).join(', ') }}</span>
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
          :options="modelOptions"
          placeholder="Select Model"
          option-attribute="id"
          value-attribute="id"
        />
      </UFormGroup>

      <UButton type="submit">Create</UButton>
    </UForm>
  </div>
</template>
