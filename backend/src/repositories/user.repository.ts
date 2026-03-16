import { BaseRepository } from './base.repository';
import { IUserRepository } from './interfaces/IUserRepository';
import User, { IUser } from '../models/user.model';

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
    constructor() {
        super(User);
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return await this.model.findOne({ email });
    }
}
