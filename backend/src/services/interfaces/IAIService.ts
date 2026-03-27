export interface IAIService {
    generateReply(systemPrompt: string, history: any[], newMessage: string): Promise<string>;
    analyzePersonality(rawChat: string): Promise<string>;
    buildSystemPrompt(personalityPrompt: string, newMessage: string): string;
    getTypingDelayMs(reply: string): number;
}
