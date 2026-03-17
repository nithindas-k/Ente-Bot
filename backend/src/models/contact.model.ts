import mongoose, { Document, Schema } from 'mongoose';

export interface IContact extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    phoneNumber: string; // E.164 format
    relationship?: string;
    language: string;
    botEnabled: boolean;
    dailyMessageCount: number;
    lastMessageTime?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ContactSchema = new Schema<IContact>({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    relationship: { type: String },
    language: { type: String, default: 'English' },
    botEnabled: { type: Boolean, default: false },
    dailyMessageCount: { type: Number, default: 0 },
    lastMessageTime: { type: Date }
}, { timestamps: true });


ContactSchema.index({ userId: 1, phoneNumber: 1 }, { unique: true });

export default mongoose.model<IContact>('Contact', ContactSchema);
