import { Tool } from '@gptscript-ai/gptscript';

export interface ToolsApiResponse {
  tools: Record<string, Tool[]>;
}

export type FeaturedTool = {
  name: string;
  description: string;
  url: string;
  tags: string[];
  icon: React.ReactNode;
};

export type FeaturedTools = Record<string, FeaturedTool[]>;
