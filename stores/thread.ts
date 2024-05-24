import { defineStore } from 'pinia'
import useSocket from '@/composables/useSocket'
import type { Thread } from '@/types'

export const useThreads = defineStore('thread', {
  state: () => {
    return {
      list:             <Thread[]>[],
      haveAll:          false,
      updateRegistered: false,
    }
  },

  getters: {},

  actions: {
    async find(id: string, force = false) {
      if (!this.haveAll || force) {
        await this.load()
      }

      return this.list.find((x) => x.id === id) as Thread
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

      this.list = res.map((x) => reactive(x))
      replaceWith(this.list, ...res)
      this.haveAll = true

      if (!this.updateRegistered) {
        this.updateRegistered = true
        sock.on('thread:update', async (t: Thread)  => {
          this.update(t)
        })
      }

      return true
    },

    async update(rawNeu: Thread) {
      const neu = reactive(rawNeu)
      const existing = await this.find(neu.id)

      if (existing) {
        Object.assign(existing, neu as any)
        existing.generation = (existing.generation || 0) + 1

        return existing
      } else {
        this.list.push(neu)

        return neu
      }
    },

    async refresh(id: string) {
      const sock = useSocket()

      console.info('refresh', id)

      const out = await this.update(await sock.emitWithAck('thread:get', id))

      console.info('refreshed', out)

      return out
    },

    async create(promptFilename: string) {
      const sock = useSocket()
      const neu = reactive(await sock.emitWithAck('thread:create', promptFilename)) as Thread

      this.list.push(neu)

      return neu
    },

    async remove(id: string) {
      const sock = useSocket()
      const existing = this.list.find((x) => x.id === id)

      if (existing) {
        removeObject(this.list, existing)
      }

      sock.emit('thread:remove', id)
    },
  },
})
