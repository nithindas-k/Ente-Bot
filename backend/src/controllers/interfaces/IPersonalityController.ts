import { Request, Response } from 'express';

export interface IPersonalityController {
    getPersonality(req: Request, res: Response): Promise<void>;
    trainPersonality(req: Request, res: Response): Promise<void>;
    updatePersonality(req: Request, res: Response): Promise<void>;
}
