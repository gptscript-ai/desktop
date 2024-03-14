import { defineStore } from 'pinia'
import type { ToolObject } from '@/config/types'

export const useTools = defineStore('tools', {
  state: () => {
    return {
      list: [] as ToolObject[],
      haveAll: false,
    }
  },

  getters: {},

  actions: {
    byId(id: string) {
      return (this.list as ToolObject[]).find(x => x.id === id )
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
        const data = (await $fetch(`/v1/tools`)).map((x: any) => reactive(x)) as ToolObject[]

        replaceWith(this.list, ...data)
      }

      this.haveAll = true
      return this.list as ToolObject[]
    },

    async remove(id: string) {
      await $fetch(`/v1/tools/${encodeURIComponent(id)}`)

      const existing = this.byId(id)
      if ( existing ){
        removeObject(this.list, existing)
      }
    },
  },
})
