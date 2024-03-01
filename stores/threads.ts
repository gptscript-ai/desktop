import { removeObject } from '@/utils/array'
import type { Thread } from 'openai/resources/beta/threads'
import { defineStore } from 'pinia'

export const useThreads = defineStore('threads', {
  state: () => {
    return {
      list: [] as Thread[],
      haveAll: false,
    }
  },

  getters: {},

  actions: {
    byId(id: string) {
      return (this.list as Thread[]).find(x => x.id === id )
    },

    async find(id: string) {
      const existing = this.byId(id)
      if ( existing ) {
        return existing
      }

      const data = reactive<Thread>(await $fetch(`/v1/threads/${encodeURIComponent(id)}`))

      this.list.push(data)
      return data
    },

    async findAll(force=false) {
      if ( !this.haveAll || force ) {
        const data = (await $fetch(`/v1/threads`)).map((x: any) => reactive(x)) as Thread[]

        replaceWith(this.list, ...data)
      }

      this.haveAll = true
      return this.list as Thread[]
    },

    async remove(id: string) {
      await $fetch(`/v1/threads/${encodeURIComponent(id)}`, {method: 'POST'})

      const existing = this.byId(id)
      if ( existing ){
        removeObject(this.list, existing)
      }
    },

    async create(assistantId: string, message: string) {
      const thread = await $fetch('/v1/threads', {
        method: 'post',
        body: {
          assistantId,
          message,
        }
      })

      const out = reactive(thread)
      this.list.push(out)

      return out
    }
  },
})
