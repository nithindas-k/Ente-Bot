import { Router } from 'express';

const router = Router();

router.get('/:contactId', (req, res) => {
    res.json({ history: [], message: 'Get chat history' });
});

export default router;
