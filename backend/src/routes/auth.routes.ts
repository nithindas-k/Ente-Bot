import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

export const createAuthRouter = (authController: AuthController) => {
    const router = Router();

    router.post('/google', (req, res) => authController.googleLogin(req, res));
    router.post('/logout', (req, res) => authController.logout(req, res));
    router.get('/me', (req, res) => authController.getMe(req, res));
    
    // Groq API Key Management
    router.put('/groq-key', (req, res) => authController.saveGroqKey(req, res));
    router.delete('/groq-key', (req, res) => authController.deleteGroqKey(req, res));

    return router;
};
