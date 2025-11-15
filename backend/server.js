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