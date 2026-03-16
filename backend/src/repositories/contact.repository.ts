import { BaseRepository } from './base.repository';
import { IContactRepository } from './interfaces/IContactRepository';
import Contact, { IContact } from '../models/contact.model';
import mongoose from 'mongoose';

export class ContactRepository extends BaseRepository<IContact> implements IContactRepository {
    constructor() {
        super(Contact);
    }

    async findByPhone(userId: mongoose.Types.ObjectId | null, phoneNumber: string): Promise<IContact | null> {
        const query = userId ? { userId, phoneNumber } : { phoneNumber };
        return await this.model.findOne(query);
    }
}
