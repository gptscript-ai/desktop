<script setup lang="ts">
import '@/assets/css/markdown.scss'
import { renderMarkdown } from '@/utils/markdown'
import type { Thread } from '@/types';
import type { RunWithOutput } from '~/stores/runs';
import { RunState } from '@gptscript-ai/gptscript';

interface Props {
  run?: RunWithOutput
  thread: Thread
}

const { thread, run } = defineProps<Props>()

const partialContent = computed(() => {
  if ( !run ) {
    return ''
  }

  const top = run.calls.find((x) => !x.parentID)

  return top?.output || ''
})

</script>

<template>
  <div class="messages">
    <div v-for="(m, idx) in thread.history" :key="idx" class="message shadow-md" :class="[m.role]">
      <div class="content">
        <div v-html="renderMarkdown(m.content)" />
      </div>
    </div>

    <div v-if="run?.state === RunState.Creating" class="message assistant">
      <div class="content">
        <Waiting/>
      </div>
    </div>
    <div v-else-if="run?.state === RunState.Error">
      <UAlert color="red" variant="subtle" title="Error" :description="run.err"/>
    </div>
    <div v-else-if="run?.state === RunState.Running">
      <div>Content:  {{partialContent}}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .messages {
      display: grid;
      padding-top: 20px;

      @media all and (min-width: 766px)  {
        grid-template-columns: 1fr 3fr 1fr;
      }
  }

  .message {
    padding: 0.5rem;
    margin: 1rem;
    border-radius: 0.5rem;
    position: relative;

    .content {
      word-wrap: break-word;
      word-break: break-all;

      :deep(A) {
        text-decoration: underline;
      }
    }

    &.user .content {
      color: white;
    }

    &.user {
      @media all and (min-width: 766px)  {
        grid-column: 2/ span 2;
      }

      margin-left: auto;

      background-color: rgba(#2563eb,0.8);
      border: 1px solid rgba(#2563eb,0.2);
    }

    &.assistant {
      @media all and (min-width: 766px)  {
        grid-column: 1/ span 2;
      }
      margin-right: auto;

      background-color: rgba(#aaa, 0.1);
      border: 1px solid rgba(#aaa, 0.2);

      :deep(A) {
        color: #5676ff;
      }
    }

    .date {
      position: absolute;
      left: 0;
      top: -20px;
      line-height: 16px;
    }

    .icon {
      height: 16px;
      display: inline-block;
      position: relative;
      top: -2px;
      margin-right: 5px;
    }
  }
</style>
