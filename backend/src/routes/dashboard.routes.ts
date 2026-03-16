import { Router } from 'express';
import Contact from '../models/contact.model';

const router = Router();

router.get('/stats', async (req, res) => {
    try {
        // 1. Get Active contacts count
        const activeContacts = await Contact.countDocuments({ botEnabled: true });

        // 2. Total replies today from summing message counts
        const contacts = await Contact.find({});
        const repliesToday = contacts.reduce((acc, c) => acc + (c.dailyMessageCount || 0), 0);

        
        const status = activeContacts > 0 ? "Connected" : "Disconnected";

        res.json({
            status,
            repliesToday,
            activeContacts
        });
    } catch (error: any) {
        res.status(500).json({ status: "Error", message: error.message });
    }
});

export default router;
