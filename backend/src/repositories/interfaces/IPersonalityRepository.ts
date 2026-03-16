import { IBaseRepository } from './IBaseRepository';
import { IPersonality } from '../../models/personality.model';
import mongoose from 'mongoose';

export interface IPersonalityRepository extends IBaseRepository<IPersonality> {
    findByContactId(contactId: mongoose.Types.ObjectId): Promise<IPersonality | null>;
}
