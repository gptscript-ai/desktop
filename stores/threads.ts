import useSocket from '@/composables/useSocket'
import type { Thread } from '@/types'
import { defineStore } from 'pinia'

export const useThreads = defineStore('thread', {
  state: () => {
    return {
      list: <Thread[]>[],
      haveAll: false,
    }
  },

  getters: {
    byId(id: string) {
      return this.list.find(x => x.id === id)
    }
  },

  actions: {
    async load() {
      const sock = useSocket()
      const res = await sock.emitWithAck('thread:list')
      this.list = res
      this.haveAll = true
      return true
    },

    async create() {
      const sock = useSocket()
      const neu = await sock.emitWithAck('thread:create')
      this.list.push(neu)
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
