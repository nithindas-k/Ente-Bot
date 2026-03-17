import { IWhatsappService } from './interfaces/IWhatsappService';
import client from '../config/whatsapp.config';
import fs from 'fs';
import path from 'path';

export class WhatsappService implements IWhatsappService {
    private antiSpamService: any; 
    private aiService: any;       
    private contactRepo: any;     
    private personalityRepo: any; 
    private messageRepo: any;     
    private messageBuffers: Map<string, string[]> = new Map();
    private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
    private latestQr: string | null = null;
    private isReady: boolean = false;

    constructor(antiSpamService: any, aiService: any, contactRepo: any, personalityRepo: any, messageRepo: any) {
        this.antiSpamService = antiSpamService;
        this.aiService = aiService;
        this.contactRepo = contactRepo;
        this.personalityRepo = personalityRepo;
        this.messageRepo = messageRepo;
    }

    getLatestQr(): string | null {
        return this.latestQr;
    }

    getStatus(): string {
        return this.isReady ? 'connected' : 'disconnected';
    }

    getAccountInfo(): any {
        if (!this.isReady || !client.info) return null;
        
        const pushname = client.info.pushname || 'WhatsApp User';
        return {
            name: pushname,
            phone: client.info.wid?.user || 'Unknown Number',
            initials: pushname.substring(0, 2).toUpperCase()
        };
    }

    async getProfilePicUrl(phone: string): Promise<string | null> {
        if (!this.isReady) return null;
        try {
        
            const contactId = phone.includes('@') ? phone : `${phone}@c.us`;
            return await client.getProfilePicUrl(contactId);
        } catch (e) {
            return null;
        }
    }

    initialize(): void {

        const lockFile = path.join(process.cwd(), '.wwebjs_auth', 'session-ente-bot', 'SingletonLock');
        if (fs.existsSync(lockFile)) {
            try {
                fs.unlinkSync(lockFile);
                console.log('[WhatsApp] Freed stale session lock.');
            } catch (err) {

                console.warn('[WhatsApp] Stale lock detected but busy. Attempting to proceed...');
            }
        }

        client.on('qr', (qr: any) => {
            console.log('[WhatsApp] QR RECEIVED');
            this.latestQr = qr;
        });

        client.on('ready', async () => {
            console.log('[WhatsApp] Client is ready!');
            this.isReady = true;
            this.latestQr = null; 
            
           
            console.log('[WhatsApp] Syncing existing contacts...');
            await this.syncContacts();
        });

        client.on('disconnected', async (reason: any) => {
            console.log(`[WhatsApp] Client disconnected. Reason: ${reason}`);
            this.isReady = false;
            
            if (reason === 'LOGOUT' || reason === 'logout') {
                await this.clearUserData();
            }
        });

        client.on('message', async (msg: any) => {
           
            if (msg.fromMe) return;
            if (msg.type !== 'chat') return;
            if (!msg.body || msg.body.trim() === '') return;
            
            const from = msg.from;
            const body = msg.body;
            console.log(`[WhatsApp] Message received from ${from}: ${body.substring(0, 20)}...`);

           
            if (from.endsWith('@g.us')) {
                return;
            }

           
            const phoneNumber = from.split('@')[0];

            
            let contact = await this.contactRepo.findByPhone(null, phoneNumber);
            if (!contact) {
                const contactName = msg._data?.notifyName || "Unknown";
                console.log(`[WhatsApp] New contact discovered: ${contactName} (${phoneNumber})`);
                contact = await this.contactRepo.create({
                    name: contactName,
                    phoneNumber: phoneNumber,
                    botEnabled: false,
                    dailyMessageCount: 0
                });
            }

            const isSafe = await this.antiSpamService.checkAllRules(phoneNumber);
            if (!isSafe) {
               
                await this.contactRepo.update(contact._id.toString(), { lastMessageTime: new Date() });
                return;
            }

         
            let buffer = this.messageBuffers.get(from) || [];
            buffer.push(body);
            this.messageBuffers.set(from, buffer);

            const existingTimer = this.debounceTimers.get(from);
            if (existingTimer) {
                clearTimeout(existingTimer);
            }

            const timer = setTimeout(async () => {
                const pendingBuffer = this.messageBuffers.get(from) || [];
                if (pendingBuffer.length === 0) return;

                this.messageBuffers.delete(from);
                this.debounceTimers.delete(from);

                const mergedMessage = pendingBuffer.join('\n');
                
                const contact = await this.contactRepo.findByPhone(null, phoneNumber);
                let systemPrompt = "Pretend you are helpful and casual chat friend. Keep your replies extremely short, strictly 1-3 sentences maximum. Casual conversation style only.";

                if (contact) {
                    const personality = await this.personalityRepo.findByContactId(contact._id);
                    if (personality?.systemPrompt) {
                        systemPrompt = personality.systemPrompt;
                    }
                }

               
                const finalPrompt = this.aiService.buildSystemPrompt(systemPrompt, mergedMessage);
                
                console.log(`[AI] Generating reply for ${phoneNumber} with dynamic prompt...`);
                const reply = await this.aiService.generateReply(finalPrompt, [], mergedMessage);

                await this.antiSpamService.applyHumanDelay();

            
                await msg.reply(reply);

           
                await this.antiSpamService.incrementDailyMessageCount(phoneNumber);

            }, 5000);

            this.debounceTimers.set(from, timer);
        });

        client.initialize();
    }


    async syncContacts(): Promise<void> {
        try {
            const chats = await client.getChats();
            console.log(`[WhatsApp] Found ${chats.length} existing chats. Syncing to DB...`);
            
            for (const chat of chats) {
                if (chat.isGroup) continue;
                
                const phoneNumber = chat.id.user;
                const existing = await this.contactRepo.findByPhone(null, phoneNumber);
                
                if (!existing) {
                    await this.contactRepo.create({
                        name: chat.name || "Unknown",
                        phoneNumber: phoneNumber,
                        botEnabled: false,
                        dailyMessageCount: 0
                    });
                }
            }
            console.log('[WhatsApp] Contact sync completed.');
        } catch (err) {
            console.error('[WhatsApp] Contact sync failed:', err);
        }
    }

    async sendMessage(to: string, content: string): Promise<void> {
        await client.sendMessage(to, content);
    }

    async destroy(): Promise<void> {
        try {
            await client.destroy();
            console.log('[WhatsApp] Client destroyed cleanly.');
        } catch (err) {
            console.warn('[WhatsApp] Error during destroy:', err);
        }
    }

    async clearUserData(): Promise<void> {
        try {
            console.log('[WhatsApp] Clearing all user data...');
            await this.contactRepo.deleteMany({});
            await this.personalityRepo.deleteMany({});
            await this.messageRepo.deleteMany({});
            console.log('[WhatsApp] All user data cleared successfully.');
        } catch (err) {
            console.error('[WhatsApp] Error clearing user data:', err);
        }
    }

    async logout(): Promise<void> {
        try {
            await client.logout();
            this.isReady = false;
            this.latestQr = null;
            console.log('[WhatsApp] Client logged out successfully.');
            await this.clearUserData();
        } catch (err) {
            console.error('[WhatsApp] Error during logout:', err);
        }
    }

    async refreshQr(): Promise<void> {
        try {
            console.log('[WhatsApp] Force refreshing QR Code (destroying client)...');
            this.latestQr = null;
            this.isReady = false;
            await client.destroy();
            console.log('[WhatsApp] Client destroyed. Re-initializing...');
            client.initialize(); 
        } catch (err) {
            console.error('[WhatsApp] Error during QR refresh:', err);
        }
    }

    async getPairingCode(phoneNumber: string): Promise<string> {
        try {
         
            let formattedNumber = phoneNumber.replace(/\D/g, '');
            
            
            if (formattedNumber.length === 10) {
                formattedNumber = '91' + formattedNumber;
                console.log(`[WhatsApp] Auto-added 91 prefix: ${formattedNumber}`);
            }

            console.log(`[WhatsApp] Requesting pairing code for ${formattedNumber}...`);
            
            
            if (client.pupPage) {
                
                await client.pupPage.exposeFunction('onCodeReceivedEvent', (code: string) => {
                    return code;
                }).catch(() => {
                 
                });
            }

            const code = await client.requestPairingCode(formattedNumber);
            return code;
        } catch (err) {
            console.error('[WhatsApp] Error requesting pairing code:', err);
            throw err;
        }
    }
}
