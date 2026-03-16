import { Request, Response } from 'express';

export interface IContactController {
    getContacts(req: Request, res: Response): Promise<void>;
    addContact(req: Request, res: Response): Promise<void>;
    updateContact(req: Request, res: Response): Promise<void>;
    deleteContact(req: Request, res: Response): Promise<void>;
}
