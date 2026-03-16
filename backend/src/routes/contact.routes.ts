import { Router } from 'express';
import Contact from '../models/contact.model';

const router = Router();


router.get('/', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json({ contacts });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/:id/toggle', async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) return res.status(404).json({ message: 'Contact not found' });

        contact.botEnabled = !contact.botEnabled;
        await contact.save();

        res.json({ message: 'Status updated', contact });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});


router.post('/', async (req, res) => {
    try {
        const { name, phoneNumber } = req.body;
        const contact = new Contact({ name, phoneNumber, botEnabled: true });
        await contact.save();
        res.json({ message: 'Contact created', contact });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
