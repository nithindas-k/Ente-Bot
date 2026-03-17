import { IAuthService } from './interfaces/IAuthService';
import jwt from 'jsonwebtoken';

export class AuthService implements IAuthService {
    private userRepo: any; 

    constructor(userRepo: any) {
        this.userRepo = userRepo;
    }

    async verifyGoogleToken(idToken: string): Promise<any> {
       
        return null;
    }

    generateToken(user: any): string {
        return jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    }
}
