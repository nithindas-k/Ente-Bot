import { IAIService } from './interfaces/IAIService';
import { ChatGroq } from "@langchain/groq";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, AIMessage, BaseMessage, SystemMessage } from "@langchain/core/messages";
import * as z from "zod";

export class AIService implements IAIService {
    private model: ChatGroq;
    private searchTool: DuckDuckGoSearch;
    private readonly PRIMARY_MODEL = "llama-3.3-70b-versatile";

    constructor(apiKey?: string) {
        const key = apiKey || process.env.GROQ_API_KEY || '';
        this.model = new ChatGroq({
            apiKey: key,
            model: this.PRIMARY_MODEL,
            temperature: 0.85, // Slightly higher for more natural, less robotic variety
        });
        this.searchTool = new DuckDuckGoSearch({ maxResults: 3 });
    }

    public updateApiKey(key: string): void {
        this.model = new ChatGroq({
            apiKey: key,
            model: this.PRIMARY_MODEL,
            temperature: 0.85,
        });
    }

    public getTypingDelayMs(reply: string): number {
        const words = reply.trim().split(/\s+/).length;
        return Math.min(800 + (words * 120), 4000);
    }

    public buildSystemPrompt(personalityPrompt: string, newMessage: string): string {
        return `
You are a very close, casual Malayali best friend chatting on WhatsApp. You are an expert in Kerala culture, viral trends, and Manglish.

CRITICAL INSTRUCTIONS:
1. **UNDERSTAND FIRST**: You MUST use 'search_web' to understand the EXACT meaning, context, or slang in the user's message. Even if it seems simple, search for any hidden Manglish slang or current Keralite context.
2. **THE MESSAGE TO PROCESS**: "${newMessage}"
3. **THINK BEFORE REPLYING**: Use the search results to decode what the user really wants. Are they joking? Is it a reference to a movie? Is it a common Manglish phrase? 
4. **THE REPLY**: Craft a short, natural, and witty reply as a best friend.

LANGUAGE RULES:
- Reply **ONLY** in Manglish (Malayalam written in English letters).
- Use casual slang like "eda", "aliya", "machane", "scene", "polichu", "pinnalla", "kidilam", "vibe", "power aanu".
- Avoid formal language. Don't be too polite. Talk like an equal.
- NEVER use Malayalam script (മലയാളം). Only English letters.
- NEVER mention that you searched for anything. No "Based on my search...".

${personalityPrompt}

Keep it short and punchy. Use emojis only where a real friend would (one or two maximum).
`.trim();
    }

    async generateReply(systemPrompt: string, history: any[], newMessage: string): Promise<string> {
        try {
            const webSearch = tool(
                async ({ query }: { query: string }) => {
                    try {
                        console.log(`[AI] Researching: "${query}"`);
                        const results = await this.searchTool.invoke(query);
                        return results || "No results found. Use your own knowledge of Kerala culture.";
                    } catch {
                        return "Search failed, use your own knowledge.";
                    }
                },
                {
                    name: "search_web",
                    description: "MANDATORY: Use this to understand the exact meaning of user's input, context, or any Manglish slang before crafting a reply.",
                    schema: z.object({
                        query: z.string()
                    }),
                }
            );

            const agent = createReactAgent({
                llm: this.model,
                tools: [webSearch],
                stateModifier: systemPrompt,
            });

            const messages: BaseMessage[] = [
                ...history.slice(-10).map(m =>
                    m.role === 'user'
                        ? new HumanMessage(m.content)
                        : new AIMessage(m.content)
                ),
                new HumanMessage(newMessage),
            ];

            const result = await agent.invoke({ messages });

            const allMessages: BaseMessage[] = result.messages ?? [];
            const lastAI = [...allMessages].reverse().find(m => m._getType() === 'ai');
            const raw = typeof lastAI?.content === 'string' ? lastAI.content : "Eda 😅";

            return this.cleanReply(raw);

        } catch (error: any) {
            console.error('[AI Service] Agent flow failed:', error.message);
            try {
                const res = await this.model.invoke([
                    new SystemMessage(systemPrompt),
                    new HumanMessage(newMessage),
                ]);
                return this.cleanReply(
                    typeof res.content === 'string' ? res.content : "Mm da 👍"
                );
            } catch {
                return "Dei, pinne parayam da 🥺";
            }
        }
    }

    private cleanReply(reply: string): string {
        return reply
            .replace(/<thought>[\s\S]*?<\/thought>/gi, '') // Remove internal thinking
            .replace(/<function[^>]*>[\s\S]*?<\/function>/gi, '')
            .replace(/<function[^>]*\/>/gi, '')
            .replace(/<tool[^>]*>[\s\S]*?<\/tool>/gi, '')
            .replace(/<[^>]+>/g, '') // Remove any other XML-like tags
            .replace(/\{[\s\S]*?"query"[\s\S]*?\}/g, '') // Remove leaked JSON objects
            .replace(/^(assistant|bot|ai|chunk|nithin|system|mallu|malayali|friend):\s*/i, '')
            .replace(/^"|"$/g, '')
            .replace(/\n{3,}/g, '\n')
            .trim();
    }

    async analyzePersonality(rawChat: string): Promise<string> {
        const prompt = `Based on this WhatsApp chat, describe the user's friend's personality in 1 casual sentence starting with "You are...":\n\n${rawChat.slice(-1000)}`;
        const res = await this.model.invoke(prompt);
        return typeof res.content === 'string' ? res.content : "You are a casual friend.";
    }
}