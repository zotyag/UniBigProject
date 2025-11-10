// src/models/postgres/DocumentIndex.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database.js';
import User from './User.js';
class DocumentIndex extends Model { }
DocumentIndex.init(
    {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        doc_type: {
            type: DataTypes.ENUM('cv', 'cover_letter'),
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        slug: {
            type: DataTypes.STRING(120),
            allowNull: false
        },
        mongo_document_id: {
            type: DataTypes.STRING(32),
            allowNull: false,
            comment: 'MongoDB ObjectId as hex'
        },
        current_version: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        sequelize,
        modelName: 'DocumentIndex',
        tableName: 'document_index',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'slug']
            },
            {
                fields: ['user_id']
            },
            {
                fields: ['doc_type']
            },
            {
                fields: ['updated_at']
            }
        ]
    }
);
// Associations
User.hasMany(DocumentIndex, { foreignKey: 'user_id', as: 'documents' });
DocumentIndex.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
export default DocumentIndex;