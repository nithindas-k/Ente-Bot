import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`[Database] Connected to ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`[Database] Connection Error: ${error.message}`);
        process.exit(1);
    }
};

export { connectDB };
