import type { IResource } from '@/composables/steve/types'

declare global {
  interface IThread extends IResource {
    spec: {
      assistantName: string
      parentThreadName?: string
      startMessageName?: string
    }

    status: {
     conditions: ICondition[]
     description: string
    }
  }

  export interface DecoratedThread extends DecoratedResource, IThread, IDecoratedThread {}
}

type IDecoratedThread = {
  [k in keyof typeof Thread]: ReturnType<typeof Thread[k]>
}

const Thread = {}

export default Thread
