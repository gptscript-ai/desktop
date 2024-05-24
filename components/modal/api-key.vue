<script lang="ts" setup>
import { type InferType, object, string } from 'yup'
import type { FormSubmitEvent } from '#ui/types'

const emit = defineEmits<{
  done: []
}>()

const prefs = usePrefs()
const schema = object({
  key: string().required('Required'),
  org: string(),
})

type Schema = InferType<typeof schema>

const state = reactive({
  key: prefs.openaiApiKey || '',
  org: prefs.openaiOrganization || '',
})

function done(e: FormSubmitEvent<Schema>) {
  prefs.openaiApiKey = e.data.key || ''
  prefs.openaiOrganization = e.data.org || ''

  emit('done')
}
</script>

<template>
  <UModal>
    <UForm :state="state" :schema="schema" @submit="done">
      <UCard>
        <template #header>
          Welcome to GPTStudio!
        </template>

        <img src="/img/clicky.svg" class="mb-4 w-[50%] mx-auto">

        The first thing we need is an OpenAI API key.  This will be used to exceute the instructions you write.

        <UFormGroup name="key" label="API Key" required class="my-5">
          <UInput
            v-model="state.key"
            type="password"
            autocomplete="password"
            placeholder=""
          />
        </UFormGroup>

        <UFormGroup name="org" label="Organization ID (optional)">
          <UInput
            v-model="state.org"
            type="text"
            placeholder=""
          />
        </UFormGroup>

        <template #footer>
          <div class="text-right space-x-5">
            <UButton type="submit">
              Done
            </UButton>
          </div>
        </template>
      </UCard>
    </UForm>
  </UModal>
</template>
