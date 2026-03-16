import { IContactController } from './interfaces/IContactController';
import { Request, Response } from 'express';

export class ContactController implements IContactController {
    private contactService: any;

    constructor(contactService: any) {
        this.contactService = contactService;
    }

    async getContacts(req: Request, res: Response): Promise<void> {
        res.json({ contacts: [], message: 'Contacts retrieved' });
    }

    async addContact(req: Request, res: Response): Promise<void> {
        res.json({ message: 'Contact added successfully' });
    }

    async updateContact(req: Request, res: Response): Promise<void> {
        res.json({ message: 'Contact updated successfully' });
    }

    async deleteContact(req: Request, res: Response): Promise<void> {
        res.json({ message: 'Contact deleted successfully' });
    }
}
