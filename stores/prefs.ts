import { defineStore } from 'pinia'
import { defaultPrefs } from '~/config/prefs'
import type { Prefs } from '~/types'

export const usePrefs = defineStore('prefs', {
  state: () => {
    const loaded = ref(false)
    const out: Partial<Prefs> = {}

    for (const k in defaultPrefs) {
      const kk = k as keyof Prefs

      out[kk] = ref(defaultPrefs[kk]) as any

      watch(out[kk] as any, async (neu) => {
        if (!loaded.value) {
          return
        }

        // console.info('Updating', k, '=>', neu)
        const sock = useSocket()
        const res = await sock.emitWithAck('prefs:set', k, neu) as Partial<Prefs>
        // console.info('Updated', k, '=>', res)
      })
    }

    return {
      loaded,
      ...out,
    }
  },

  actions: {
    async reset() {
      const sock = useSocket()

      await sock.emitWithAck('prefs:reset') as Partial<Prefs>
      await this.load()
    },

    async load() {
      // console.info('Loading prefs')
      const sock = useSocket()
      const res = await sock.emitWithAck('prefs:get') as Partial<Prefs>

      this.apply(res)
      // console.info('Loaded prefs')
    },

    apply(obj: Partial<Prefs>) {
      // console.info('Applying prefs', JSON.stringify(obj))
      Object.assign(this, obj)
      // console.info('Applied prefs')

      nextTick(() => {
        this.loaded = true
      })
    },
  },
})
