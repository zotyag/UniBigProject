// src/models/postgres/ProfilePicture.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database.js';
//import User from './User.js';

class ProfilePicture extends Model {}

ProfilePicture.init(
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		user_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "users",
				key: 'id',
			},
			onDelete: 'CASCADE',
		},
		image_data: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		updated_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		sequelize,
		modelName: 'ProfilePicture',
		tableName: 'profile_pictures',
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
		hooks: {
			beforeUpdate: (picture) => {
				picture.updated_at = new Date();
			},
		},
	},
);

export default ProfilePicture;
