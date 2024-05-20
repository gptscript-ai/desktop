import useSocket from '@/composables/useSocket'
import { Run } from '@gptscript-ai/gptscript'

export default function useGpt() {
  const sock = useSocket()

  return {
    async version(): Promise<string> {
      return sock.emitWithAck('gpt:version') as Promise<string>
    },

    async listModels(): Promise<string[]> {
      const res = await sock.emitWithAck('gpt:listModels') as string[]

      return res
    },

    // async runFile(): Promise<Run> {
    //   const res = await so
    // }
  }
}
