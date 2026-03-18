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
            apiKey: key,
        });
        console.log('[AI Service] API Key updated and client re-initialized. 🚀');
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
                if (fs.existsSync(p)) {
                    dictPath = p;
                    break;
                }
            }

            if (!dictPath) throw new Error('Not found');

            const fullContent = fs.readFileSync(dictPath, 'utf-8');
            // Split by section headers e.g. === GREETINGS ===
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

    private getRelevantSlang(analysis: any): string {
        const categories = new Set<string>([
            'ADDRESS WORDS',
            'REACTIONS & EXPRESSIONS',
            'APPROVAL / POSITIVE SLANG',
            'AGREEMENT / ACKNOWLEDGMENT',
            'COMMON MALAYALAM WORDS'
        ]);
        
        if (analysis.isGreeting) categories.add('GREETINGS');
        if (analysis.isFood) categories.add('FOOD WORDS');
        if (analysis.isFeelings) categories.add('FEELINGS & MOOD');
        if (analysis.isStudy) categories.add('STUDY / COLLEGE SLANG');
        if (analysis.isReaction) categories.add('REACTIONS & EXPRESSIONS');
        if (analysis.isQuestion) categories.add('ACTIONS & QUESTIONS');

        let result = '';
        categories.forEach(section => {
            const content = this.dictionarySections.get(section);
            if (content) result += `\n[${section}]\n${content}\n`;
        });

        console.log(`[AI] Optimized Prompt: Using ${categories.size}/${this.dictionarySections.size} slang categories. 🎯`);
        return result;
    }

    private analyzeMessage(message: string) {
        const trimmed = message.trim().toLowerCase();
        const words = trimmed.split(/\s+/);
        return {
            length: words.length,
            isQuestion: trimmed.includes('?'),
            isGreeting: /^(hi|hlo|hloo|hlw|hai|haii|hello|hey|hei|sup|gm|gn)\b/i.test(trimmed),
            isEmoji: /^[\p{Emoji}\p{Extended_Pictographic}\s]+$/u.test(trimmed),
            isShort: words.length <= 3,
            isFood: /\b(choru|chaya|kaapi|thinno|kazhichu|kudichoo|food|biriyani|kazhicho)\b/i.test(trimmed),
            isFeelings: /\b(tired|bore|sad|happy|madi|vishamam|paavam|kalippu|shokam)\b/i.test(trimmed),
            isStudy: /\b(padikkunno|exam|class|college|bunk|padikkan|result)\b/i.test(trimmed),
            isReaction: /^(eehh|oo|hmm|ayyo|potti|lol|haha|ayyo|enthuvade|entha)\b/i.test(trimmed),
        };
    }

    private extractSmartSample(rawChat: string): string {
        const lines = rawChat.split('\n').filter(line => line.trim());
        if (lines.length <= 200) return lines.join('\n');
        return lines.slice(-200).join('\n');
    }

    private cleanReply(reply: string, newMessage: string): string {
        reply = reply.trim();
        if (reply.startsWith('"') && reply.endsWith('"')) reply = reply.slice(1, -1).trim();
        const prefixes = ['assistant:', 'reply:', 'bot:', 'nithin:'];
        for (const p of prefixes) {
            if (reply.toLowerCase().startsWith(p)) {
                reply = reply.substring(p.length).trim();
                break;
            }
        }
        return reply || "Mm da";
    }

    private getFullDictionaryContents(): string {
        let full = '';
        this.dictionarySections.forEach((content, title) => {
            full += `\n[${title}]\n${content}\n`;
        });
        return full;
    }

    public buildSystemPrompt(personalityPrompt: string, newMessage: string): string {
        const fullDict = this.getFullDictionaryContents();
        console.log(`[AI] Full Context Enabled: Including ${this.dictionarySections.size} slang categories for maximum accuracy. 🚀`);

        return `
${personalityPrompt}

=== THE MANGLISH DICTIONARY (THE SOURCE OF TRUTH) ===
${fullDict}

=== THE WAY (MANDATORY WORKFLOW) ===
1. UNDERSTAND: Deeply analyze the user's message.
2. LOOKUP: Use ONLY the slang and words provided in the dictionary above.
3. DRAFT: Create a response as a casual Malayali buddy.
4. VERIFY: If it sounds like an AI, REWRITE it using Slang from the dictionary. sound like a "Malayali Chunk" (Best friend).

=== RULES ===
- NEVER say "I am an AI" or "language model".
- Use "Da", "Aliya", "Machane" naturally.
- Always sound like a "Chunk".
`;
    }

    public buildDefaultPrompt(newMessage: string): string {
        return this.buildSystemPrompt("You are a casual Malayali friend chatting in Manglish.", newMessage);
    }

    async generateReply(systemPrompt: string, history: any[], newMessage: string): Promise<string> {
        const recentHistory = history.slice(-10).map(msg => ({
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
                max_tokens: 250,
                temperature: 0.7,
            });
        };

        try {
            console.log(`[AI] Attempting ${this.PRIMARY_MODEL}...`);
            const response = await tryModel(this.PRIMARY_MODEL);
            return this.cleanReply(response.choices[0]?.message?.content || "", newMessage);
        } catch (error: any) {
            console.warn(`[AI] Error with ${this.PRIMARY_MODEL}: ${error.message}`);
            try {
                const response = await tryModel(this.BACKUP_MODEL);
                return this.cleanReply(response.choices[0]?.message?.content || "", newMessage);
            } catch (backupError) {
                return "Dei, network issue. Pinne parayam 🥺";
            }
        }
    }

    async analyzePersonality(rawChat: string): Promise<string> {
        const smartSample = this.extractSmartSample(rawChat);
        const prompt = `Analyze this chat style and create a "You are..." prompt. Focus on slang, mood, and length.\n\n${smartSample}`;

        try {
            const response = await this.groq.chat.completions.create({
                messages: [
                    { role: "system", content: "Expert personality analyzer." },
                    { role: "user", content: prompt }
                ],
                model: this.PRIMARY_MODEL,
                max_tokens: 400
            });
            return response.choices[0]?.message?.content || "";
        } catch (error) {
            return "You are a casual Malayali friend.";
        }
    }
}
