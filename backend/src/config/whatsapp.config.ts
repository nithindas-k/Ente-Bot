// @ts-ignore
import { Client, LocalAuth } from 'whatsapp-web.js';

import path from 'path';

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "ente-bot"
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: path.resolve(process.cwd(), 'chrome', 'win64-146.0.7680.80', 'chrome-win64', 'chrome.exe')
    }
});

export default client;
