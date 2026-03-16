// @ts-ignore
import { Client, LocalAuth } from 'whatsapp-web.js';
import path from 'path';

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
        executablePath: 'C:\\Users\\nithi\\OneDrive\\Documents\\Side Project\\Ente Bot\\backend\\chrome\\win64-146.0.7680.80\\chrome-win64\\chrome.exe',
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
