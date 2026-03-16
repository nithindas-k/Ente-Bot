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
import authRoutes from './routes/auth.routes';
import contactRoutes from './routes/contact.routes';
import personalityRoutes from './routes/personality.routes';
import messageRoutes from './routes/message.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/personalities', personalityRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/health', (req: any, res: any) => {
    res.json({ status: 'ok', message: 'Ente Bot Backend Running' });
});

// Connect DB first
connectDB().then(() => {
    // Initialize Bot Services
    const contactRepo = new ContactRepository();
    const personalityRepo = new PersonalityRepository();
    const antiSpamService = new AntiSpamService(contactRepo);
    const aiService = new AIService();
    const whatsappService = new WhatsappService(antiSpamService, aiService, contactRepo, personalityRepo);

    whatsappService.initialize();

    // Serve QR Live string for Frontend Polling
    app.get('/api/auth/qr', (req, res) => {
        res.json({ qr: whatsappService.getLatestQr() });
    });

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
