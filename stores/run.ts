import { defineStore } from 'pinia'
import type { Frame, Run } from '@gptscript-ai/gptscript'

export type RunWithOutput = Run & { output: string }

export const useRuns = defineStore('runs', {
  state: () => {
    return {
      list: reactive<RunWithOutput[]>([]),
      map:  {} as Record<string, RunWithOutput>,
    }
  },

  getters: {},

  actions: {
    async find(id: string) {
      if (this.map[id]) {
        return this.map[id]
      }
    },

    async findAll() {
      return this.list
    },

    async chat(threadId: string, input: string) {
      const sock = useSocket()
      const run = reactive(await sock.emitWithAck('thread:chat', threadId, input)) as RunWithOutput

      this.list.push(run)
      this.map[run.id] = run

      sock.on(`run:update:${ run.id }`, async (rawNeu: RunWithOutput, e: Frame) => {
        const neu = reactive(rawNeu)
        const existing = await this.find(run.id)

        if (existing) {
          // console.info('Updating run', existing.id)
          Object.assign(existing, neu as any)
        } else {
          // console.error('Adding run', neu.id)
          this.map[neu.id] = neu as any
          this.list.push(neu)
        }
      })

      sock.on(`run:finished:${ run.id }`, async (run: Run, output: string) => {
        const existing = await this.find(run.id)

        if (existing) {
          existing.output = output
        }

        cleanup()
      })

      sock.on(`run:error:${ run.id }`, async (run: Run, err: string) => {
        cleanup()
      })

      function cleanup() {
        sock.off(`run:update:${ run.id }`)
        sock.off(`run:finished:${ run.id }`)
        sock.off(`run:error:${ run.id }`)
      }

      return run
    },
  },
})
