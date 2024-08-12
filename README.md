# Acorn Desktop

💫 **The best way to build, use, and share AI Assistants.** 💫 

https://github.com/user-attachments/assets/b9cfa1c3-ba76-4193-84bf-115096b1a3ee

At the core of Acorn Desktop are **Assistant** and **Tools**. 

**Tools** are Acorn Desktop's super power. They let the user and assistants interact with the rest of the world, including the user's workstation, APIs, and the Internet.

**Assistants** bring tools and the user together. They couple tools with context that affects its behavior, focus, and even personality.

A tool is a self-contained piece of functionality that an assistant can use to accomplish the tasks that a user lays out for it. Tools themselves can be LLM instructions, code-based (in python, node.js, or bash), or integrations with external systems.

When we say “integration with external systems,” we are primarily talking about API and CLI based integrations. In our Tool Catalog, you’ll find integrations with various APIs and CLIs. Our API integrations even handle authentication for you via OAuth. Some may prompt you for an API key if the service being called doesn’t support OAuth. Our CLI-based tools require that you have the corresponding cli on your workstation and that you’ve configured it and authenticated with it. The tool will test for the presence of the CLI and inform the assistant of whether it is available or not.

These integrations are extremely powerful, but may lead users to be concerned about security or the LLM taking actions on behalf of the user that the user doesn’t want it to. Here is how we address that:
1. Know that credentials DO NOT go to the LLM. The Oauth authentication flow is outside the LLM. Logging into your CLI must happen outside of your assistant chat. If a tool does prompt for a credential, such as an API key, that is handled entirely through traditional code and stored securely on your workstation. The credential never goes to the LLM.
2. Whenever the assistant decides it wants to call a tool, you will be prompted to authorize that call. This lets you know exactly what actions are going to be taken. Again, this prompting is in traditional code, it is not controlled by the LLM.

When creating an assistant, you can also author new tools inline if you can’t find the integration you need. We provide a code editor right in the app. We also support installing dependencies for these tools. For python we allow you to create a requirements.txt and for Node.js, a package.json. If users need to write a particularly complex tool, they can author it as an independent GPTScript, upload it to GitHub, and import it to your assistant. See https://docs.gptscript.ai/tools/authoring for more details.

Here are just some of the tools available to you:

#### AI and The Internet

[Vision](https://github.com/gptscript-ai/gpt4-v-vision), [Image Generation](https://github.com/gptscript-ai/dalle-image-generation), [Answers from the Internet](https://github.com/gptscript-ai/answers-from-the-internet), [Search Website](https://github.com/gptscript-ai/search-website), [Browser](https://github.com/gptscript-ai/browser)

#### Productivity

[Outlook Mail](https://github.com/gptscript-ai/tools/tree/main/apis/outlook/mail), [Outlook Calendar](https://github.com/gptscript-ai/tools/tree/main/apis/outlook/calendar), [Notion](https://github.com/gptscript-ai/tools/tree/main/apis/notion), [Slack](https://github.com/gptscript-ai/tools/tree/main/apis/slack), [Trello](https://github.com/gptscript-ai/tools/tree/main/apis/trello)

#### Working with Local Files

[Knowledge](https://github.com/gptscript-ai/knowledge), [Structured Data Querier](https://github.com/gptscript-ai/structured-data-querier), [Filesystem](https://github.com/gptscript-ai/context/tree/main/filesystem), [Workspace](https://github.com/gptscript-ai/context/tree/main/workspace), [PDF OCR Reader](https://github.com/gptscript-ai/pdf-tool/tree/main/gateway)

#### Coding and DevOps

[AWS](https://github.com/gptscript-ai/tools/tree/main/clis/aws), [Azure](https://github.com/gptscript-ai/tools/tree/main/clis/azure), [DigitalOcean](https://github.com/gptscript-ai/tools/tree/main/clis/digitalocean), [EKS](https://github.com/gptscript-ai/tools/tree/main/clis/eksctl), [GCP](https://github.com/gptscript-ai/tools/tree/main/clis/gcp), [GitHub](https://github.com/gptscript-ai/tools/tree/main/clis/github), [k8s](https://github.com/gptscript-ai/tools/tree/main/clis/k8s), [Supabase cli](https://github.com/gptscript-ai/tools/tree/main/clis/supabase), [Supabase API](https://github.com/gptscript-ai/tools/tree/main/apis/supabase)

## Development

If you'd like to contribute to the UI, you can run the following commands to get started:

```bash
git clone
cd desktop
npm install
npm run dev:electron
```

### Tech stack

- [GPTScript](https://gptscript.ai).
- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Socket.io](https://socket.io/)
- [Electron](https://www.electronjs.org/)

## Community

Join us on Discord: [![Discord](https://img.shields.io/discord/1204558420984864829?label=Discord)](https://discord.gg/9sSf4UyAMC)

## License

Copyright (c) 2024 [Acorn Labs, Inc.](http://acorn.io)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
