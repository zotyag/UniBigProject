// src/config/database.js
import { Sequelize } from 'sequelize';
import config from './config.js';
const sequelize = new Sequelize(
    config.POSTGRES.database,
    config.POSTGRES.username,
    config.POSTGRES.password,
    {
        host: config.POSTGRES.host,
        port: config.POSTGRES.port,
        dialect: config.POSTGRES.dialect,
        logging: config.POSTGRES.logging,
        pool: config.POSTGRES.pool,
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true
        }
    }
);
export const connectPostgres = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ PostgreSQL connected successfully');
        // Sync models
        await sequelize.sync({ alter: config.NODE_ENV === 'development' });
        console.log('✅ Database synchronized');
    } catch (error) {
        console.error('❌ PostgreSQL connection error:', error);
        process.exit(1);
    }
};
export default sequelize;