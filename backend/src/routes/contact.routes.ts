import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.json({ contacts: [], message: 'All contacts retrieved' });
});

router.post('/', (req, res) => {
    res.json({ message: 'Contact created successfully' });
});

router.put('/:id', (req, res) => {
    res.json({ message: 'Contact updated successfully' });
});

router.delete('/:id', (req, res) => {
    res.json({ message: 'Contact deleted successfully' });
});

export default router;
