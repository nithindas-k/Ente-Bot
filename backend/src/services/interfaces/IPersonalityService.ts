export interface IPersonalityService {
    getPersonality(contactId: string): Promise<any>;
    trainPersonality(contactId: string, rawChat: string): Promise<any>;
    updatePersonality(contactId: string, data: any): Promise<any>;
}
