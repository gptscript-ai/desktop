export default defineNuxtPlugin(({ $pinia }) => {
  const w: any = window

  w.threads = useThreads($pinia)
  w.assistants = useAssistants($pinia)

  w.ref = ref
  w.computed = computed
  w.reactive = reactive
  w.watchEffect = watchEffect
  w.route = useRoute()
  w.router = useRouter()

  console.info('# Welcome to warp zone')
})
