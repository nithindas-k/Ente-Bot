export interface IMessageService {
    getChatHistory(contactId: string): Promise<any[]>;
    saveMessage(contactId: string, role: 'user' | 'bot', content: string): Promise<any>;
}
