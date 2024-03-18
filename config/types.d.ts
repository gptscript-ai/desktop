declare global {
  interface ToolObject {
    id: string
    name: string
    description: string
    created_at: number
    url?: string
    contents?: string
    subtool?: string
  }

  interface NavOption {
    label: string
    icon?: string
    to: string
    actions?: object[]
  }
}
