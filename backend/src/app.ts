import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

import { connectDB } from './config/database.config';
import { ContactRepository } from './repositories/contact.repository';
import { PersonalityRepository } from './repositories/personality.repository';
import { AntiSpamService } from './services/anti-spam.service';
import { AIService } from './services/ai.service';
import { MessageRepository } from './repositories/message.repository';
import { WhatsappService } from './services/whatsapp.service';
import { createAuthRouter } from './routes/auth.routes';
import contactRoutes from './routes/contact.routes';
import { createPersonalityRouter } from './routes/personality.routes';
import messageRoutes from './routes/message.routes';
import { createDashboardRouter } from './routes/dashboard.routes';
import { AuthController } from './controllers/auth.controller';
import { UserRepository } from './repositories/user.repository';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/health', (req: any, res: any) => {
    res.json({ status: 'ok', message: 'Ente Bot Backend Running' });
});

connectDB().then(async () => {
    const contactRepo = new ContactRepository();
    const personalityRepo = new PersonalityRepository();
    const userRepo = new UserRepository();
    const messageRepo = new MessageRepository();
    const antiSpamService = new AntiSpamService(contactRepo);
    const aiService = new AIService();
    
    let user = await userRepo.findOne({});
    if (!user) {
        user = await userRepo.create({
            googleId: 'default-user',
            email: 'user@example.com',
            name: 'Ente Bot User'
        });
    }

    if (user?.groqApiKey) {
        aiService.updateApiKey(user.groqApiKey);
    }

    const whatsappService = new WhatsappService(antiSpamService, aiService, contactRepo, personalityRepo, messageRepo);
    whatsappService.initialize();

    // Socket.io integration
    io.on('connection', (socket) => {
        console.log('[Socket] New client connected');
        
        socket.on('join-session', (sessionId) => {
            console.log(`[Socket] Client joining session: ${sessionId}`);
            socket.join(`session:${sessionId}`);
            
            // Send current status immediately
            const status = whatsappService.getSessionStatus(sessionId);
            socket.emit('status-update', status);
        });

        socket.on('disconnect', () => {
            console.log('[Socket] Client disconnected');
        });
    });

    // Listen to WhatsApp events and broadcast via Socket.io
    whatsappService.on('qr', ({ sessionId, qr }) => {
        io.to(`session:${sessionId}`).emit('qr-update', { qr });
    });

    whatsappService.on('authenticated', ({ sessionId }) => {
        const stats = whatsappService.getSessionStatus(sessionId);
        io.to(`session:${sessionId}`).emit('status-update', { ...stats, status: 'authenticated' });
    });

    whatsappService.on('auth_failure', ({ sessionId, msg }) => {
        io.to(`session:${sessionId}`).emit('auth_error', { message: msg });
    });

    whatsappService.on('ready', ({ sessionId }) => {
        const status = whatsappService.getSessionStatus(sessionId);
        io.to(`session:${sessionId}`).emit('status-update', status);
    });

    whatsappService.on('disconnected', ({ sessionId }) => {
        const status = whatsappService.getSessionStatus(sessionId);
        io.to(`session:${sessionId}`).emit('status-update', status);
    });

    whatsappService.on('sync-update', (data) => {
        const { sessionId, ...rest } = data;
        io.to(`session:${sessionId}`).emit('sync-update', rest);
    });

    const authController = new AuthController(null, userRepo, aiService);
    app.use('/api/auth', createAuthRouter(authController));
    
    app.get('/api/contacts/dp/:phone', async (req, res) => {
        const dpUrl = await whatsappService.getProfilePicUrl(req.params.phone);
        res.json({ url: dpUrl });
    });
    
    app.use('/api/contacts', contactRoutes);
    app.use('/api/messages', messageRoutes);
    
    app.get('/api/auth/qr', async (req, res) => {
        const sessionId = (req.query.sessionId as string) || 'default';
        const session = await whatsappService.getOrInitSession(sessionId);
        res.json({ qr: session.lastQr });
    });

    app.get('/api/auth/status', (req, res) => {
        const sessionId = (req.query.sessionId as string) || 'default';
        res.json(whatsappService.getSessionStatus(sessionId));
    });

    app.post('/api/auth/whatsapp/logout', async (req, res) => {
        const sessionId = (req.body.sessionId as string) || 'default';
        await whatsappService.logout(sessionId);
        res.json({ success: true, message: "Logged out from WhatsApp." });
    });

    app.post('/api/auth/whatsapp/refresh', async (req, res) => {
        const sessionId = (req.body.sessionId as string) || 'default';
        await whatsappService.refreshQr(sessionId);
        res.json({ success: true, message: "Refreshing QR code." });
    });
    
    app.post('/api/auth/whatsapp/pairing-code', async (req, res): Promise<any> => {
        const { phone, sessionId = 'default' } = req.body;
        if (!phone) {
            return res.status(400).json({ error: "Phone number is required." });
        }
        try {
            const code = await whatsappService.getPairingCode(sessionId, phone);
            res.json({ success: true, code });
        } catch (err) {
            res.status(500).json({ error: "Failed to generate pairing code." });
        }
    });

    app.post('/api/contacts/sync', async (req, res) => {
        const { sessionId = 'default' } = req.body;
        try {
     
            whatsappService.syncContacts(sessionId);
            res.json({ success: true, message: "Contact synchronization started." });
        } catch (err) {
            res.status(500).json({ error: "Failed to start sync." });
        }
    });

    app.use('/api/dashboard', createDashboardRouter(whatsappService));
    app.use('/api/personalities', createPersonalityRouter(aiService));

    const server = httpServer.listen(PORT, () => {
        console.log(`[Server] running on port ${PORT}`);
    });

    const shutdown = async () => {
        console.log('[Server] Shutting down gracefully...');
        // Should destroy all sessions
        server.close(() => process.exit(0));
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
});

export default app;
