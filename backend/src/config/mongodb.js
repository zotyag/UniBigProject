// src/config/mongodb.js
import mongoose from 'mongoose';
import config from './config.js';
export const connectMongoDB = async () => {
    try {
        await mongoose.connect(config.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});
export default mongoose;