import type { IResource } from '@/composables/steve/types'

declare global {
  interface IFunctionCall {
    name: string
    arguments: string
  }

  interface IToolCall {
    _id: string
    _type: string
    'function': IFunctionCall
    index: number
  }

  interface IContentPart {
    image?: {
      base64: string
      contentType: string
    }
    text?: string
    toolCall?: {
      'function': IFunctionCall
      id: string
      index: number
      type: string
    }
  }

  interface IMessageInput {
    completion?: boolean
    content: IContentPart[]
    inProgress?: boolean
    toolCall?: IToolCall
  }

  interface IMessageBody {
    content: IContentPart[]
    role: string
    toolCall: IToolCall
  }

  interface IMessage extends IResource {
    spec: {
      fileNames?: string[]
      input: IMessageInput
      more?: boolean
      parentMessageName?: string
    }

    status: {
      conditions: ICondition[]
      inProgress: boolean
      message: IMessageBody
      nextMessageName: string
      runAfter: string
      threadName: string
    }
  }

  export interface DecoratedMessage extends DecoratedResource, IMessage, IDecoratedMessage {}
}

type IDecoratedMessage = {
  [k in keyof typeof Message]: ReturnType<typeof Message[k]>
}

const Message = {}

export default Message
