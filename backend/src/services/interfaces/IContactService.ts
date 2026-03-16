export interface IContactService {
    createContact(userId: string, data: any): Promise<any>;
    getContacts(userId: string): Promise<any[]>;
    updateContact(id: string, data: any): Promise<any>;
    deleteContact(id: string): Promise<any>;
}
