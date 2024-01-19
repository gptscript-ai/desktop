import type { IResource } from '@/composables/steve/types'

declare global {
  interface IAssistant extends IResource {
    spec: {
      cache: boolean
      description: string
      instructions: string
      jsonResponse: boolean
      maxTokens: number
      model: string
      name: string
      parameters: object
      tools: object[]
      vision: boolean
    }

    status: {
      conditions: ICondition[]
    }
  }

  export interface DecoratedAssistant extends DecoratedResource, IAssistant, IDecoratedAssistant {}
}

type IDecoratedAssistant = {
  [k in keyof typeof Assistant]: ReturnType<typeof Assistant[k]>
}

const Assistant = {}

export default Assistant
