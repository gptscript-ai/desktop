export interface SelectOption {
  label:     string
  value:     string
  disabled?: boolean
}

export interface Prefs {
  debug:              boolean
  cache:              boolean
  defaultTool:        string
  openaiApiKey:       string
  openaiOrganization: string
}

export type ThreadDirEntry = ThreadFile | ThreadDir

export interface ThreadDir {
  type:     'dir'
  name:     string
  children: ThreadDirEntry[]
}

export interface ThreadFile {
  type: 'file'
  name: string
  path: string
}

export type Role = 'system' | 'user' | 'assistant'

export interface ThreadMessage {
  time:    number
  role:    Role
  content: string
  runId?:  string
}

export interface ThreadMeta {
  createdAt: number
  name:      string
  history:   ThreadMessage[]
}

export interface Thread extends ThreadMeta {
  id:          string
  generation?: number
  workspace:   ThreadDirEntry[]
  tool:        string
}

export interface ChatInputEvent {
  message: string
  cb:      () => void
}
