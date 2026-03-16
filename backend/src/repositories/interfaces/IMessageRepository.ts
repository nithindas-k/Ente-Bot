import { IBaseRepository } from './IBaseRepository';
import { IMessage } from '../../models/message.model';
import mongoose from 'mongoose';

export interface IMessageRepository extends IBaseRepository<IMessage> {
    getLastTen(contactId: mongoose.Types.ObjectId): Promise<IMessage[]>;
}
