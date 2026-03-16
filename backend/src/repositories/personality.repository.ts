import { BaseRepository } from './base.repository';
import { IPersonalityRepository } from './interfaces/IPersonalityRepository';
import Personality, { IPersonality } from '../models/personality.model';
import mongoose from 'mongoose';

export class PersonalityRepository extends BaseRepository<IPersonality> implements IPersonalityRepository {
    constructor() {
        super(Personality);
    }

    async findByContactId(contactId: mongoose.Types.ObjectId): Promise<IPersonality | null> {
        return await this.model.findOne({ contactId });
    }
}
