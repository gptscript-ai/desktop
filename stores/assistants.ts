import type { Assistant } from 'openai/resources/beta/assistants'
import { defineStore } from 'pinia'
import { removeObject } from '@/utils/array'

export const useAssistants = defineStore('assistants', {
  state: () => {
    return {
      list: [] as Assistant[],
      haveAll: false,
    }
  },

  getters: {},

  actions: {
    byId(id: string): Assistant {
      return (this.list as Assistant[]).find(x => x.id === id)
    },

    async find(id: string) {
      let existing = this.byId(id)
      if (existing)
        return existing

      const data = reactive<Assistant>(await $fetch(`/v1/assistants/${encodeURIComponent(id)}`))

      // It might have showed up since making the call, and not worth being totally correct for now…
      existing = this.byId(id)
      if (existing)
        return existing

      this.list.push(data)
      return data
    },

    async findAll(force = false) {
      if (!this.haveAll || force) {
        const data = (await $fetch(`/v1/assistants`)).map((x: any) => reactive(x)) as Assistant[]

        replaceWith(this.list, ...data)
      }

      this.haveAll = true
      return this.list as Assistant[]
    },

    async create(body: Partial<Assistant>) {
      const neu = await $fetch('/v1/assistants', {
        method: 'post',
        body,
      })

      const out = reactive(neu)
      this.list.push(out)

      return out
    },

    async update(id: string, body: Partial<Assistant>) {
      const neu = await $fetch(`/v1/assistants/${encodeURIComponent(id)}`, {
        method: 'put',
        body,
      })

      const existing = this.byId(id)

      if (existing) {
        Object.apply(existing, neu as any)

        return existing
      }
      else {
        const out = reactive(neu)
        this.list.push(out)

        return out
      }
    },

    async remove(id: string) {
      try {
        await $fetch(`/v1/assistants/${encodeURIComponent(id)}`, { method: 'DELETE' })
      }
      catch (e) {}

      const existing = this.byId(id)
      if (existing)
        removeObject(this.list, existing)
    },
  },
})
