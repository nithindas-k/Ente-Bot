import { IPersonalityService } from './interfaces/IPersonalityService';

export class PersonalityService implements IPersonalityService {
    private personalityRepo: any; // Type once injected
    private aiService: any;       // Type once injected

    constructor(personalityRepo: any, aiService: any) {
        this.personalityRepo = personalityRepo;
        this.aiService = aiService;
    }

    async getPersonality(contactId: string): Promise<any> {
        return await this.personalityRepo.findByContactId(contactId);
    }

    async trainPersonality(contactId: string, rawChat: string): Promise<any> {
        const systemPrompt = await this.aiService.analyzePersonality(rawChat);
        return await this.personalityRepo.create({ contactId, systemPrompt, rawChatSample: rawChat });
    }

    async updatePersonality(contactId: string, data: any): Promise<any> {
        const personality = await this.getPersonality(contactId);
        if (!personality) return null;
        return await this.personalityRepo.update(personality._id, data);
    }
}
