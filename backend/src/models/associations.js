// src/models/associations.js

import User from './postgres/User.js';
import ProfilePicture from './postgres/ProfilePicture.js';

// --- Establish Associations ---

// User (1) <---> ProfilePicture (1)
User.hasOne(ProfilePicture, {
    foreignKey: 'user_id',
    as: 'profilePicture',
    onDelete: 'CASCADE', // Optional: Ensure pictures are deleted with the user
});

ProfilePicture.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
});

// You can export the models, the sequelize instance, or nothing, depending on your setup
export { User, ProfilePicture };