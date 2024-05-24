import useGpt from '@/composables/useGpt'
import useSocket from '@/composables/useSocket'
import { useThreads } from '@/stores/thread'
import { useRuns } from '@/stores/run'
import { usePrefs } from '@/stores/prefs'

declare global {
  interface Window {
    gpt:     ReturnType<typeof useGpt>
    prefs:   ReturnType<typeof usePrefs>
    runs:    ReturnType<typeof useRuns>
    sock:    ReturnType<typeof useSocket>
    threads: ReturnType<typeof useThreads>
  }
}
export default defineNuxtPlugin(() => {
  window.gpt = useGpt()
  window.prefs = usePrefs()
  window.runs = useRuns()
  window.sock = useSocket()
  window.threads = useThreads()
})
