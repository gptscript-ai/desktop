export function gatewayTool(): string {
  return 'github.com/gptscript-ai/knowledge@v0.4.10-gateway.7';
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
