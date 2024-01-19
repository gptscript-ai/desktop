import { useContext } from '@/stores/context'
import {
   mgmtStores, useMgmt,
} from '@/stores/steve'
import { addObject } from '@/utils/array'
import { get, set } from '@/utils/object'

export default defineNuxtPlugin(({ $pinia }) => {
  const w: any = window
  const ctx = useContext($pinia)
  const mgmt = useMgmt($pinia)

  w.ctx = ctx
  w.mgmt = mgmt

  for ( const k in mgmtStores ) {
    const s = mgmtStores[k]

    w[s.$id] = s($pinia)
  }

  w.get = get
  w.set = set
  w.ref = ref
  w.computed = computed
  w.reactive = reactive
  w.watchEffect = watchEffect
  w.addObject = addObject
  w.route = useRoute()
  w.router = useRouter()

  console.info('# Welcome to warp zone')
  // console.info("# Try mgmt.schemaFor('cluster'), c.storeFor('api.acorn.io.app').all, apps.all, apps.byId('abc'), await apps.find('abc'), await apps.findAll()")

  return {
    provide: {
      get,
      set,
    },
  }
})
