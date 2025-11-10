// src/models/postgres/User.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database.js';
import bcrypt from 'bcryptjs';
class User extends Model {
    async comparePassword(password) {
        return await bcrypt.compare(password, this.password_hash);
    }
}
User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING(320),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        username: {
            type: DataTypes.STRING(64),
            allowNull: false,
            unique: true,
            validate: {
                len: [3, 64]
            }
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('user', 'admin'),
            allowNull: false,
            defaultValue: 'user'
        },
        gemini_api_key_encrypted: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: false,
        hooks: {
            beforeCreate: async (user) => {
                if (user.password_hash) {
                    const salt = await bcrypt.genSalt(10);
                    user.password_hash = await bcrypt.hash(user.password_hash, salt);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password_hash')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password_hash = await bcrypt.hash(user.password_hash, salt);
                }
            }
        }
    }
);
export default User;

