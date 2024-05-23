import useSocket from '@/composables/useSocket'
import type { Thread } from '@/types'
import { defineStore } from 'pinia'
import { useRuns } from '@/stores/runs'

export const useThreads = defineStore('thread', {
  state: () => {
    return {
      list: <Thread[]>[],
      haveAll: false,
      updateRegistered: false,
    }
  },

  getters: {},

  actions: {
    async find(id: string, force=false) {
      if (!this.haveAll || force) {
        await this.load()
      }

      return this.list.find(x => x.id === id) as Thread
    },

    async findAll(force = false) {
      if (!this.haveAll || force) {
        await this.load()
      }

      return this.list as Thread[]
    },

    async load() {
      const sock = useSocket()
      const res = await sock.emitWithAck('thread:list') as Thread[]
      this.list = res.map(x => reactive(x))
      replaceWith(this.list, ...res)
      this.haveAll = true

console.log('Load 1')
      if ( !this.updateRegistered ) {
console.log('Load 2')
        this.updateRegistered = true
console.log('Load 3')
        sock.on('thread:update', async (rawNeu: Thread)  => {
console.log('Load 4')
          const neu = reactive(rawNeu)
console.log('Load 5', neu)
          const existing = await this.find(neu.id)
console.log('Load 6', existing)

          if ( existing ) {
            console.info('Updating thread', existing.id)

            // if ( existing.history ) {
            //   console.log('Replacing history', existing.history, neu.history)
            //   replaceWith(existing.history, ...(neu.history || []))
            //   delete (neu as any).history
            // }

            Object.assign(existing, neu as any)
          } else {
            console.info('Adding thread', neu.id)
            this.list.push(neu)
          }
        })
      }

      return true
    },

    async create(promptFilename: string) {
      const sock = useSocket()
      const neu = reactive(await sock.emitWithAck('thread:create', promptFilename)) as Thread
      this.list.push(neu)
      return neu
    },

    async chat(thread: Thread, input: string) {
      return useRuns().chat(thread.id, input)
    },

    async remove(id: string) {
      const sock = useSocket()
      const existing = this.list.find(x => x.id === id)
      if ( existing ) {
        removeObject(this.list, existing)
      }

      sock.emit('thread:remove', id)
    }
  },
})
