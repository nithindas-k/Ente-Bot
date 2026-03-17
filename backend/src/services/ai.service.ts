import * as fs from 'fs';
import * as path from 'path';
import { IAIService } from './interfaces/IAIService';
import Groq from 'groq-sdk';

export class AIService implements IAIService {
    private groq: Groq;
    private dictionarySections: Map<string, string> = new Map();
    private readonly PRIMARY_MODEL = "llama-3.3-70b-versatile";
    private readonly BACKUP_MODEL = "llama-3.1-8b-instant";

    constructor(apiKey?: string) {
        this.groq = new Groq({
            apiKey: apiKey || process.env.GROQ_API_KEY || '',
        });
        this.loadManglishDictionary();
    }

    public updateApiKey(key: string): void {
        this.groq = new Groq({
            apiKey: key || process.env.GROQ_API_KEY || '',
        });
        console.log('[AI Service] API Key updated and client re-initialized. 🚀');
    }

    // ============================================
    // LOAD & PARSE DICTIONARY (Hybrid Mode)
    // ============================================
    private loadManglishDictionary(): void {
        try {
            const dictPath = path.join(__dirname, '../data/manglish_dictionary.txt');
            const fullContent = fs.readFileSync(dictPath, 'utf-8');
            
            const sections = fullContent.split(/===\s+(.*?)\s+===/g);
            for (let i = 1; i < sections.length; i += 2) {
                const title = sections[i]?.trim();
                const content = sections[i + 1]?.trim();
                if (title && content) {
                    this.dictionarySections.set(title, content);
                }
            }
            console.log(`[Dictionary] Loaded ${this.dictionarySections.size} slang categories ✅`);
        } catch (error) {
            console.warn('[Dictionary] manglish_dictionary.txt not found ⚠️');
        }
    }

    private getRelevantSlang(category: string): string {
        const universalSections = [
            'ADDRESS WORDS',
            'REACTIONS & EXPRESSIONS',
            'APPROVAL / POSITIVE SLANG',
            'AGREEMENT / ACKNOWLEDGMENT',
            'COMMON MALAYALAM WORDS'
        ];
        
        const categoryMap: Record<string, string> = {
            'GREETING': 'GREETINGS',
            'FOOD': 'FOOD WORDS',
            'FEELINGS': 'FEELINGS & MOOD',
            'STUDY': 'STUDY / COLLEGE SLANG',
            'REACTION': 'REACTIONS & EXPRESSIONS'
        };

        let result = '';
        universalSections.forEach(section => {
            const content = this.dictionarySections.get(section);
            if (content) result += `\n[${section}]\n${content.substring(0, 500)}\n`;
        });

        const targetSection = categoryMap[category];
        if (targetSection && !universalSections.includes(targetSection)) {
            const content = this.dictionarySections.get(targetSection);
            if (content) result += `\n[${targetSection}]\n${content.substring(0, 500)}\n`;
        }

        return result;
    }

    // ============================================
    // MESSAGE ANALYZER
    // ============================================
    private analyzeMessage(message: string) {
        const trimmed = message.trim();
        const words = trimmed.split(/\s+/);
        return {
            length: words.length,
            isQuestion: trimmed.includes('?'),
            isEmoji: /^[\p{Emoji}\p{Extended_Pictographic}\s]+$/u.test(trimmed),
            isShort: words.length <= 3,
            isLong: words.length > 10,
            isGreeting: /^(hi|hlo|hloo|hlw|hai|haii|hello|hey|hei|sup|gm|gn)\b/i.test(trimmed),
            isReaction: /^(eehh|oo|hmm|ayyo|potti|eede|kundhmm|ayenthye|noo|lol|haha|😂|😬|🥺|❤️|👍|😊|😅)\b/i.test(trimmed),
            isFeelings: /\b(tired|bore|sad|happy|stress|tension|madi|vishamam|santhosham)\b/i.test(trimmed),
            isFood: /\b(choru|chaya|kaapi|thinno|kazhichu|kudichoo|breakfast|lunch|dinner|biriyani|parotta|beef|saapdu)\b/i.test(trimmed),
            isStudy: /\b(padikkunno|exam|assignment|bunk|internal|arrear|submission|class|college)\b/i.test(trimmed),
        };
    }

    // ============================================
    // SMART SAMPLING
    // ============================================
    private extractSmartSample(rawChat: string): string {
        const lines = rawChat.split('\n').filter(line => line.trim());
        if (lines.length <= 200) return lines.join('\n');

        const sampleSize = 60;
        const beginning = lines.slice(0, sampleSize);
        const middle = lines.slice(Math.floor(lines.length / 2) - sampleSize / 2, Math.floor(lines.length / 2) + sampleSize / 2);
        const end = lines.slice(-sampleSize);

        return ["=== EARLY MESSAGES ===", ...beginning, "=== MIDDLE MESSAGES ===", ...middle, "=== RECENT MESSAGES ===", ...end].join('\n');
    }

    // ============================================
    // REPLY CLEANER
    // ============================================
    private cleanReply(reply: string, newMessage: string): string {
        reply = reply.trim();
        if (reply.toLowerCase().startsWith(newMessage.toLowerCase())) {
            reply = reply.substring(newMessage.length).trim();
        }
        if (reply.startsWith('"') && reply.endsWith('"')) {
            reply = reply.slice(1, -1).trim();
        }
        const prefixes = ['correct:', 'assistant:', 'reply:', 'bot:', 'nithin:'];
        for (const prefix of prefixes) {
            if (reply.toLowerCase().startsWith(prefix)) {
                reply = reply.substring(prefix.length).trim();
                break;
            }
        }
        return reply || "Mm da";
    }

    // ============================================
    // PROMPT BUILDERS
    // ============================================
    public buildSystemPrompt(personalityPrompt: string, newMessage: string): string {
        const m = this.analyzeMessage(newMessage);
        const category = m.isGreeting ? 'GREETING' : m.isReaction ? 'REACTION' : m.isFood ? 'FOOD' : m.isFeelings ? 'FEELINGS' : m.isStudy ? 'STUDY' : 'GENERAL';
        const relevantSlang = this.getRelevantSlang(category);

        return `
${personalityPrompt}

=== RELEVANT MANGLISH SLANG ===
${relevantSlang}

=== CORE RULES ===
❌ NEVER invent personal context
❌ NEVER repeat what they said
✅ Mirror message length
✅ Sound like a real Malayali friend
${m.isEmoji ? '→ EMOJI ONLY reply.' : ''}
${m.isShort && !m.isQuestion ? '→ MAX 4 words.' : ''}
`;
    }

    public buildDefaultPrompt(newMessage: string): string {
        const m = this.analyzeMessage(newMessage);
        const category = m.isGreeting ? 'GREETING' : m.isReaction ? 'REACTION' : m.isFood ? 'FOOD' : m.isFeelings ? 'FEELINGS' : m.isStudy ? 'STUDY' : 'GENERAL';
        const relevantSlang = this.getRelevantSlang(category);

        return `
You are a casual Malayali guy chatting. Keep it natural.
${relevantSlang}

Rules:
- Mirror length
- No fake context
- Stay short
`;
    }

    // ============================================
    // GENERATE REPLY (With Fallback)
    // ============================================
    async generateReply(systemPrompt: string, history: any[], newMessage: string): Promise<string> {
        const recentHistory = history.slice(-15).map(msg => ({
            role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: msg.content
        }));

        const tryModel = async (model: string) => {
            return await this.groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    ...recentHistory,
                    { role: "user", content: newMessage }
                ],
                model: model,
                max_tokens: 80,
                temperature: 0.5,
            });
        };

        try {
            // Try Primary
            console.log(`[AI] Attempting ${this.PRIMARY_MODEL}...`);
            const response = await tryModel(this.PRIMARY_MODEL);
            const raw = response.choices[0]?.message?.content || "";
            return this.cleanReply(raw, newMessage);
        } catch (error: any) {
            if (error.status === 429 || error.message?.includes('429')) {
                console.warn(`[AI] ${this.PRIMARY_MODEL} rate limited. Falling back to ${this.BACKUP_MODEL}...`);
                try {
                    const response = await tryModel(this.BACKUP_MODEL);
                    const raw = response.choices[0]?.message?.content || "";
                    return this.cleanReply(raw, newMessage);
                } catch (backupError: any) {
                    console.error(`[AI] Backup model also failed: ${backupError.message}`);
                    return "Sorry da, small issue with my brain. Try after sometime 🥺";
                }
            }
            console.error(`[AI Service] Error: ${error.message}`);
            return "Error generating AI response";
        }
    }

    async analyzePersonality(rawChat: string): Promise<string> {
        const smartSample = this.extractSmartSample(rawChat);
        const prompt = `Analyze this chat style and create a "You are..." prompt. Focus on slang, emoji, and length. ${smartSample}`;

        const tryAnalyze = async (model: string) => {
            return await (this.groq as any).chat.completions.create({
                messages: [
                    { role: "system", content: "Expert personality analyzer." },
                    { role: "user", content: prompt }
                ],
                model: model,
                max_tokens: 300,
                temperature: 0.3
            });
        };

        try {
            const response = await tryAnalyze(this.PRIMARY_MODEL);
            return response.choices[0]?.message?.content || "";
        } catch (error: any) {
            if (error.status === 429 || error.message?.includes('429')) {
                console.warn(`[AI] Analysis falling back to ${this.BACKUP_MODEL}...`);
                const response = await tryAnalyze(this.BACKUP_MODEL);
                return response.choices[0]?.message?.content || "";
            }
            return "Error: AI could not analyze the chat.";
        }
    }
}
