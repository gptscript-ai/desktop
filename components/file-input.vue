<script lang="ts" setup>
  const uploader = ref<HTMLInputElement>()

  interface Props {
    icon?: boolean
    size?: string
    variant?: string
    waiting?: boolean
  }

  const { icon=true, size="sm", variant="solid", waiting=false } = defineProps<Props>()

  const emit = defineEmits(['error','file'])

  function show() {
    if ( !uploader.value ) {
      return
    }

    uploader.value.click();
  }

  async function fileChange(event: InputEvent) {
    const input = event.target as HTMLInputElement
    if ( !input ) {
      return
    }

    const files = Array.from(input.files || []);

    try {
      const asyncFileContents = files.map(getFileContents);
      const fileContents = await Promise.all(asyncFileContents);

      for (const f of fileContents) {
        emit('file', f)
      }
    } catch (error) {
      emit('error', error);
    }
  }

  interface FileResult {
    name: string
    value: string | ArrayBuffer | null
  }

  async function getFileContents(file: File) {
    return new Promise<FileResult>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (ev) => {
        const value = ev.target!.result;
        const name = file.name;

        resolve({name, value});
      };

      reader.onerror = (err) => {
        reject(err);
      };

      reader.readAsDataURL(file);
    });
  }
</script>

<template>
  <span>
    <slot name="default" :show="show">
      <UButton
        :icon="icon ? 'i-heroicons-arrow-up-tray' : ''"
        aria-label="Upload"
        @click="show"
        :size="size"
        :variant="variant"
        :loading="waiting"
        :disabled="waiting"
      >
        <template v-if="waiting">Uploading…</template>
        <template v-else>Upload</template>
      </UButton>
    </slot>

    <input
      ref="uploader"
      type="file"
      class="hidden"
      @change="(e) => fileChange(e as any)"
    />
  </span>
</template>
