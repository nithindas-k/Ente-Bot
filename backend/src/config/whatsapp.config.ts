// @ts-ignore
import { Client, LocalAuth } from 'whatsapp-web.js';
import path from 'path';
import fs from 'fs';

function getProductionChromePath() {
    if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
    
    // Check if we downloaded it into .cache during Render build
    const cacheDir = path.resolve(process.cwd(), '.cache', 'puppeteer', 'chrome');
    if (fs.existsSync(cacheDir)) {
        const folders = fs.readdirSync(cacheDir);
        for (const folder of folders) {
            if (folder.startsWith('linux-')) {
                const exePath = path.join(cacheDir, folder, 'chrome-linux64', 'chrome');
                if (fs.existsSync(exePath)) {
                    return exePath;
                }
            }
        }
    }
    return undefined; // Let puppeteer try to find its default
}

const isProduction = process.env.NODE_ENV === 'production';
const localChromePath = path.resolve(process.cwd(), 'chrome', 'win64-146.0.7680.80', 'chrome-win64', 'chrome.exe');
const finalChromePath = isProduction ? getProductionChromePath() : localChromePath;

console.log(`[WhatsApp] Using Chrome at: ${finalChromePath || 'Puppeteer Default'}`);

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
        ...(finalChromePath ? { executablePath: finalChromePath } : {}),
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote',
            '--single-process',
            '--disable-extensions',
            '--disable-blink-features=AutomationControlled'
        ]
    }
});

export default client;
