import { startAppServer } from './server/app.mjs';
import open from 'open';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config({ path: ['.env', '.env.local'] });

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.GPTSCRIPT_PORT ?? '3000');
const dir = dirname(fileURLToPath(import.meta.url));
const runFile = process.env.UI_RUN_FILE;
startAppServer({ dev, hostname, port, dir })
  .then((address) => {
    let landingPage = address;
    if (runFile) {
      landingPage = `${landingPage}/?file=${runFile}`;
    }

    open(landingPage)
      .then(() => {
        console.log(`${landingPage} opened!`);
      })
      .catch((err) => {
        console.error(
          `Failed to open landing page ${landingPage}: ${err.message}`
        );
      });
  })
  .catch((err) => {
    console.error(`Failed to start app server: ${err.message}`);
    process.exit(1);
  });
