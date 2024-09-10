export const FileProviderType = {
  Local: 'local',
  OneDrive: 'onedrive',
  Notion: 'notion',
} as const;

export type FileProviderType =
  (typeof FileProviderType)[keyof typeof FileProviderType];

export interface FileDetail {
  fileName: string;
  size: number;
  type: FileProviderType;
}
