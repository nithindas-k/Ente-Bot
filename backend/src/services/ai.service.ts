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
            temperature: 0.8,
        });
        this.searchTool = new DuckDuckGoSearch({ maxResults: 3 });
    }

    public updateApiKey(key: string): void {
        this.model = new ChatGroq({
            apiKey: key,
            model: this.PRIMARY_MODEL,
            temperature: 0.8,
        });
    }

    public getTypingDelayMs(reply: string): number {
        const words = reply.trim().split(/\s+/).length;
        return Math.min(800 + (words * 120), 4000);
    }

    public buildSystemPrompt(personalityPrompt: string, newMessage: string): string {
        return `
You are a close Malayali best friend chatting on WhatsApp. Reply ONLY in Manglish (Malayalam + English mix).
${personalityPrompt}

For every message:
1. Use search_web to understand what the user said and get context.
2. Reply naturally like a close friend would — short, casual, funny, with emojis.
3. Never explain what you searched. Never translate. Just react and reply.
`.trim();
    }

    async generateReply(systemPrompt: string, history: any[], newMessage: string): Promise<string> {
        try {
            const webSearch = tool(
                async ({ query }: { query: string }) => {
                    try {
                        const results = await this.searchTool.invoke(query);
                        return results || "No results found.";
                    } catch {
                        return "Search failed, use your own knowledge.";
                    }
                },
                {
                    name: "search_web",
                    description: "Search to understand the user's message — slang, context, news, anything. Use the result to craft a natural Manglish reply. Never show search results to the user.",
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
            .replace(/<function[^>]*>[\s\S]*?<\/function>/gi, '')
            .replace(/<function[^>]*\/>/gi, '')
            .replace(/<tool[^>]*>[\s\S]*?<\/tool>/gi, '')
            .replace(/<[^>]+>/g, '')
            .replace(/\{[\s\S]*?"query"[\s\S]*?\}/g, '')
            .replace(/^(assistant|bot|ai|chunk|nithin):\s*/i, '')
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