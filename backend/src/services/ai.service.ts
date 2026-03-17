import * as fs from 'fs';
import * as path from 'path';
import { IAIService } from './interfaces/IAIService';
import groq from '../config/groq.config';

export class AIService implements IAIService {

    private manglishDictionary: string = '';
    private dictionarySections: Map<string, string> = new Map();

    constructor() {
        this.loadManglishDictionary();
    }

    // ============================================
    // LOAD & PARSE DICTIONARY
    // ============================================
    private loadManglishDictionary(): void {
        try {
            const dictPath = path.join(__dirname, '../data/manglish_dictionary.txt');
            const fullContent = fs.readFileSync(dictPath, 'utf-8');
            this.manglishDictionary = fullContent;
            
            // Parse into sections for token optimization
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
        const essentials = [
            'ADDRESS WORDS',
            'ACTIONS & QUESTIONS',
            'AGREEMENT / ACKNOWLEDGMENT',
            'REACTIONS & EXPRESSIONS'
        ];
        
        const categoryMap: Record<string, string> = {
            'GREETING': 'GREETINGS',
            'FOOD': 'FOOD WORDS',
            'FEELINGS': 'FEELINGS & MOOD',
            'STUDY': 'STUDY / COLLEGE SLANG',
            'REACTION': 'REACTIONS & EXPRESSIONS'
        };

        let result = '';
        
        // Add essential everyday words
        essentials.forEach(section => {
            result += `\n[${section}]\n${this.dictionarySections.get(section) || ''}\n`;
        });

        // Add topic-specific words
        const targetSection = categoryMap[category];
        if (targetSection && !essentials.includes(targetSection)) {
            result += `\n[${targetSection}]\n${this.dictionarySections.get(targetSection) || ''}\n`;
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
    // SMART SAMPLING FOR BIG CHAT FILES
    // ============================================
    private extractSmartSample(rawChat: string): string {
        const lines = rawChat.split('\n').filter(line => line.trim());
        const totalLines = lines.length;

        if (totalLines <= 200) return lines.join('\n');

        const sampleSize = 60;
        const beginning = lines.slice(0, sampleSize);
        const middle = lines.slice(
            Math.floor(totalLines / 2) - sampleSize / 2,
            Math.floor(totalLines / 2) + sampleSize / 2
        );
        const end = lines.slice(-sampleSize);

        const sample = [
            "=== EARLY MESSAGES ===", ...beginning,
            "=== MIDDLE MESSAGES ===", ...middle,
            "=== RECENT MESSAGES ===", ...end
        ].join('\n');

        console.log(`[Personality] Total: ${totalLines} lines → Sampled: ${sample.split('\n').length} lines`);
        return sample;
    }

    // ============================================
    // REPLY CLEANER
    // ============================================
    private cleanReply(reply: string, newMessage: string): string {
        reply = reply.trim();

        // Remove echo
        if (reply.toLowerCase().startsWith(newMessage.toLowerCase())) {
            reply = reply.substring(newMessage.length).trim();
        }

        // Remove surrounding quotes
        if (reply.startsWith('"') && reply.endsWith('"')) {
            reply = reply.slice(1, -1).trim();
        }

        // Remove few-shot prefix leaks
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
    // BUILD FULL SYSTEM PROMPT (with personality)
    // ============================================
    public buildSystemPrompt(personalityPrompt: string, newMessage: string): string {
        const m = this.analyzeMessage(newMessage);
        const category = m.isGreeting ? 'GREETING' : m.isReaction ? 'REACTION' : m.isFood ? 'FOOD' : m.isFeelings ? 'FEELINGS' : m.isStudy ? 'STUDY' : 'GENERAL';
        const relevantSlang = this.getRelevantSlang(category);

        return `
${personalityPrompt}

=== RELEVANT MANGLISH SLANG ===
${relevantSlang}

=== HOW TO USE THE DICTIONARY ===
- Use words FROM it naturally in your replies
- If they use "da", reply with "da". Match their slang style back.

=== FEW SHOT EXAMPLES (STRICTLY FOLLOW) ===
User: "Hlo" → Reply: "Hlo da"
User: "Hi" → Reply: "Hi da"
User: "Gm" → Reply: "Gm da"
User: "Choru thinno" → Reply: "Saapditta?"
User: "Tired aanu" → Reply: "Rest edukk da 🥺"
User: "😂" → Reply: "😂😂"
User: "Okey" → Reply: "Mmmk da"
User: "Padikkunno?" → Reply: "Mm try cheyyunnu da, nee?"
User: "Evideyya?" → Reply: "Veetil da, enthaa?"

=== CURRENT MESSAGE ANALYSIS ===
Message: "${newMessage}"
Length: ${m.length} word(s) | Category: ${category}

REPLY INSTRUCTION:
${m.isEmoji ? '→ EMOJI ONLY reply. No words.' : ''}
${m.isShort && !m.isQuestion ? '→ MAX 4 words.' : ''}
${m.isQuestion ? '→ Answer DIRECTLY.' : ''}
${m.isLong ? '→ 2-3 sentences max.' : ''}

=== CORE RULES ===
❌ NEVER invent personal context
❌ NEVER repeat what they said
❌ NEVER start with "Njan oru..." or "Ahmm"
❌ NEVER ask 2+ questions
✅ Mirror message length
✅ Sound like a real Malayali friend
        `;
    }

    // ============================================
    // BUILD DEFAULT PROMPT (no personality trained)
    // ============================================
    public buildDefaultPrompt(newMessage: string): string {
        const m = this.analyzeMessage(newMessage);
        const category = m.isGreeting ? 'GREETING' : m.isReaction ? 'REACTION' : m.isFood ? 'FOOD' : m.isFeelings ? 'FEELINGS' : m.isStudy ? 'STUDY' : 'GENERAL';
        const relevantSlang = this.getRelevantSlang(category);

        return `
You are a casual Malayali guy chatting on WhatsApp in natural Manglish.
You are friendly, chill, and always short in replies.
Keep replies short. Mirror message length. Never invent personal context.

=== RELEVANT MANGLISH SLANG ===
${relevantSlang}

=== FEW SHOT EXAMPLES ===
User: "Hi" → Reply: "Hi da"
User: "Enthaa" → Reply: "Onnumilla da, nee?"
User: "Choru thinno" → Reply: "Saapditta?"
User: "Tired aanu" → Reply: "Rest edukk da 🥺"
User: "😂" → Reply: "😂😂"
User: "Padikkunno?" → Reply: "Mm try cheyyunnu, nee?"

=== MESSAGE ANALYSIS ===
Message: "${newMessage}"
Category: ${category}

REPLY INSTRUCTION:
${m.isEmoji ? '→ EMOJI ONLY.' : ''}
${m.isShort && !m.isQuestion ? '→ MAX 4 words.' : ''}
${m.isQuestion ? '→ Answer DIRECTLY.' : ''}

=== CORE RULES ===
❌ Never invent personal context
❌ Mirror message length
✅ Sound like a real Malayali friend
        `;
    }

    // ============================================
    // GENERATE REPLY
    // ============================================
    async generateReply(systemPrompt: string, history: any[], newMessage: string): Promise<string> {
        // Limit history to last 15 messages to save tokens and stay within rate limits
        const recentHistory = history.slice(-15);
        const formattedHistory = recentHistory.map(msg => ({
            role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: msg.content
        }));

        try {
            const response = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    ...formattedHistory,
                    { role: "user", content: newMessage }
                ],
                model: "llama-3.3-70b-versatile",
                max_tokens: 80,
                temperature: 0.5,
                top_p: 0.9
            });

            const raw = response.choices[0]?.message?.content || "";
            return this.cleanReply(raw, newMessage);

        } catch (error: any) {
            console.error(`[AI Service] Error: ${error.message}`);
            return "Error generating AI response";
        }
    }

    // ============================================
    // ANALYZE PERSONALITY
    // ============================================
    async analyzePersonality(rawChat: string): Promise<string> {
        const smartSample = this.extractSmartSample(rawChat);

        const prompt = `Analyze this WhatsApp chat history to learn a person's unique speaking style.

CRITICAL INSTRUCTIONS:
1. IGNORE metadata like dates, times, sender names.
2. FOCUS on vocabulary, slang, sentence length, emoji habits.
3. OBSERVE language mix (Manglish/Malayalam-English).
4. Capture VIBE: casual, energetic, focused, playful?
5. Capture EXACT phonetic Manglish spelling they use.
6. Note which address words they use: da, machane, aliya, macha etc.
7. Note their emoji frequency and which emojis they use most.

Generate a concise System Prompt under 150 words in "You are..." format.
MUST include: "Keep replies short. Mirror message length. Never invent personal context."
MUST capture: exact slang, emoji style, sentence length, address words used.
MUST NOT invent personal details about the person.

${smartSample}`;

        try {
            const response = await (groq as any).chat.completions.create({
                messages: [
                    { role: "system", content: "You are an expert personality analyzer and prompt engineer." },
                    { role: "user", content: prompt }
                ],
                model: "llama-3.3-70b-versatile",
                max_tokens: 300,
                temperature: 0.3
            });

            return response.choices[0]?.message?.content || "";

        } catch (error: any) {
            console.error(`[AI Service] Analysis Error: ${error.message}`);
            if (error.message?.includes('401')) {
                return "Error: Missing or Invalid GROQ_API_KEY.";
            }
            return "Error: AI could not analyze the chat.";
        }
    }
}
