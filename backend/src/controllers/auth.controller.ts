import { IAuthController } from './interfaces/IAuthController';
import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';
import { UserRepository } from '../repositories/user.repository';

export class AuthController implements IAuthController {
    private authService: any;
    private userRepo: UserRepository;
    private aiService: AIService;

    constructor(authService: any, userRepo: UserRepository, aiService: AIService) {
        this.authService = authService;
        this.userRepo = userRepo;
        this.aiService = aiService;
    }

    async googleLogin(req: Request, res: Response): Promise<void> {
        res.json({ message: 'Google Auth handler coming soon' });
    }

    async logout(req: Request, res: Response): Promise<void> {
        res.json({ message: 'Logout successful' });
    }

    async getMe(req: Request, res: Response): Promise<void> {
        const user = await this.userRepo.findOne({})
        res.json({ user, message: 'Authenticated user info' });
    }

    async saveGroqKey(req: Request, res: Response): Promise<void> {
        const { apiKey } = req.body;
        const trimmedKey = apiKey?.trim();
        
        if (!trimmedKey || trimmedKey.length < 5) {
            res.status(400).json({ message: 'Invalid API Key format' });
            return;
        }

        const user = await this.userRepo.findOne({});
        if (user) {
            await this.userRepo.update(user._id.toString(), { groqApiKey: trimmedKey });
            this.aiService.updateApiKey(trimmedKey);
            res.json({ success: true, message: 'API Key saved and bot activated!' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    }

    async deleteGroqKey(req: Request, res: Response): Promise<void> {
        const user = await this.userRepo.findOne({});
        if (user) {
            await this.userRepo.update(user._id.toString(), { groqApiKey: '' });
            this.aiService.updateApiKey(''); // Fallback to env
            res.json({ success: true, message: 'API Key deleted. Falling back to default.' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    }
}
