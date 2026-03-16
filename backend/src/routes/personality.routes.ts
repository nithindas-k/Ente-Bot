import { Router } from 'express';

const router = Router();

router.get('/:contactId', (req, res) => {
    res.json({ message: 'Get personality prompt' });
});

router.post('/:contactId/train', (req, res) => {
    res.json({ message: 'Train personality style from chat' });
});

router.put('/:contactId', (req, res) => {
    res.json({ message: 'Update manual instructions' });
});

export default router;
