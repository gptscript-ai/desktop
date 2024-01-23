import type { IResource } from '@/composables/steve/types'

declare global {
  interface IParameter {
    type: string
    properties: object
  }

  interface ITool {
    'function': {
      description: string
      name: string,
      parameters: IParameter
    }
    type: string
  }
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
      tools: ITool[]
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
