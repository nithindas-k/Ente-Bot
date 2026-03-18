import { Router } from 'express';
import Contact from '../models/contact.model';
import { WhatsappService } from '../services/whatsapp.service';

export const createDashboardRouter = (whatsappService: WhatsappService) => {
    const router = Router();

    router.get('/stats', async (req, res) => {
        try {
          
            const activeContacts = await Contact.countDocuments({ botEnabled: true });

            const contacts = await Contact.find({});
            const repliesToday = contacts.reduce((acc, c) => acc + (c.dailyMessageCount || 0), 0);

            const sessionId = (req.query.sessionId as string) || 'default';
            const { status: rawStatus } = whatsappService.getSessionStatus(sessionId);
            const status = rawStatus === 'connected' ? "Connected" : "Disconnected";

            res.json({
                status,
                repliesToday,
                activeContacts
            });
        } catch (error: any) {
            res.status(500).json({ status: "Error", message: error.message });
        }
    });

    return router;
};
