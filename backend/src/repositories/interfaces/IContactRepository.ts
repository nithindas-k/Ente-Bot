import { IBaseRepository } from './IBaseRepository';
import { IContact } from '../../models/contact.model';
import mongoose from 'mongoose';

export interface IContactRepository extends IBaseRepository<IContact> {
    findByPhone(userId: mongoose.Types.ObjectId, phoneNumber: string): Promise<IContact | null>;
}
