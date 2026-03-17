import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';


dotenv.config();

import { connectDB } from './config/database.config';


import { ContactRepository } from './repositories/contact.repository';
import { PersonalityRepository } from './repositories/personality.repository';
import { AntiSpamService } from './services/anti-spam.service';
import { AIService } from './services/ai.service';
import { WhatsappService } from './services/whatsapp.service';

// Import Routes
import { createAuthRouter } from './routes/auth.routes';
import contactRoutes from './routes/contact.routes';
import { createPersonalityRouter } from './routes/personality.routes';
import messageRoutes from './routes/message.routes';
import { createDashboardRouter } from './routes/dashboard.routes';
import { AuthController } from './controllers/auth.controller';
import { UserRepository } from './repositories/user.repository';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes are set up inside connectDB block to ensure dependencies are ready
app.get('/health', (req: any, res: any) => {
    res.json({ status: 'ok', message: 'Ente Bot Backend Running' });
});

// Connect DB first
connectDB().then(async () => {
    // Initialize Bot Services
    const contactRepo = new ContactRepository();
    const personalityRepo = new PersonalityRepository();
    const userRepo = new UserRepository();
    const antiSpamService = new AntiSpamService(contactRepo);
    const aiService = new AIService();
    
    // Check for saved Groq API key in DB
    let user = await userRepo.findOne({});
    if (!user) {
        console.log('[Server] Creating default system user...');
        user = await userRepo.create({
            googleId: 'default-user',
            email: 'user@example.com',
            name: 'Ente Bot User'
        });
    }

    if (user?.groqApiKey) {
        console.log('[AI] Found saved Groq API key in database. activating...');
        aiService.updateApiKey(user.groqApiKey);
    }

    const whatsappService = new WhatsappService(antiSpamService, aiService, contactRepo, personalityRepo);

    whatsappService.initialize();

    // Controllers
    const authController = new AuthController(null, userRepo, aiService);

    // Routes
    app.use('/api/auth', createAuthRouter(authController));
    app.use('/api/contacts', contactRoutes);
    app.use('/api/messages', messageRoutes);
    
    // Serve QR Live string for Frontend Polling
    app.get('/api/auth/qr', (req, res) => {
        res.json({ qr: whatsappService.getLatestQr() });
    });

    // Serve connection status
    app.get('/api/auth/status', (req, res) => {
        res.json({ 
            status: whatsappService.getStatus(),
            account: whatsappService.getAccountInfo()
        });
    });

    // WhatsApp Logout
    app.post('/api/auth/whatsapp/logout', async (req, res) => {
        await whatsappService.logout();
        res.json({ success: true, message: "Logged out from WhatsApp." });
    });

    // WhatsApp Refresh QR
    app.post('/api/auth/whatsapp/refresh', async (req, res) => {
        await whatsappService.refreshQr();
        res.json({ success: true, message: "Refreshing QR code." });
    });

    
    app.use('/api/dashboard', createDashboardRouter(whatsappService));
    app.use('/api/personalities', createPersonalityRouter(aiService));

    const server = app.listen(PORT, () => {
        console.log(`[Server] running on port ${PORT}`);
    });

    // Graceful shutdown — destroy WhatsApp/Chrome before nodemon kills node
    const shutdown = async () => {
        console.log('[Server] Shutting down gracefully...');
        await whatsappService.destroy();
        server.close(() => process.exit(0));
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
});

export default app;
