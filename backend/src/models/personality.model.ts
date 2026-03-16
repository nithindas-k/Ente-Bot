import mongoose, { Document, Schema } from 'mongoose';

export interface IPersonality extends Document {
    contactId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    systemPrompt: string;
    phrases: string[];
    emojiStyle: string;
    replyLength: number; // max tokens
    rawChatSample?: string;
    trainedAt: Date;
}

const PersonalitySchema = new Schema<IPersonality>({
    contactId: { type: Schema.Types.ObjectId, ref: 'Contact', required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    systemPrompt: { type: String, required: true },
    phrases: [{ type: String }],
    emojiStyle: { type: String, default: 'Casual' },
    replyLength: { type: Number, default: 150 },
    rawChatSample: { type: String },
    trainedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<IPersonality>('Personality', PersonalitySchema);
