export interface IAIService {
    generateReply(systemPrompt: string, history: any[], newMessage: string): Promise<string>;
    analyzePersonality(rawChat: string): Promise<string>;
}
