import { Router } from 'express';

const router = Router();

router.post('/google', (req, res) => {
    res.json({ message: 'Google Auth Login Endpoint' });
});

router.post('/logout', (req, res) => {
    res.json({ message: 'Logout' });
});

router.get('/me', (req, res) => {
    res.json({ user: null });
});

export default router;
