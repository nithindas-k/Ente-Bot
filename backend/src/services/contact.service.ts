import { IContactService } from './interfaces/IContactService';

export class ContactService implements IContactService {
    private contactRepo: any; 

    constructor(contactRepo: any) {
        this.contactRepo = contactRepo;
    }

    async createContact(userId: string, data: any): Promise<any> {
        return await this.contactRepo.create({ ...data, userId });
    }

    async getContacts(userId: string): Promise<any[]> {
        return await this.contactRepo.findAll({ userId });
    }

    async updateContact(id: string, data: any): Promise<any> {
        return await this.contactRepo.update(id, data);
    }

    async deleteContact(id: string): Promise<any> {
        return await this.contactRepo.delete(id);
    }
}
