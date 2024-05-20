export interface Settings {
  openaiApiKey: string
  openaiOrganization: string
}

export interface ThreadFile {
  name: string
}

export interface Thread {
  id: string
  name: string
  files: ThreadFile[]
}
