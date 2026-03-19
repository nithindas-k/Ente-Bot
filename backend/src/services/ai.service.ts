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
        this.groq = new Groq({ apiKey: key });
        console.log('[AI Service] API Key updated. 🚀');
    }

    private loadManglishDictionary(): void {
        try {
            const possiblePaths = [
                path.join(process.cwd(), 'src/data/manglish_dictionary.txt'),
                path.join(process.cwd(), 'dist/data/manglish_dictionary.txt'),
                path.join(__dirname, '../data/manglish_dictionary.txt')
            ];

            let dictPath = '';
            for (const p of possiblePaths) {
                if (fs.existsSync(p)) { dictPath = p; break; }
            }

            if (!dictPath) throw new Error('Dictionary not found');

            const fullContent = fs.readFileSync(dictPath, 'utf-8');
            const sections = fullContent.split(/===\s+(.*?)\s+===/g);
            for (let i = 1; i < sections.length; i += 2) {
                const title = sections[i]?.trim();
                const content = sections[i + 1]?.trim();
                if (title && content) this.dictionarySections.set(title, content);
            }
            console.log(`[Dictionary] Loaded ${this.dictionarySections.size} slang categories ✅`);
        } catch (error) {
            console.warn('[Dictionary] manglish_dictionary.txt not found ⚠️');
        }
    }

    // ── MESSAGE ANALYZER ────────────────────────────────────────────────────
    private analyzeMessage(message: string) {
        const t = message.trim().toLowerCase();
        const words = t.split(/\s+/);
        return {
            wordCount: words.length,
            isGreeting:  /^(hi|hlo|hloo|hlw|hai|haii|hello|hey|hei|sup|gm|gn|wyd|wbu|hru)\b/i.test(t),
            isEmoji:     /^[\p{Emoji}\p{Extended_Pictographic}\s]+$/u.test(t),
            isShort:     words.length <= 3,
            isQuestion:  t.includes('?') || /\b(evide|enthaa|enthu|enthokke|evideyya|entheru|pokunno|varunno|padikkunno|kandoo|kettoo|arinjoo|enthuvaa|uyaranundo)\b/i.test(t),
            isFood:      /\b(choru|chaya|kaapi|thinno|kazhichu|kudichoo|food|biriyani|puttu|parotta|beef|saapdu)\b/i.test(t),
            isFeelings:  /\b(tired|bore|sad|happy|madi|vishamam|paavam|kalippu|shokam|mathi|santhosham|stress|tension|bore aanu|madi aayii)\b/i.test(t),
            isStudy:     /\b(padikkunno|exam|class|college|bunk|padikkan|result|attendance|internal|assignment|arrear)\b/i.test(t),
            isReaction:  /^(eehh|oo|hmm|ayyo|potti|lol|haha|aiyoo|entheda|myyyyyyy|noo|oomph|cheee|pha)\b/i.test(t),
            isDisapproval: /\b(theppu|kachara|mosham|waste|scene illa|kirmi|poda|pooda|unsahikable)\b/i.test(t),
            isAgreement: /\b(athe|sheri|sherida|sathyam|sherikkum|ille|alle|angane|athaa|hmkk|ookk)\b/i.test(t),
            isTime:      /\b(ippo|ippol|pinne|innale|nale|raavile|uchakku|vaikunneram|raathri|enthu neram)\b/i.test(t),
            isInternet:  /\b(dp|seen|blue tick|online|offline|block|screenshot|viral|trending|reel|story)\b/i.test(t),
        };
    }

    // ── SMART CATEGORY LOADER ───────────────────────────────────────────────
    private getSmartSlang(analysis: ReturnType<typeof this.analyzeMessage>): string {
        // Always include these core categories
        const categories = new Set<string>([
            'ADDRESS WORDS',
            'COMMON MALAYALAM WORDS',
            'AGREEMENT / ACKNOWLEDGMENT',
        ]);

        if (analysis.isGreeting)    { categories.add('GREETINGS'); categories.add('REACTIONS & EXPRESSIONS'); }
        if (analysis.isReaction)    categories.add('REACTIONS & EXPRESSIONS');
        if (analysis.isEmoji)       categories.add('REACTIONS & EXPRESSIONS');
        if (analysis.isFeelings)    { categories.add('FEELINGS & MOOD'); categories.add('REACTIONS & EXPRESSIONS'); }
        if (analysis.isFood)        { categories.add('FOOD WORDS'); categories.add('ACTIONS & QUESTIONS'); }
        if (analysis.isStudy)       { categories.add('STUDY / COLLEGE SLANG'); categories.add('REACTIONS & EXPRESSIONS'); }
        if (analysis.isQuestion)    { categories.add('ACTIONS & QUESTIONS'); categories.add('DISAGREEMENT / CONFUSION'); }
        if (analysis.isDisapproval) { categories.add('DISAPPROVAL / NEGATIVE SLANG'); categories.add('FEELINGS & MOOD'); }
        if (analysis.isAgreement)   categories.add('REACTIONS & EXPRESSIONS');
        if (analysis.isTime)        categories.add('TIME WORDS');
        if (analysis.isInternet)    categories.add('INTERNET / SOCIAL MEDIA SLANG');

        let slang = '';
        categories.forEach(section => {
            const content = this.dictionarySections.get(section);
            if (content) slang += `\n[${section}]\n${content}\n`;
        });

        console.log(`[AI] Smart Prompt: ${categories.size}/${this.dictionarySections.size} slang categories loaded 🎯`);
        return slang;
    }

    // ── TYPING DELAY ────────────────────────────────────────────────────────
    public getTypingDelayMs(reply: string): number {
        const wordCount = reply.trim().split(/\s+/).length;
        const delay = 800 + (wordCount * 120);
        return Math.min(delay, 4000); // cap at 4 seconds
    }

    // ── SYSTEM PROMPT BUILDER ───────────────────────────────────────────────
    public buildSystemPrompt(personalityPrompt: string, newMessage: string): string {
        const analysis = this.analyzeMessage(newMessage);
        const slang = this.getSmartSlang(analysis);

        // Enforce reply length rules based on message length
        let lengthRule: string;
        if (analysis.isEmoji || analysis.wordCount <= 2) {
            lengthRule = 'VERY SHORT: Reply in 1-4 words only. Emoji is fine. No long sentences.';
        } else if (analysis.wordCount <= 5) {
            lengthRule = 'SHORT: Reply in 1-2 short sentences. Max 10 words.';
        } else {
            lengthRule = 'NORMAL: Reply in 1-3 sentences. Be concise. No paragraphs.';
        }

        // Time awareness
        const hour = new Date().getHours();
        let timeContext = '';
        if (hour >= 5 && hour < 12)       timeContext = 'It is morning. A "Gm da" or morning context is natural.';
        else if (hour >= 12 && hour < 17) timeContext = 'It is afternoon.';
        else if (hour >= 17 && hour < 21) timeContext = 'It is evening.';
        else                               timeContext = 'It is night. Late night texting is casual and sleepy.';

        return `${personalityPrompt}

=== YOUR IDENTITY ===
You are a real Malayali friend texting on WhatsApp. You are NOT an AI assistant.
You speak in Manglish — a mix of Malayalam words written in English and casual English.
You are the user's "Chunk" (best friend). You know them well.

=== TIME CONTEXT ===
${timeContext}

=== MANGLISH VOCABULARY (USE THESE WORDS NATURALLY) ===
${slang}

=== REPLY RULES — FOLLOW EXACTLY ===
1. LENGTH RULE: ${lengthRule}
2. REACTION FIRST: Always react before answering (e.g. "Ayyo!", "Poli da!", "Eehh sathyama?", "Adipoli!!")
3. ADDRESS: Use "Da", "Daa", "Machane", "Aliya", or "De" naturally at least once.
4. NEVER say: "Certainly", "Of course", "That's great", "I understand", "How can I help", "I am an AI".
5. BANNED WORDS: Do not say "Indeed", "Absolutely", "Fascinating", "Happy to help".
6. NATURAL ENDINGS: End with a question back (e.g. "Nee enthada cheythe?") or a short reaction emoji.
7. FILLER WORDS: NEVER reply with ONLY "Hmm", "Mmm", "Ahmm" — always say something real.

=== EXAMPLES OF PERFECT REPLIES ===
User: "Hlo da"       → "Haii daa 😄 evide poyirunne?"
User: "Bore aanu"    → "Ayyo paavam 🥺 enthu cheyyan? Vaa video kaanaaam da"
User: "Exam undu"    → "Aiyoo padichoo? Last minute aano da 😂"
User: "Adipoli!!"    → "Enthada patti?? Parayy parayy 🔥"
User: "😂😂"          → "Potti chaaavu 😂 enthu kandu da"
User: "Ok"           → "Sheri da 👍"
`;
    }

    public buildDefaultPrompt(newMessage: string): string {
        return this.buildSystemPrompt("You are a casual Malayali best friend chatting in Manglish.", newMessage);
    }

    private extractSmartSample(rawChat: string): string {
        const lines = rawChat.split('\n').filter(line => line.trim());
        if (lines.length <= 200) return lines.join('\n');
        return lines.slice(-200).join('\n');
    }

    private cleanReply(reply: string): string {
        reply = reply.trim();
        if (reply.startsWith('"') && reply.endsWith('"')) reply = reply.slice(1, -1).trim();
        const prefixes = ['assistant:', 'reply:', 'bot:', 'nithin:', 'ai:', 'response:'];
        for (const p of prefixes) {
            if (reply.toLowerCase().startsWith(p)) {
                reply = reply.substring(p.length).trim();
                break;
            }
        }
        return reply || "Mm da 👍";
    }

    // ── MAIN REPLY GENERATOR ─────────────────────────────────────────────────
    async generateReply(systemPrompt: string, history: Array<{ role: 'user' | 'assistant'; content: string }>, newMessage: string): Promise<string> {
        const recentHistory = history.slice(-8); // last 8 messages for context

        const tryModel = async (model: string) => {
            return await this.groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...recentHistory,
                    { role: 'user', content: newMessage }
                ],
                model,
                max_tokens: 150,   // Shorter cap → more natural, less essay
                temperature: 0.85, // Slightly higher → more personality variation
            });
        };

        try {
            console.log(`[AI] Calling ${this.PRIMARY_MODEL}...`);
            const response = await tryModel(this.PRIMARY_MODEL);
            return this.cleanReply(response.choices[0]?.message?.content || '');
        } catch (error: any) {
            console.warn(`[AI] Primary model failed: ${error.message}`);
            try {
                const response = await tryModel(this.BACKUP_MODEL);
                return this.cleanReply(response.choices[0]?.message?.content || '');
            } catch {
                return "Dei, pinne parayam da 🥺";
            }
        }
    }

    // ── PERSONALITY TRAINER ──────────────────────────────────────────────────
    async analyzePersonality(rawChat: string): Promise<string> {
        const smartSample = this.extractSmartSample(rawChat);
        const prompt = `Analyze this WhatsApp chat and write a "You are..." personality prompt.
Focus on: how they text (short/long), what slang they use, their emoji style, and their overall vibe.
Keep it under 100 words. Start directly with "You are..."\n\n${smartSample}`;

        try {
            const response = await this.groq.chat.completions.create({
                messages: [
                    { role: 'system', content: 'You are an expert at analyzing chat styles and writing personality prompts.' },
                    { role: 'user', content: prompt }
                ],
                model: this.PRIMARY_MODEL,
                max_tokens: 200
            });
            return response.choices[0]?.message?.content || '';
        } catch {
            return "You are a casual Malayali friend who texts in short Manglish messages.";
        }
    }
}
