<script lang="ts" setup>
import { type InferType, array, object, string } from 'yup'
import type { FormSubmitEvent } from '#ui/types'

interface Props {
  id?: string
}

const { id } = defineProps<Props>()

const assistants = useAssistants()
const allFiles = await useFiles().findAll()
const allModels = await useModels().findAll()
const allTools = await useTools().findAll()

let state = reactive({
  name: '',
  model: allModels.find(x => x.id === 'gpt-4') ? 'gpt-4' : allModels[0]?.id || '',
  description: '',
  instructions: '',
  tools: [] as string[],
  file_ids: [] as string[],
  metadata: {} as Record<string, string>,
})

if (id)
  state = JSON.parse(JSON.stringify(useAssistants().byId(id)))

if (!state.description)
  state.description = ''

if (!state.tools)
  state.tools = []

if (!state.file_ids)
  state.file_ids = []

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

const form = ref()
const saving = ref(false)

window.form = form
window.state = state

interface ToolOption {
  label: string
  value: string
  index?: number
  builtin?: boolean
  gptscript?: boolean
}

const toolOptions = computed(() => {
  const out: ToolOption[] = [
    { index: 0, label: 'Internet Search (good for broad searches)', value: 'internet_search', builtin: true, gptscript: true },
    { index: 1, label: 'Website Browsing (good for intranet sites)', value: 'site_browsing', builtin: true, gptscript: true },
    { index: 2, label: 'Code Interpreter', value: 'code_interpreter', builtin: true, gptscript: false },
  ]

  for (const t of allTools) {
    out.push({
      label: t.name || t.id,
      value: t.id,
      builtin: false,
    })
  }

  out.sort((a, b) => {
    if (a.builtin !== b.builtin)
      return +(b.builtin || false) - +(a.builtin || false)
    else if (a.index && b.index)
      return (a.index || 0) - (b.index || 0)

    else
      return a.label.localeCompare(b.label)
  })

  return out
})

const modelOptions = computed(() => {
  return allModels.sort((a, b) => a.id.localeCompare(b.id))
})

async function go(e: FormSubmitEvent<Schema>) {
  const body: any = { ...state }

  saving.value = true

  const builtinTools: string[] = []
  const gptScriptTools: string[] = []

  for (const t of body.tools) {
    const entry = toolOptions.value.find(x => x.value === t)
    if (entry && entry.builtin && !entry.gptscript)
      builtinTools.push(t)
    else
      gptScriptTools.push(t)
  }

  body.tools = builtinTools || []
  body.gptscript_tools = gptScriptTools || []

  try {
    let res: any

    if (id)
      res = await assistants.update(id, body)
    else
      res = await assistants.create(body)

    navigateTo({ name: 'a-assistant', params: { assistant: res.id } })
  }
  catch (e) {
    useToast().add({
      timeout: 0,
      title: 'Error Saving Assistant',
      description: `${e}`,
    })
  }
  finally {
    saving.value = false
  }
}

const files = useFiles()
const uploadWaiting = ref(false)

async function upload(f: { name: string, value: string }) {
  uploadWaiting.value = true
  try {
    const file = await files.upload(f.name, f.value)
    state.file_ids.push(file.id)
  }
  catch (e) {
    fileError(`${e}`)
  }
  finally {
    uploadWaiting.value = false
  }
}

function fileError(e: string) {
  useToast().add({
    timeout: 0,
    title: 'Error Uploading',
    description: e,
  })
}

function onError(event: any) {
  debugger
  const element = document.getElementById(event.errors[0].id)
  element?.focus()
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
</script>

<template>
  <div class="p-5">
    <h1 class="text-2xl">
      {{ id ? 'Edit' : 'Create' }} Assistant
    </h1>
    <UDivider class="my-2" />

    <UForm ref="form" :schema="schema" :state="state" class="space-y-4" @submit="go" @error="onError">
      <UFormGroup required label="Name">
        <UInput v-model="state.name" autofocus />
      </UFormGroup>

      <UFormGroup label="Description">
        <template #hint>
          <UTooltip text="Shown to the user of the assistant">
            <UIcon class="text-lg" name="i-heroicons-question-mark-circle" />
          </UTooltip>
        </template>
        <UTextarea v-model="state.description" autoresize />
      </UFormGroup>

      <UFormGroup required label="Instructions">
        <template #hint>
          <UTooltip text="How the model should reply to messages">
            <UIcon class="text-lg" name="i-heroicons-question-mark-circle" />
          </UTooltip>
        </template>
        <UTextarea v-model="state.instructions" autoresize />
      </UFormGroup>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <UFormGroup label="Tools">
            <!-- <template #hint>
              <UButton
                size="2xs"
                variant="link"
                disabled
              >Create</UButton>
            </template> -->

            <USelectMenu v-model="state.tools" :options="toolOptions" value-attribute="value" multiple placeholder="Select Tools">
              <template #label>
                <span v-if="state.tools.length" class="truncate">{{ state.tools.map(x => toolOptions.find(y => y.value === x)?.label).join(', ') }}</span>
                <span v-else>No Tools</span>
              </template>
            </USelectMenu>
          </UFormGroup>
        </div>
        <div>
          <UFormGroup label="Files">
            <template #hint>
              <FileInput
                :icon="false"
                variant="link"
                size="2xs"
                :waiting="uploadWaiting"
                class="p-0"
                @file="upload"
                @error="fileError"
              />
            </template>
            <USelectMenu
              v-model="state.file_ids"
              :options="allFiles"
              multiple
              placeholder="Select Files"
              option-attribute="filename"
              value-attribute="id"
            >
              <template #label>
                <span v-if="state.file_ids.length > 3" class="truncate">{{ state.file_ids.length }} selected</span>
                <span v-else-if="state.file_ids.length" class="truncate">{{ state.file_ids.map(x => allFiles.find(y => y.id === x)?.filename).join(', ') }}</span>
                <span v-else>No Files</span>
              </template>
            </USelectMenu>
          </UFormGroup>
        </div>
        <div>
          <UFormGroup label="Model">
            <USelectMenu
              v-model="state.model"
              :options="modelOptions"
              placeholder="Select Model"
              option-attribute="id"
              value-attribute="id"
            />
          </UFormGroup>
        </div>
      </div>

      <UButton :loading="saving" type="submit">
        <template v-if="saving">
          Saving…
        </template>
        <template v-else-if="id">
          Save
        </template>
        <template v-else>
          Create
        </template>
      </UButton>
    </UForm>
  </div>
</template>
