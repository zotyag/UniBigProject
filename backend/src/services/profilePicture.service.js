// src/services/profilePicture.service.js
import { ProfilePicture } from '../models/postgres/index.js';

export class ProfilePictureService {
	static async getProfilePicture(userId) {
		return await ProfilePicture.findOne({
			where: { user_id: userId },
		});
	}

	static async setProfilePicture(userId, imageData) {
		const [picture, created] = await ProfilePicture.findOrCreate({
			where: { user_id: userId },
			defaults: { image_data: imageData },
		});

		if (!created) {
			picture.image_data = imageData;
			await picture.save();
		}

		return picture;
	}

	static async deleteProfilePicture(userId) {
		const picture = await ProfilePicture.findOne({
			where: { user_id: userId },
		});

		if (picture) {
			await picture.destroy();
		}
	}
}
