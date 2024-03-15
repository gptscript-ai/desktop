import type { FileObject } from 'openai/resources/files'
import { defineStore } from 'pinia'

export const useFiles = defineStore('files', {
  state: () => {
    return {
      list: [] as FileObject[],
      haveAll: false,
    }
  },

  getters: {},

  actions: {
    byId(id: string) {
      return (this.list as FileObject[]).find(x => x.id === id )
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
        const data = (await $fetch(`/v1/files`)).map((x: any) => reactive(x)) as FileObject[]

        replaceWith(this.list, ...data)
      }

      this.haveAll = true
      return this.list as FileObject[]
    },

    async upload(name: string, value: string) {
      const res = await $fetch('/v1/files', {
        method: 'POST',
        body: {name, value}
      })

      this.list.push(res)
    },

    async remove(id: string) {
      await $fetch(`/v1/files/${encodeURIComponent(id)}`)

      const existing = this.byId(id)
      if ( existing ){
        removeObject(this.list, existing)
      }
    },
  },
})
