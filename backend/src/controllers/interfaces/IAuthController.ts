import { Request, Response } from 'express';

export interface IAuthController {
    googleLogin(req: Request, res: Response): Promise<void>;
    logout(req: Request, res: Response): Promise<void>;
    getMe(req: Request, res: Response): Promise<void>;
}
