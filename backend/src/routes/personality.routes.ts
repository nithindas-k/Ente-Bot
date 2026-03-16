import { Router } from 'express';
import Personality from '../models/personality.model';
import { AIService } from '../services/ai.service';
import mongoose from 'mongoose';

export const createPersonalityRouter = (aiService: AIService) => {
    const router = Router();

    // GET prompt for a contact
    router.get('/:contactId', async (req, res) => {
        try {
            const personality = await Personality.findOne({ contactId: req.params.contactId });
            res.json({ personality });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    });

    // POST train personality
    router.post('/:contactId/train', async (req, res) => {
        try {
            const { rawChat } = req.body;
            if (!rawChat) return res.status(400).json({ message: "Chat sample required" });

            const trainedPrompt = await aiService.analyzePersonality(rawChat);

            let personality = await Personality.findOne({ contactId: req.params.contactId });
            
            if (personality) {
                personality.systemPrompt = trainedPrompt;
                personality.rawChatSample = rawChat;
                personality.trainedAt = new Date();
                await personality.save();
            } else {
                personality = new Personality({
                    contactId: new mongoose.Types.ObjectId(req.params.contactId),
                    userId: new mongoose.Types.ObjectId(), // Placeholder
                    systemPrompt: trainedPrompt,
                    rawChatSample: rawChat
                });
                await personality.save();
            }

            res.json({ message: "Training successful", personality });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    });

    // PUT manual update
    router.put('/:contactId', async (req, res) => {
        try {
            const { systemPrompt } = req.body;
            const personality = await Personality.findOneAndUpdate(
                { contactId: req.params.contactId },
                { systemPrompt },
                { upsert: true, new: true }
            );
            res.json({ message: "Instructions updated", personality });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    });

    return router;
};
