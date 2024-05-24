<script setup lang="ts">
interface Props {
  size: 'sm' | 'md'
}

const { size } = withDefaults(defineProps<Props>(), { size: 'md' })
</script>

<template>
  <div class="waiting" :class="[size]">
    <div class="dot" />
    <div class="dot" />
    <div class="dot" />
  </div>
</template>

<style lang="scss" scoped>
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

    &.sm .dot {
      height: 7px;
      width: 7px;
      margin: 0 0.125rem;
    }

  }
</style>
