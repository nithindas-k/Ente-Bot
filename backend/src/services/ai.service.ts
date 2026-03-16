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
        // Truncate to avoid context window limits (last 10k chars is plenty for style)
        const truncatedChat = rawChat.length > 10000 ? rawChat.substring(rawChat.length - 10000) : rawChat;
        
        const prompt = `Analyze this WhatsApp chat history to learn a person's unique speaking style. 
        
        CRITICAL INSTRUCTIONS:
        1. IGNORE metadata like dates, times, and sender names (e.g., "4/11/25, 7:30 in the evening - Nithin:").
        2. FOCUS on the content: vocabulary, slang (e.g., 'mone', 'da', 'athe'), sentence length, and emoji habits.
        3. OBSERVE the mix of languages (e.g., Manglish/Malayalam-English mix).
        4. Capture the VIBE: Is it helpful, casual, focused on coding/study, or energetic?

        Generate a concise "System Prompt" (under 150 words) that instructs an AI how to act like this person. Use second-person "You are..." format:\n\n${truncatedChat}`;
        
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
            if (error.message?.includes('401')) {
                return "Error: Missing or Invalid GROQ_API_KEY. Please add your key to the .env file.";
            }
            return "Error: AI could not analyze the chat. The file might be too large or the API is unavailable.";
        }
    }
}
