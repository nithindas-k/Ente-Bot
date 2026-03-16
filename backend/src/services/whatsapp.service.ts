import { IWhatsappService } from './interfaces/IWhatsappService';
import client from '../config/whatsapp.config';

export class WhatsappService implements IWhatsappService {
    private antiSpamService: any; // Type once injected
    private aiService: any;       // Type once injected
    private contactRepo: any;     // Type once injected
    private personalityRepo: any; // Type once injected
    private messageBuffers: Map<string, string[]> = new Map();
    private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
    private latestQr: string | null = null;

    constructor(antiSpamService: any, aiService: any, contactRepo: any, personalityRepo: any) {
        this.antiSpamService = antiSpamService;
        this.aiService = aiService;
        this.contactRepo = contactRepo;
        this.personalityRepo = personalityRepo;
    }

    getLatestQr(): string | null {
        return this.latestQr;
    }

    initialize(): void {
        client.on('qr', (qr: any) => {
            console.log('[WhatsApp] QR RECEIVED');
            this.latestQr = qr;
        });

        client.on('ready', () => {
            console.log('[WhatsApp] Client is ready!');
        });

        client.on('message', async (msg: any) => {
            const from = msg.from;
            const body = msg.body;

            // 7. No media spam (text only)
            if (msg.type !== 'chat') {
                return;
            }

            // 8. No group messages
            if (from.endsWith('@g.us')) {
                return;
            }

            // Sanitize number (remove @c.us)
            const phoneNumber = from.split('@')[0];

            const isSafe = await this.antiSpamService.checkAllRules(phoneNumber);
            if (!isSafe) return;

            // 3. One reply at a time (Debounce)
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

                const reply = await this.aiService.generateReply(systemPrompt, [], mergedMessage);

                await this.antiSpamService.applyHumanDelay();

            
                await msg.reply(reply);

           
                await this.antiSpamService.incrementDailyMessageCount(phoneNumber);

            }, 5000);

            this.debounceTimers.set(from, timer);
        });

        client.initialize();
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
}
