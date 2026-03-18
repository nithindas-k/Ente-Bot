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
        }


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
                    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
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

    async syncContacts(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session?.isReady) return;
        try {
            const chats = await session.client.getChats();
            for (const chat of chats) {
                if (chat.isGroup) continue;
                const phone = chat.id.user;
                const existing = await this.contactRepo.findByPhone(null, phone);
                if (!existing) {
                    await this.contactRepo.create({
                        name: chat.name || "Unknown",
                        phoneNumber: phone,
                        botEnabled: false,
                        dailyMessageCount: 0
                    });
                }
            }
        } catch (err) {
            console.error(`[WhatsApp] Sync failed for ${sessionId}:`, err);
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
        const formatted = phoneNumber.replace(/\D/g, '').length === 10 ? '91' + phoneNumber.replace(/\D/g, '') : phoneNumber.replace(/\D/g, '');
        return await session.client.requestPairingCode(formatted);
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
