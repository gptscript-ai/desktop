# GPTStudio

## Develop
```bash
yarn install # Install node dependencies
yarn download # Download gptscript

yarn dev # Go to http://localhost:3000
yarn dev:electron # The window will pop up
```

## Build
```bash
yarn build:electron mac
yarn build:electron windows

# brew install rpm
yarn build:electron linux
```

Lots of files will be generated in `electron-dist`.  You probably want one of:
```
GPTStudio-x.y.z.dmg
GPTStudio-Setup-x.y.z.exe
```

## Environment Vars
| Name | Description | Default |
| ---- | ----------- | ------- |
| `GPTSCRIPT_BIN` | Path of the `gptscript` binary | From the `binaries` folder `yarn download` produces |
| `DATA_DIR` | Path of the directory to write state | `~/Documents/GPTStudio` |
| `TOOL_DIR` | Path of the directory with available tool scripts to show | `${DATA_DIR}/tools` |
| `OPENAI_API_KEY` | OpenAI API Key | None, UI prompts user |
| `OPENAI_API_ORGANIZATION` | OpenAI API Key | Nonei |
