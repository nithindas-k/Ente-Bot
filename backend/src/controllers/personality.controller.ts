import { IPersonalityController } from './interfaces/IPersonalityController';
import { Request, Response } from 'express';

export class PersonalityController implements IPersonalityController {
    private personalityService: any;

    constructor(personalityService: any) {
        this.personalityService = personalityService;
    }

    async getPersonality(req: Request, res: Response): Promise<void> {
        res.json({ message: 'Personality retrieved' });
    }

    async trainPersonality(req: Request, res: Response): Promise<void> {
        res.json({ message: 'Personality training started' });
    }

    async updatePersonality(req: Request, res: Response): Promise<void> {
        res.json({ message: 'Personality updated successfully' });
    }
}
