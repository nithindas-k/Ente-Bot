import { IAIService } from './interfaces/IAIService';
import groq from '../config/groq.config';

export class AIService implements IAIService {
    async generateReply(systemPrompt: string, history: any[], newMessage: string): Promise<string> {
        const formattedHistory = history.map(msg => ({
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
                max_tokens: 150
            });

            return response.choices[0]?.message?.content || "No response generated";
        } catch (error: any) {
            console.error(`[AI Service] Error: ${error.message}`);
            return "Error generating AI response";
        }
    }

    async analyzePersonality(rawChat: string): Promise<string> {
        const prompt = `Analyze this chat sample representation of a person's speaking style. Generate a concise set of system instructions (prompt) for an AI to mimic this style exactly. Keep it casual and brief:\n\n${rawChat}`;
        
        try {
            const response = await (groq as any).chat.completions.create({
                messages: [
                    { role: "system", content: "You are an expert personality analyzer and prompt engineer." },
                    { role: "user", content: prompt }
                ],
                model: "llama-3.3-70b-versatile"
            });

            return response.choices[0]?.message?.content || "";
        } catch (error: any) {
            console.error(`[AI Service] Analysis Error: ${error.message}`);
            return "Error analyzing personality";
        }
    }
}
