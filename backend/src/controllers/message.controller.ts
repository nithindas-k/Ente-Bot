import { IMessageController } from './interfaces/IMessageController';
import { Request, Response } from 'express';

export class MessageController implements IMessageController {
    private messageService: any;

    constructor(messageService: any) {
        this.messageService = messageService;
    }

    async getChatHistory(req: Request, res: Response): Promise<void> {
        res.json({ history: [], message: 'Message history retrieved successfully' });
    }
}
