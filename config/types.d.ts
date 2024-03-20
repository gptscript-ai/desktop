declare global {
  interface FileResult {
    name : string
    value: string | ArrayBuffer | null
  }

  interface NavOption {
    label   : string
    icon?   : string
    to      : string
    actions?: object[]
  }

  interface ToolObject {
    id         : string
    name       : string
    description: string
    created_at : number
    url?       : string
    contents?  : string
    subtool?   : string
  }
}
