import { createServer } from 'http';
import next from 'next';
import nextConfig from '../next.config.js';
import { Server } from 'socket.io';
import { GPTScript, RunEventType } from '@gptscript-ai/gptscript';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import os from 'os';

dotenv.config({ path: ['../.env', '../.env.local'] });

const AGENT = 1;
const USER = 2;
const STATE_FILE = 'state.json';
let runningScript = null;
let serverRunning = false;
let gptscriptInitialized = false;
let gptscriptInitPromise = null;

export const startAppServer = ({ dev, hostname, port, appDir }) => {
  const address = `http://${hostname}:${port ?? 3000}`;

  return new Promise((resolve, reject) => {
    if (serverRunning) {
      console.log(`server already running at ${address}`);
      return resolve(address);
    }

    const app = next({
      dev: dev,
      hostname: hostname,
      port: port,
      conf: nextConfig,
      dir: appDir,
      customServer: true,
    });
    const handler = app.getRequestHandler();

    const gptscript = new GPTScript({
      DefaultModelProvider: 'github.com/gptscript-ai/gateway-provider',
    });

    if (!gptscriptInitialized) {
      gptscriptInitPromise = initGPTScriptConfig(gptscript)
        .then(() => {
          gptscriptInitialized = true;
          console.log('GPTScript config initialized');
        })
        .catch((err) => {
          console.error('Error initializing GPTScript config:', err);
          reject(err);
        });
    }

    Promise.resolve(gptscriptInitPromise).then(() => {
      setInterval(
        () => {
          initGPTScriptConfig(gptscript).catch((err) => {
            console.error('Error updating GPTScript config:', err);
          });
        },
        30 * 60 * 1000
      ); // Pull the config from GitHub every 30 minutes

      app
        .prepare()
        .then(() => {
          const httpServer = createServer(handler);
          const io = new Server(httpServer);

          io.on('connection', (socket) => {
            io.emit('message', 'connected');
            socket.on(
              'run',
              async (
                location,
                tool,
                args,
                scriptWorkspace,
                threadID,
                scriptID
              ) => {
                if (runningScript) {
                  await runningScript.close();
                  runningScript = null;
                }
                try {
                  dismount(socket);
                  await mount(
                    location,
                    tool,
                    args,
                    scriptWorkspace,
                    socket,
                    threadID,
                    scriptID,
                    gptscript
                  );
                } catch (e) {
                  socket.emit('error', e.toString());
                }
              }
            );
          });

          httpServer.once('error', (err) => {
            reject(err);
          });

          httpServer.listen(port, () => {
            serverRunning = true;
            console.log(`> Server is ready at ${address}`);
            resolve(address);
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
};

const mount = async (
  location,
  tool,
  args,
  scriptWorkspace,
  socket,
  threadID,
  scriptID,
  gptscript
) => {
  const WORKSPACE_DIR =
    process.env.WORKSPACE_DIR ?? process.env.GPTSCRIPT_WORKSPACE_DIR;
  const THREADS_DIR =
    process.env.THREADS_DIR ?? path.join(WORKSPACE_DIR, 'threads');

  let script;
  if (typeof location === 'string') {
    script = await gptscript.parse(location, true);
  } else {
    script = location;
  }

  const opts = {
    input: JSON.stringify(args || {}),
    disableCache: process.env.DISABLE_CACHE === 'true',
    workspace: scriptWorkspace,
    prompt: true,
    confirm: true,
    env: [
      // Here we need to pass a fake GPTSCRIPT_THREAD_ID so that knowledge tool doesn't error out. Because it will always look for GPTSCRIPT_THREAD_ID in the env
      // It should not import anything from the env. This is the case where you chat in Edit Assistant page where thread is not enabled.
      'GPTSCRIPT_THREAD_ID=' + (threadID ? threadID : '0'),
      'GPTSCRIPT_SCRIPT_ID=' + (scriptID ? scriptID : '0'),
    ],
  };

  if (tool) opts.subTool = tool;

  let state = {};
  let statePath = '';
  if (threadID) statePath = path.join(THREADS_DIR, threadID, STATE_FILE);
  try {
    if (fs.existsSync(statePath)) {
      const stateString = fs.readFileSync(statePath, 'utf8');
      if (stateString) {
        state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        if (state && state.chatState) {
          opts.chatState = state.chatState;
        }
      }
    }

    socket.emit('loaded', {
      scriptContent: script,
      messages: state.messages ?? [],
      tools: state.tools ?? [],
    });

    // also load the tools defined the states so that when running a thread that has tools added in state, we don't lose them
    for (let block of script) {
      if (block.type !== 'text') {
        block.tools = [
          ...new Set([...(block.tools || []), ...(state.tools || [])]),
        ];
        break;
      }
    }
  } catch (e) {
    console.error('Error loading state:', e);
  }

  // Start the script
  socket.on('interrupt', async () => {
    if (runningScript) {
      runningScript.close();
      runningScript = null;
    } else {
      // If there is no running script, then send the interrupted event.
      // If there is a running script, then the interrupted event will be sent when the script finishes.
      socket.emit('interrupted');
    }
  });
  socket.on('disconnect', () => {
    if (runningScript) runningScript.close();
    runningScript = null;
  });

  if (!threadID || !state.chatState) {
    runningScript = await gptscript.evaluate(script, opts);
    socket.emit('running');

    runningScript.on(RunEventType.Event, (data) =>
      socket.emit('progress', {
        frame: data,
        name: script[0]?.name || data.tool?.name || '',
      })
    );
    runningScript.on(RunEventType.Prompt, async (data) =>
      socket.emit('promptRequest', {
        frame: data,
        name: script[0]?.name || data.tool?.name || '',
      })
    );
    runningScript.on(RunEventType.CallConfirm, (data) =>
      socket.emit('confirmRequest', {
        frame: data,
        name: script[0]?.name || data.tool?.name || '',
      })
    );
    socket.on(
      'promptResponse',
      async (data) => await gptscript.promptResponse(data)
    );
    socket.on('confirmResponse', async (data) => await gptscript.confirm(data));

    // Wait for the run to finish and emit any errors that occur. Specifically look for the "Run has been aborted" error
    // as this is a marker of an interrupt.
    runningScript
      .text()
      .then((output) => {
        if (!runningScript) return;

        if (!state.messages) state.messages = [];
        state.messages.push({
          type: AGENT,
          message: output,
          name: (runningScript.respondingTool() || {}).name || '',
        });
        state.chatState = runningScript.currentChatState();

        if (threadID) {
          fs.writeFile(statePath, JSON.stringify(state), (err) => {
            if (err) {
              socket.emit('error', err);
            }
          });
        }
      })
      .catch((e) => {
        if (e) {
          if (e.toString() === 'Error: Run has been aborted') {
            socket.emit('interrupted');
          } else {
            socket.emit('error', e.toString());
          }
        }
      });
  } else {
    socket.emit('running'); // temp
    socket.emit('resuming');
  }

  socket.on('addTool', async (tool) => {
    if (runningScript) {
      await runningScript.close();
      runningScript = null;
    }

    // find the root tool and then add the new tool
    for (let block of script) {
      if (block.type !== 'text') {
        block.tools = [...new Set([...(block.tools || []), tool])];
        break;
      }
    }

    state.tools = [...new Set([...(state.tools || []), tool])];

    if (threadID) {
      fs.writeFile(statePath, JSON.stringify(state), (err) => {
        if (err) {
          socket.emit('error', err.toString());
        }
      });
    }

    socket.emit('toolAdded', state.tools);
  });

  socket.on('removeTool', async (tool) => {
    if (runningScript) {
      await runningScript.close();
      runningScript = null;
    }

    const stateTools = (state.tools || []).filter((t) => t !== tool);

    // find the root tool and then remove the tool
    for (let block of script) {
      if (block.type !== 'text') {
        if (block.tools) {
          block.tools = [...new Set(block.tools.filter((t) => t !== tool))];
        }
        break;
      }
    }

    state.tools = stateTools;

    if (threadID) {
      fs.writeFile(statePath, JSON.stringify(state), (err) => {
        if (err) {
          socket.emit('error', err.toString());
        }
      });
    }

    socket.emit('toolRemoved', state.tools);
  });

  socket.on('saveScript', async (scriptId, newName) => {
    if (runningScript) {
      await runningScript.close();
      runningScript = null;
    }

    state.tools = [];
    for (let block of script) {
      if (block.type !== 'text') {
        block.name = newName || block.name;
        break;
      }
    }

    if (threadID) {
      fs.writeFile(statePath, JSON.stringify(state), (err) => {
        if (err) {
          socket.emit('error', err.toString());
        }
      });
    }

    socket.emit('scriptSaved', scriptId, script, state.tools);
  });

  // If the user sends a message, we continue and set up the next chat's event listeners
  socket.on('userMessage', async (message, newThreadId) => {
    if (newThreadId) {
      threadID = newThreadId;
      statePath = path.join(THREADS_DIR, threadID, STATE_FILE);
    }

    // Remove any previous promptResponse or confirmResponse listeners
    socket.removeAllListeners('promptResponse');
    socket.removeAllListeners('confirmResponse');

    // If there is not a running script, that means we're loading a thread and have been waiting
    // for the user to send a message.
    let name = script[0].name || '';
    if (!runningScript) {
      opts.input = message;
      opts.chatState = state.chatState;
      runningScript = await gptscript.evaluate(script, opts);
    } else {
      name = (runningScript.respondingTool() || {}).name || '';
      runningScript = runningScript.nextChat(message);
    }

    runningScript.on(RunEventType.Event, (data) =>
      socket.emit('progress', {
        frame: data,
        name: name || data.tool?.name || '',
      })
    );
    runningScript.on(RunEventType.Prompt, async (data) =>
      socket.emit('promptRequest', {
        frame: data,
        name: name || data.tool?.name || '',
      })
    );
    runningScript.on(RunEventType.CallConfirm, (data) =>
      socket.emit('confirmRequest', {
        frame: data,
        name: name || data.tool?.name || '',
      })
    );
    socket.on(
      'promptResponse',
      async (data) => await gptscript.promptResponse(data)
    );
    socket.on('confirmResponse', async (data) => await gptscript.confirm(data));

    // Wait for the run to finish and emit any errors that occur
    runningScript
      .text()
      .then((output) => {
        if (!runningScript) return;
        if (!state.messages) state.messages = [];
        state.messages.push(
          { type: USER, message: message },
          {
            type: AGENT,
            message: output,
            name: (runningScript.respondingTool() || {}).name || '',
          }
        );

        state.chatState = runningScript.currentChatState();

        if (threadID) {
          fs.writeFile(statePath, JSON.stringify(state), (err) => {
            if (err) {
              socket.emit('error', err);
            }
          });
        }
      })
      .catch((e) => {
        if (e) {
          if (e.toString() === 'Error: Run has been aborted') {
            socket.emit('interrupted');
          } else {
            socket.emit('error', e.toString());
          }
        }
      });
  });
};

// Only one script is allowed to run at a time in this system. This function is to dismount and
// previously mounted listeners.
const dismount = (socket) => {
  socket.removeAllListeners('promptResponse');
  socket.removeAllListeners('confirmResponse');
  socket.removeAllListeners('userMessage');
  socket.removeAllListeners('disconnect');
};

const initGPTScriptConfig = async (gptscript) => {
  // Run a non-LLM no-op script to ensure the GPTScript config exists
  const run = await gptscript.evaluate({
    instructions: '#!sys.echo noop',
  });
  await run.text();
  await run.close();

  const configPath = gptscriptConfigPath();

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (err) {
    console.error('Error reading config file:', err);
    return;
  }

  const response = await fetch(
    'https://raw.githubusercontent.com/gptscript-ai/gateway-config/main/config.json'
  );
  const defaultConfig = await response.json();

  // Update the config object with default values if they don't exist
  config = {
    ...defaultConfig,
    ...config,
    integrations: {
      ...defaultConfig.integrations,
      ...config.integrations,
    },
  };

  // Write the updated config back to the file
  fs.writeFile(
    configPath,
    JSON.stringify(config, null, 2),
    'utf8',
    (writeErr) => {
      if (writeErr) {
        console.error('Error writing config file:', writeErr);
        return;
      }
      console.log('Config file updated successfully');
    }
  );
};

function gptscriptConfigPath() {
  const homeDir = os.homedir();
  let configDir;

  if (os.platform() === 'darwin') {
    configDir =
      process.env.XDG_CONFIG_HOME ||
      path.join(homeDir, 'Library', 'Application Support');
  } else if (os.platform() === 'win32') {
    configDir = path.join(homeDir, 'AppData', 'Local');
  } else if (os.platform() === 'linux') {
    configDir = process.env.XDG_CONFIG_HOME || path.join(homeDir, '.config');
  } else {
    throw new Error('Unsupported platform');
  }

  return path.join(configDir, 'gptscript', 'config.json');
}
