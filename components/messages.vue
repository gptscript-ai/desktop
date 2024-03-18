<script setup lang="ts">
  import { SparklesIcon } from '@heroicons/vue/24/outline'
  import { UserIcon } from '@heroicons/vue/24/solid'
  import { renderMarkdown } from '@/utils/markdown';
  import type { ThreadMessage } from 'openai/resources/beta/threads';
  import type { Assistant } from 'openai/resources/beta/index.mjs';

  interface Props {
    assistant?: Assistant
    modelValue: ThreadMessage[]
    waiting?: boolean
  }

  const { assistant, modelValue, waiting=false } = defineProps<Props>()

  const assistantName = computed(() => {
    return assistant?.name || 'GPTStack'
  })
</script>

<template>
  <div class="messages">
    <div v-for="m in modelValue" :key="m.id" :class="['message', m.role]">
      <div class="content">
        <template v-for="(c, idx) in m.content" :key="idx">
          <div v-if="c.type === 'text'" v-html="renderMarkdown(c.text.value)"></div>
          <template v-else>
            {{ c }}
          </template>
        </template>
      </div>
      <div class="date">
        <UTooltip>
          <template #text>
            <RelativeDate v-model="m.created_at"/>
          </template>

          <template v-if="m.role === 'user'">
            <UserIcon class="icon"/> You
          </template>
          <template v-else>
            <SparklesIcon class="icon"/> {{assistantName}}
          </template>
        </UTooltip>
      </div>
    </div>
    <div v-if="waiting" class="message assistant waiting">
      <div class="content">
        <div class="dot"/>
        <div class="dot"/>
        <div class="dot"/>
      </div>
      <div class="date">
        <UTooltip>
          <template #text>
            Soon…
          </template>
          <SparklesIcon class="icon"/> {{assistantName}}
        </UTooltip>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .messages {
      display: grid;
      grid-template-columns: 1fr 3fr 1fr;
      padding-top: 20px;
  }

  .message {
    padding: 1rem;
    margin: 1rem;
    border-radius: 1rem;
    position: relative;

    // .content {
      // word-wrap: break-word;
      // word-break: break-all;
    // }

    &.user .content {
      color: white;
    }

    &.user {
      grid-column: 1/ span 2;

      background-color: #5676ff;
      border: 1px solid #0c0eff;
    }

    &.assistant {
      grid-column: 2/ span 2;
      background-color: rgba(128, 128, 128, 0.1);
      border: 1px solid rgba(128, 128, 128, 0.2);
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

  .waiting {
    @keyframes scaling{
      0%, 100%{
        transform: scale(0.2);
        background-color: rgba(#5676ff, 50%);
      }

      25%{
        transform: scale(1);
        background-color: rgba(#5676ff, 75%);
      }

      50%{
        transform: scale(1);
        background-color: #5676ff;
      }
    }

    .dot {
        height: 15px;
        width: 15px;
        border-radius:50%;
        transform: scale(0);
        animation: scaling 1.2s ease-in-out infinite;
        display: inline-block;
        margin: 0 0.5rem;
    }

    .dot:nth-child(1) { animation-delay:0s; }
    .dot:nth-child(2) { animation-delay:0.2s; }
    .dot:nth-child(3) { animation-delay:0.4s; }
  }
</style>
