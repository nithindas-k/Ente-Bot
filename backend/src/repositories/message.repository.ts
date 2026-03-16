import { BaseRepository } from './base.repository';
import { IMessageRepository } from './interfaces/IMessageRepository';
import Message, { IMessage } from '../models/message.model';
import mongoose from 'mongoose';

export class MessageRepository extends BaseRepository<IMessage> implements IMessageRepository {
    constructor() {
        super(Message);
    }

    async getLastTen(contactId: mongoose.Types.ObjectId): Promise<IMessage[]> {
        return await this.model.find({ contactId })
            .sort({ createdAt: -1 })
            .limit(10);
    }
}
