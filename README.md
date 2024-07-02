# ui
This provides a graphical interface to run and build your GPTScripts.

![Chat Image](assets/chat.png)

## Running
The UI is baked directly into the [gptscript](https://docs.gptscript.ai/) CLI. To run the UI, simply run the following command:

```bash
gptscript --ui
```

You can also specify a specific script to run (locally or remote).

```bash
gptscript --ui github.com/gptscript-ai/llm-basics-demo
```

## Development
If you'd like to contribute to the UI, you can run the following commands to get started:

```bash
git clone
cd ui
npm install
npm run dev
```

From here any changes you make to the NextJS app will be hot reloaded. Changes to `server.mjs`
will require a restart of the server.

### Tech stack
- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Socket.io](https://socket.io/)