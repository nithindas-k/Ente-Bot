import { IMessageService } from './interfaces/IMessageService';

export class MessageService implements IMessageService {
    private messageRepo: any; 

    constructor(messageRepo: any) {
        this.messageRepo = messageRepo;
    }

    async getChatHistory(contactId: string): Promise<any[]> {
        return await this.messageRepo.getLastTen(contactId);
    }

    async saveMessage(contactId: string, role: 'user' | 'bot', content: string): Promise<any> {
        return await this.messageRepo.create({ contactId, role, content, userId: null });
    }
}
