import { defineStore } from 'pinia'
import { SteveServerActions, SteveServerGetters, SteveServerState } from '@/composables/steve/server'
import { SteveTypeActions, SteveTypeGetters, SteveTypeState } from '@/composables/steve/type'
import {
  ASSISTANT, MESSAGE, THREAD
} from '@/config/schemas'

export const useMgmt = defineStore('mgmt', {
  state:   SteveServerState,
  getters: SteveServerGetters,
  actions: SteveServerActions,
})

export type SteveStoreType = ReturnType<typeof useMgmt>

export const useAssistants = defineStore('assistants', {
  state:   SteveTypeState<DecoratedAssistant>(ASSISTANT),
  getters: SteveTypeGetters<DecoratedAssistant>(),
  actions: SteveTypeActions<IAssistant, DecoratedAssistant>(),
})

export const useMessages = defineStore('messages', {
  state:   SteveTypeState<DecoratedMessage>(MESSAGE),
  getters: SteveTypeGetters<DecoratedMessage>(),
  actions: SteveTypeActions<IMessage, DecoratedMessage>(),
})

export const useThreads = defineStore('threads', {
  state:   SteveTypeState<DecoratedThread>(THREAD),
  getters: SteveTypeGetters<DecoratedThread>(),
  actions: SteveTypeActions<IThread, DecoratedThread>(),
})

export const mgmtStores: Record<string, any> = {
  [ASSISTANT]: useAssistants,
  [MESSAGE]: useMessages,
  [THREAD]: useThreads,
}

// -----

export function storeFor(type: string) {
  return mgmtStores[type]
}
