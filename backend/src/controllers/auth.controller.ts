import { IAuthController } from './interfaces/IAuthController';
import { Request, Response } from 'express';

export class AuthController implements IAuthController {
    private authService: any;

    constructor(authService: any) {
        this.authService = authService;
    }

    async googleLogin(req: Request, res: Response): Promise<void> {
        res.json({ message: 'Google Auth handler coming soon' });
    }

    async logout(req: Request, res: Response): Promise<void> {
        res.json({ message: 'Logout successful' });
    }

    async getMe(req: Request, res: Response): Promise<void> {
        res.json({ user: null, message: 'Authenticated user info' });
    }
}
