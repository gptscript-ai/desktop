export function gatewayTool(): string {
  return 'github.com/gptscript-ai/knowledge/gateway@v0.4.14-rc.11';
}

// This is a bit hacky because we need to make sure that the knowledge tool is updated to the latest version.
// We do this by checking if prefix is github.com/gptscript-ai/knowledge. It will not work if tool is pointing to a fork so when devs are using forks be careful.
export function ensureKnowledgeTool(tools: string[]): string[] {
  let found = false;
  for (let i = 0; i < tools.length; i++) {
    if (tools[i].startsWith('github.com/gptscript-ai/knowledge')) {
      tools[i] = gatewayTool();
      found = true;
      break;
    }
  }

  if (!found) {
    tools.push(gatewayTool());
  }
  return tools;
}

export function getCookie(name: string): string {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const value = parts?.pop()?.split(';').shift();
    if (value) {
      return decodeURIComponent(value);
    }
  }
  return '';
}
