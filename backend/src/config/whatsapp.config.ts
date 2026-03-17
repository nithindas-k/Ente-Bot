// @ts-ignore
import { Client, LocalAuth } from 'whatsapp-web.js';
import path from 'path';

const localChromePath = path.resolve(process.cwd(), 'chrome', 'win64-146.0.7680.80', 'chrome-win64', 'chrome.exe');
const finalChromePath = process.env.CHROME_PATH || localChromePath;

console.log(`[WhatsApp] Using Chrome at: ${finalChromePath}`);

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "ente-bot",
        dataPath: path.join(process.cwd(), '.wwebjs_auth')
    }),
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    },
    puppeteer: {
        headless: true,
        executablePath: finalChromePath,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote',
            '--no-first-run',
            '--disable-extensions',
            '--disable-blink-features=AutomationControlled'
        ]
    }
});

export default client;
