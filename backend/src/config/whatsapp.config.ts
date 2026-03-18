// @ts-ignore
import { Client, LocalAuth } from 'whatsapp-web.js';
import path from 'path';
import fs from 'fs';

function getProductionChromePath() {
    if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
    
    // Check if we downloaded it into .cache during Render build
    const cacheDir = path.resolve(process.cwd(), '.cache', 'puppeteer', 'chrome');
    if (fs.existsSync(cacheDir)) {
        try {
            const folders = fs.readdirSync(cacheDir);
            for (const folder of folders) {
                // Render Linux path
                const linuxPath = path.join(cacheDir, folder, 'chrome-linux64', 'chrome');
                if (fs.existsSync(linuxPath)) {
                    return linuxPath;
                }
            }
        } catch (e) {
            console.warn('[WhatsApp] Error reading cache dir:', e);
        }
    }
    return undefined; 
}

const isProduction = process.env.NODE_ENV === 'production';

// Common local paths for Windows
const localChromePath = path.resolve(process.cwd(), 'chrome', 'win64-146.0.7680.80', 'chrome-win64', 'chrome.exe');
const finalChromePath = isProduction ? getProductionChromePath() : (fs.existsSync(localChromePath) ? localChromePath : undefined);

console.log(`[WhatsApp] Using Chrome at: ${finalChromePath || 'Puppeteer Default'}`);

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "ente-bot",
        dataPath: path.join(process.cwd(), '.wwebjs_auth')
    }),
    puppeteer: {
        headless: true,
        executablePath: finalChromePath,
        args: process.platform === 'win32' ? [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ] : [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote',
            '--single-process',
            '--disable-extensions',
            '--disable-blink-features=AutomationControlled',
            '--disable-canvas-aa',
            '--disable-2d-canvas-clip-aa',
            '--disable-gl-drawing-for-tests',
            '--no-first-run',
            '--no-default-browser-check',
            '--js-flags="--max-old-space-size=256"'
        ]
    },
    webVersion: '2.2412.54',
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
    }
});

export default client;
