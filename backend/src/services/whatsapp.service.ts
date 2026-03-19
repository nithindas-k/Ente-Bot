import { Client, LocalAuth } from 'whatsapp-web.js';
import { IWhatsappService } from './interfaces/IWhatsappService';
import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

interface SessionData {
    client: Client;
    lastQr: string | null;
    isAuthenticated: boolean;
    isReady: boolean;
    isRefreshing: boolean;
    account: any | null;
}

export class WhatsappService extends EventEmitter implements IWhatsappService {
    private antiSpamService: any; 
    private aiService: any;       
    private contactRepo: any;     
    private personalityRepo: any; 
    private messageRepo: any;     
    
    private sessions: Map<string, SessionData> = new Map();
    private messageBuffers: Map<string, string[]> = new Map();
    private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

    constructor(antiSpamService: any, aiService: any, contactRepo: any, personalityRepo: any, messageRepo: any) {
        super();
        this.antiSpamService = antiSpamService;
        this.aiService = aiService;
        this.contactRepo = contactRepo;
        this.personalityRepo = personalityRepo;
        this.messageRepo = messageRepo;
    }

    private getChromePath(): string | undefined {
        // Explicit environment override
        if (process.env.CHROME_PATH) return process.env.CHROME_PATH;

        const isWin = process.platform === 'win32';
        
        // Check Common Windows Installation Paths
        if (isWin) {
            const winPaths = [
                'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
            ];
            for (const p of winPaths) {
                if (fs.existsSync(p)) return p;
            }
        } else {
            // Check Common Linux Production Paths (Railway/Koyeb/Ubuntu)
            const linuxPaths = [
                '/usr/bin/google-chrome',
                '/usr/bin/chromium-browser',
                '/usr/bin/chromium',
                '/usr/bin/google-chrome-stable'
            ];
            for (const p of linuxPaths) {
                if (fs.existsSync(p)) return p;
            }
        }

        // Fallback to Puppeteer local cache
        const cacheDir = path.resolve(process.cwd(), '.cache', 'puppeteer', 'chrome');
        if (fs.existsSync(cacheDir)) {
            try {
                const folders = fs.readdirSync(cacheDir);
                for (const folder of folders) {
                    const subdirs = ['chrome-linux64', 'chrome-win64', 'chrome-win32', 'chrome-mac'];
                    for (const sub of subdirs) {
                        const execName = isWin ? 'chrome.exe' : 'chrome';
                        const fullPath = path.join(cacheDir, folder, sub, execName);
                        if (fs.existsSync(fullPath)) return fullPath;
                    }
                }
            } catch (e) {}
        }

        return undefined;
    }

    async getOrInitSession(sessionId: string): Promise<SessionData> {
        let session = this.sessions.get(sessionId);
        if (!session) {
            console.log(`[WhatsApp] Initializing new session for: ${sessionId}`);
            const client = new Client({
                authStrategy: new LocalAuth({
                    clientId: sessionId,
                    dataPath: path.join(process.cwd(), '.wwebjs_auth')
                }),
                puppeteer: {
                    headless: true,
                    executablePath: this.getChromePath(),
                    args: [
                        '--no-sandbox', 
                        '--disable-setuid-sandbox', 
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--single-process', // RAM saving for Railway/Render
                        '--disable-gpu',
                        '--disable-extensions',
                        '--disable-component-update',
                        '--js-flags="--max-old-space-size=400"'
                    ],
                    protocolTimeout: 0
                },
                webVersion: '2.3000.1018901614',
                webVersionCache: {
                    type: 'remote',
                    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1018901614.html'
                }
            });

            session = {
                client,
                lastQr: null,
                isReady: false,
                isAuthenticated: false,
                isRefreshing: false,
                account: null
            };
            this.sessions.set(sessionId, session);
            this.setupClientEvents(sessionId, client);
            client.initialize().catch(err => console.error(`[WhatsApp] Init failed for ${sessionId}:`, err));
        }
        return session;
    }

    private setupClientEvents(sessionId: string, client: Client): void {
        client.on('qr', (qr: string) => {
            console.log(`[WhatsApp] QR RECEIVED for session: ${sessionId}`);
            const session = this.sessions.get(sessionId);
            if (session) {
                session.lastQr = qr;
                this.emit('qr', { sessionId, qr });
            }
        });

        client.on('authenticated', () => {
            console.log(`[WhatsApp] Session ${sessionId} AUTHENTICATED! Ready will follow soon.`);
            const session = this.sessions.get(sessionId);
            if (session) {
                session.lastQr = null;
                session.isAuthenticated = true;
                this.emit('authenticated', { sessionId });
            }
        });

        client.on('auth_failure', (msg) => {
            console.error(`[WhatsApp] Auth failure for ${sessionId}: ${msg}`);
            const session = this.sessions.get(sessionId);
            if (session) {
                session.lastQr = null;
                this.emit('auth_failure', { sessionId, msg });
            }
        });

        client.on('ready', async () => {
            console.log(`[WhatsApp] Client is ready for session: ${sessionId}`);
            const session = this.sessions.get(sessionId);
            if (session) {
                session.isReady = true;
                session.isAuthenticated = true;
                session.lastQr = null;
                
                // Fetch info after ready
                if (session.client.info) {
                    session.account = {
                        name: session.client.info.pushname || 'User',
                        phone: session.client.info.wid?.user || 'Unknown'
                    };
                }

                this.emit('ready', { sessionId });
                await this.syncContacts(sessionId);
            }
        });

        client.on('disconnected', async (reason) => {
            console.log(`[WhatsApp] Session ${sessionId} disconnected: ${reason}`);
            const session = this.sessions.get(sessionId);
            if (session) {
                session.isReady = false;
                this.emit('disconnected', { sessionId, reason });
            }
        });

        client.on('message', (msg) => this.handleIncomingMessage(sessionId, msg));
    }

    private async handleIncomingMessage(sessionId: string, msg: any) {
        if (msg.fromMe || msg.type !== 'chat' || !msg.body) return;
        if (msg.from.endsWith('@g.us')) return;

        const from = msg.from;
        const body = msg.body;
        const phoneNumber = from.split('@')[0];

        // Isolated DB context by adding session/userId filter if we had it, 
        // but currently we just fetch by phone. We should ideally filter by sessionId/userId too.
        let contact = await this.contactRepo.findByPhone(null, phoneNumber);
        if (!contact) {
            contact = await this.contactRepo.create({
                name: msg._data?.notifyName || "Unknown",
                phoneNumber,
                botEnabled: false,
                dailyMessageCount: 0
            });
        }

        const isSafe = await this.antiSpamService.checkAllRules(phoneNumber);
        if (!isSafe) {
            await this.contactRepo.update(contact._id.toString(), { lastMessageTime: new Date() });
            return;
        }

        // Buffer logic per user
        const bufferKey = `${sessionId}:${from}`;
        let buffer = this.messageBuffers.get(bufferKey) || [];
        buffer.push(body);
        this.messageBuffers.set(bufferKey, buffer);

        if (this.debounceTimers.has(bufferKey)) clearTimeout(this.debounceTimers.get(bufferKey));

        const timer = setTimeout(async () => {
            const pending = this.messageBuffers.get(bufferKey) || [];
            if (pending.length === 0) return;
            this.messageBuffers.delete(bufferKey);
            this.debounceTimers.delete(bufferKey);

            const merged = pending.join('\n');
            const personality = await this.personalityRepo.findByContactId(contact._id);
            const systemPrompt = personality?.systemPrompt || "Pretend you are helpful and casual chat friend. Casual conversation style only.";
            
            const finalPrompt = this.aiService.buildSystemPrompt(systemPrompt, merged);
            const reply = await this.aiService.generateReply(finalPrompt, [], merged);

            await this.antiSpamService.applyHumanDelay();
            await msg.reply(reply);
            await this.antiSpamService.incrementDailyMessageCount(phoneNumber);
        }, 5000);

        this.debounceTimers.set(bufferKey, timer);
    }

    private dpCache = new Map<string, { url: string | null, timestamp: number }>();

    async getProfilePicUrl(phone: string): Promise<string | null> {
        const now = Date.now();
        const cached = this.dpCache.get(phone);
        if (cached && (now - cached.timestamp < 3600000)) { // 1 hour cache
            return cached.url;
        }

        const firstSession = Array.from(this.sessions.values()).find(s => s.isReady && s.client);
        if (firstSession) {
            try {
                const formatted = phone.includes('@') ? phone : `${phone}@c.us`;
                // Check if page is still alive before calling
                if (firstSession.client.pupPage?.isClosed()) {
                   return null;
                }
                const url = await firstSession.client.getProfilePicUrl(formatted);
                this.dpCache.set(phone, { url, timestamp: now });
                return url;
            } catch (err) {
                // If it's a detached frame error, don't flood the logs too much
                const msg = (err as Error).message;
                if (!msg.includes('detached Frame')) {
                    console.error(`[WhatsApp] Failed to fetch DP for ${phone}:`, msg);
                }
                return null;
            }
        }
        return null;
    }

    async syncContacts(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session?.isReady) return;
        try {
            this.emit('sync-update', { sessionId, message: 'Starting contact synchronization...', progress: 0 });
            
            // getContacts() is significantly lighter and less prone to crashing than getChats()
            // when there are many conversations.
            let results: any[] = [];
            try {
                results = await session.client.getContacts();
                console.log(`[WhatsApp] Fetched ${results.length} contacts via getContacts()`);
            } catch (cErr) {
                console.warn(`[WhatsApp] Contacts sync failed, trying getChats() fallback...`);
                try {
                    results = await session.client.getChats();
                } catch (pErr) {
                    console.error(`[WhatsApp] Major OOM during sync. Bot is still connected but list skipped.`);
                    results = [];
                }
            }

            const total = results.filter(r => !r.isGroup && (r.isUser || r.id?.user)).length;
            if (total === 0) {
                this.emit('sync-update', { sessionId, message: 'Sync complete (Add contacts by messaging them).', progress: 100 });
                return;
            }

            this.emit('sync-update', { sessionId, message: `Found ${total} contacts. Syncing...`, progress: 10 });

            let current = 0;
            for (const item of results) {
                if (item.isGroup) continue;
                const phone = item.id?.user || item.id?._serialized?.split('@')[0];
                if (!phone) continue;

                try {
                    const existing = await this.contactRepo.findByPhone(null, phone);
                    if (!existing) {
                        await this.contactRepo.create({
                            name: item.name || item.pushname || "Unknown",
                            phoneNumber: phone,
                            botEnabled: false,
                            dailyMessageCount: 0
                        });
                        // Small pause every 10 contacts to allow Event Loop to breathe
                        if (current % 10 === 0) await new Promise(resolve => setTimeout(resolve, 50));
                    }
                } catch (dbErr) {
                    console.error("DB error during sync:", dbErr);
                }

                current++;
                if (current % 20 === 0 || current === total) {
                    const progress = 10 + Math.floor((current / total) * 90);
                    this.emit('sync-update', { 
                        sessionId, 
                        message: `Syncing: ${current}/${total}`, 
                        progress 
                    });
                }
            }
            this.emit('sync-update', { sessionId, message: 'Contact synchronization complete!', progress: 100 });
        } catch (err) {
            console.error(`[WhatsApp] Sync failed for ${sessionId}:`, err);
            this.emit('sync-update', { sessionId, message: 'Sync failed part-way (Memory Limit).', progress: 100, error: true });
        }
    }

    async sendMessage(to: string, content: string): Promise<void> {
        // Default session or look up? Needs a way to know which session to use.
        // For simplicity, we'll use the first active session if not specified, 
        // but this should be refactored to take sessionId.
        const firstSession = Array.from(this.sessions.values()).find(s => s.isReady);
        if (firstSession) {
            await firstSession.client.sendMessage(to, content);
        }
    }

    async logout(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (session) {
            try {
                await session.client.logout();
                session.isReady = false;
                session.lastQr = null;
                this.sessions.delete(sessionId);
            } catch (err) {
                console.error(`[WhatsApp] Logout error for ${sessionId}:`, err);
            }
        }
        
        // As requested: clear all data related to the user on logout
        console.log(`[WhatsApp] Wiping user data (contacts, personalities, messages) for session: ${sessionId}`);
        try {
            await Promise.all([
                this.contactRepo.deleteMany({}),
                this.personalityRepo.deleteMany({}),
                this.messageRepo.deleteMany({})
            ]);
            console.log(`[WhatsApp] Data wipe successful for session: ${sessionId}`);
        } catch (err) {
            console.error(`[WhatsApp] Failed to wipe user data for session: ${sessionId}:`, err);
        }
    }

    async refreshQr(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session || session.isRefreshing) return;
        
        try {
            session.isRefreshing = true;
            session.isReady = false;
            session.lastQr = null;
            await session.client.destroy();
            this.sessions.delete(sessionId);
            await this.getOrInitSession(sessionId);
        } catch (err) {
            console.error(`[WhatsApp] Refresh failed for ${sessionId}:`, err);
        } finally {
            if (session) session.isRefreshing = false;
        }
    }

    async getPairingCode(sessionId: string, phoneNumber: string): Promise<string> {
        const session = await this.getOrInitSession(sessionId);
        
        // Ensure format is numeric and includes country code
        let formatted = phoneNumber.replace(/\D/g, '');
        if (formatted.length === 10) formatted = '91' + formatted; // Default to India if 10 digits
        
        console.log(`[WhatsApp] Requesting pairing code for ${formatted} (Session: ${sessionId})`);
        
        try {
            return await session.client.requestPairingCode(formatted);
        } catch (err) {
            console.error(`[WhatsApp] Pairing code error:`, err);
            throw new Error("Failed to request code. Ensure number is correct and not already linked.");
        }
    }

    getSessionStatus(sessionId: string) {
        const session = this.sessions.get(sessionId);
        
        if (!session) return { status: 'disconnected', account: null };

        let status: 'disconnected' | 'initializing' | 'qr-ready' | 'authenticated' | 'connected' = 'initializing';
        
        if (session.isReady) status = 'connected';
        else if (session.isAuthenticated) status = 'authenticated';
        else if (session.lastQr) status = 'qr-ready';

        return {
            status,
            qr: session.lastQr,
            account: session.account,
            sessionId
        };
    }

    initialize(): void {
        console.log('[WhatsApp] Multi-session service initialized. Waiting for users to connect...');
    }
}
