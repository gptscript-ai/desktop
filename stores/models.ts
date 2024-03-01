import type { Model } from 'openai/resources/models'
import { defineStore } from 'pinia'

export const useModels = defineStore('models', {
  state: () => {
    return {
      list: [] as Model[],
      haveAll: false,
    }
  },

  getters: {},

  actions: {
    byId(id: string) {
      return (this.list as Model[]).find(x => x.id === id )
    },

    async find(id: string) {
      const all = await this.findAll()
      const existing = this.byId(id)
      if ( existing ) {
        return existing
      }
    },

    async findAll(force=false) {
      if ( !this.haveAll || force ) {
        const data = (await $fetch(`/v1/models`)).map((x: any) => reactive(x)) as Model[]

        replaceWith(this.list, ...data)
      }

      this.haveAll = true
      return this.list as Model[]
    },
  },
})
