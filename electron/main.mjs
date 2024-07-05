import { app, BrowserWindow } from "electron";
import { getPort } from 'get-port-please'
import { startServer } from 'next/dist/server/lib/start-server.js'
import { join, dirname, normalize } from "path";
// import { fileURLToPath } from "url";
import { spawn } from 'node:child_process';

// const dir = dirname(dirname(dirname(fileURLToPath(import.meta.url))))
const dir = dirname(app.getAppPath())

console.info('Server Dir', dir)

app.on("ready", async () => {
    let url = 'http://localhost:3000'

    if ( app.isPackaged ) {
        url = await nextServer()
        await appServer()
    }

    createWindow(url);
});

app.on("window-all-closed", () => {
    if(process.platform !== "darwin"){
        app.quit();
    }
});

async function appServer() {
    const port = 3000 // await getPort({portRange: [30000, 40000]})

    console.log(`Starting app server on port ${port}`)

    const p = spawn('node', ['server.mjs'], {
        cwd: dir,
        detached: false,
        env: {
            GPTSCRIPT_PORT: port
        }
    })

    p.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    p.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    p.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });

    return `http://localhost:${port}`
}

async function nextServer() {
    const port = await getPort({portRange: [30000, 40000]})
    const nextDir = join(dirname(dirname(app.getAppPath())), 'web')

    console.log(`Starting Next for ${nextDir} on port ${port}`)

    try {
        await startServer({
            dir: nextDir,
            isDev: !app.isPackaged,
            hostname: 'localhost',
            port,
            customServer: true,
            allowRetry: false,
        })

        // const x = await getRequestHandlers()
        // x[2].getUpgradeHandler()
    } catch (e) {
        console.error(e)
        process.exit(1)
    } 

    // const appServe = app.isPackaged ? serve({
    //   directory: join(dir, "../out")
    // }) : null;

    return `http://localhost:${port}`
}

function createWindow(url) {
    const win = new BrowserWindow({
        width: 1024,
        height: 720,
        webPreferences: {
            preload: join(dir, "preload.js"),
            nodeIntegration: true,
        }
    });

    win.loadURL(url)
    win.webContents.openDevTools();
    win.webContents.on("did-fail-load", (e, code, desc) => {
        win.webContents.reloadIgnoringCache();
    });

//   if (app.isPackaged) {
//     const p = spawn('node', ['server.mjs'], {cwd: dir, detached: false})

//     p.stdout.on('data', (data) => {
//         console.log(`stdout: ${data}`);
//     });

//     p.stderr.on('data', (data) => {
//         console.error(`stderr: ${data}`);
//     });

//     p.on('close', (code) => {
//         console.log(`child process exited with code ${code}`);
//     }); 

//     appServe(win).then(() => {
//       win.loadURL("app://-");
//     });

//   } else {
//     win.loadURL("http://localhost:3000");
//     win.webContents.openDevTools();
//     win.webContents.on("did-fail-load", (e, code, desc) => {
//       win.webContents.reloadIgnoringCache();
//     });
//   }
}
