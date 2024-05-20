import useGpt from '@/composables/useGpt'
import useSocket from '@/composables/useSocket'
import { useThreads } from '@/stores/threads'

declare global {
  interface Window {
    gpt: ReturnType<typeof useGpt>
    sock: ReturnType<typeof useSocket>
    threads: ReturnType<typeof useThreads>
  }
}
export default defineNuxtPlugin(() => {
  window.gpt = useGpt()
  window.sock = useSocket()
  window.threads = useThreads()
})
