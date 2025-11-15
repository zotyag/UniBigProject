// src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config/config.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import documentRoutes from './routes/document.routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
const app = express();
// Security middleware
app.use(helmet());
app.use(cors({
    origin: config.CORS_ORIGIN,
    credentials: true
}));
// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Logging
if (config.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/documents', documentRoutes);
// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'CV Generator API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/v1/auth',
            users: '/api/v1/users',
            documents: '/api/v1/documents'
        }
    });
});
// Error handling
app.use(notFound);
app.use(errorHandler);
export default app;
// server.js
import app from './src/app.js';
import config from './src/config/config.js';
import { connectPostgres } from './src/config/database.js';
import { connectMongoDB } from './src/config/mongodb.js';
const startServer = async () => {
    try {
        // Connect to databases
        await connectPostgres();
        await connectMongoDB();
        // Start server
        const PORT = config.PORT;
        app.listen(PORT, () => {
            console.log(`\n Server running on port ${PORT}`);
            console.log(` Environment: ${config.NODE_ENV}`);
            console.log(` API: http://localhost:${PORT}/api/v1`);
            console.log(`❤ Health: http://localhost:${PORT}/health\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});
startServer();