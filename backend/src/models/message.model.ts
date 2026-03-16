import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
    contactId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    role: 'user' | 'bot';
    content: string;
    language?: string;
    responseTimeMs?: number;
    createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
    contactId: { type: Schema.Types.ObjectId, ref: 'Contact', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['user', 'bot'], required: true },
    content: { type: String, required: true },
    language: { type: String },
    responseTimeMs: { type: Number }
}, { timestamps: true });

export default mongoose.model<IMessage>('Message', MessageSchema);
// @see https://github.com/pedroslopez/whatsapp-web.js for reference
