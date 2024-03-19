<script lang="ts" setup>
import { type InferType, array, object, string } from 'yup'
import type { FormSubmitEvent } from '#ui/types'
import type ToolObject from '@/config/types'

const tools = useTools()
const saving = ref(false)

const schema = object({
  url: string().required(),
  subtool: string().optional(),
  env_vars: array(string()).optional(),
})

  type Schema = InferType<typeof schema>

const state = reactive<ToolObject>({
  url: '',
  env_vars: [] as string[],
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
      <UFormGroup label="URL" required>
        <template #hint>
          <UButton size="sm" color="blue" variant="link" to="https://tools.gptscript.ai/" target="_blank" rel="noopener nofollow noreferrer" class="pr-0 mr-0">
            Find more tools
          </UButton>
        </template>

        <UInput v-model="state.url" />
      </UFormGroup>

      <!-- <UFormGroup label="Subtool">
        <UInput v-model="state.subtool" />
      </UFormGroup> -->

      <MapInput
        v-model="state.env_vars"
        as="array"
        add-label="Add Environment Variable"
        key-label="Environment Variable"
        value-label="Value"
        separator="="
        show-separator
      />

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
