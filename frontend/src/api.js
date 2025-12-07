/**
 * API Kliens a CV Generátorhoz
 * Base URL = http://localhost:3000/api/v1
 */

const getToken = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');
export const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') + '/api/v1';

// --- SEGÉDFÜGGVÉNY: ADAT NORMALIZÁLÓ ---
const normalizeDocumentData = (rawData) => {
	if (!rawData) return null;

	const root = rawData.content_json || rawData.user_data || rawData.content || rawData;

	if (root.personal_info && root.skills && !Array.isArray(root.skills)) {
		return { ...rawData, cvData: root };
	}

	let normalizedSkills = {};
	if (Array.isArray(root.skills)) {
		normalizedSkills = root.skills.reduce((acc, skillCategory) => {
			const categoryKey = skillCategory.category.toLowerCase().replace(/ /g, '_');
			acc[categoryKey] = skillCategory.items;
			return acc;
		}, {});
	} else if (root.skills) {
		normalizedSkills = root.skills;
	}

	const cvData = {
		personal_info: {
			full_name: root.profile?.name || root.personal_info?.full_name || '',
			title: root.profile?.title || root.personal_info?.title || '',
			summary: root.profile?.summary || root.personal_info?.summary || '',
			email: root.contact?.email || root.personal_info?.email || '',
			phone: root.contact?.phone || root.personal_info?.phone || '',
			location: root.contact?.location || root.personal_info?.location || '',
			linkedin: root.contact?.linkedin || root.personal_info?.linkedin || '',
			website: root.contact?.website || root.personal_info?.website || '',
		},
		summary: root.summary || root.profile?.summary || '',

		experience: (root.experience || []).map((exp) => ({
			company: exp.company,
			title: exp.position || exp.title,
			start_date: exp.startDate || exp.start_date,
			end_date: exp.endDate || exp.end_date,
			description: exp.description || '',
			description_bullets: exp.description_bullets || [],
		})),

		education: (root.education || []).map((edu) => ({
			institution: edu.institution,
			degree: edu.degree,
			field_of_study: edu.field || edu.field_of_study,
			graduation_date: edu.endDate || edu.graduation_date || edu.startDate,
			description: edu.description,
		})),

		skills: normalizedSkills,

		key_projects_achievements: root.key_projects_achievements || [],
		awards_and_recognitions: root.awards_and_recognitions || [],
	};

	return { ...rawData, cvData };
};

// --- FETCH WRAPPER  ---
const apiFetch = async (endpoint, options = {}) => {
	const token = getToken();
	const headers = {
		'Content-Type': 'application/json',
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		...options.headers,
	};

	let response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

	// if (response.status === 401) {
	// 	console.warn('Lejárt token...');
	// 	localStorage.removeItem('access_token');
	// 	throw new Error('Nincs bejelentkezve.');
	// }

	if (response.status === 401) {
		const refreshToken = getRefreshToken();

		if (refreshToken) {
			console.log('Access Token lejárt. Frissítés megkísérlése...');

			try {
				const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ refresh_token: refreshToken }),
				});

				if (refreshResponse.ok) {
					const data = await refreshResponse.json();

					localStorage.setItem('access_token', data.access_token);

					if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);

					console.log('Token sikeresen frissítve! Kérés ismétlése...');

					// Kérés megismétlése az ÚJ tokennel
					const newHeaders = {
						...headers,
						Authorization: `Bearer ${data.access_token}`,
					};

					response = await fetch(`${BASE_URL}${endpoint}`, {
						...options,
						headers: newHeaders,
					});
				} else {
					throw new Error('Refresh token lejárt');
				}
			} catch (error) {
				// Refresh hiba -> Kijelentkeztetés
				console.warn('Sikertelen token frissítés. Kijelentkeztetés...');
				localStorage.removeItem('access_token');
				localStorage.removeItem('refresh_token');
				window.location.href = '/login';
				throw new Error('Munkamenet lejárt. Kérjük, jelentkezzen be újra.');
			}
		} else {
			// Nincs refresh token -> Kijelentkeztetés
			localStorage.removeItem('access_token');
			throw new Error('Nincs bejelentkezve.');
		}
	}

	if (response.status === 204) return null;

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.error || errorData.message || 'Hiba');
	}

	return response.json();
};

// --- USER ENDPOINTS ---
export const fetchUserProfile = async () => apiFetch('/users/me');
export const updateUserProfile = async (data) =>
	apiFetch('/users/me', { method: 'PUT', body: JSON.stringify(data) });

export const changeUserPassword = async (data) => {
	return apiFetch('/users/me/password', {
		method: 'PUT',
		body: JSON.stringify(data),
	});
};

// --- GEMINI API KEY ENDPOINTS ---

export const setGeminiApiKey = async (apiKey) => {
	return apiFetch('/users/me/gemini-api-key', {
		method: 'POST',
		body: JSON.stringify({ api_key: apiKey }),
	});
};
export const deleteGeminiApiKey = async () =>
	apiFetch('/users/me/gemini-api-key', { method: 'DELETE' });

// --- AUTH ---
export const loginUser = async (creds) =>
	apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(creds) });
export const registerUser = async (data) =>
	apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) });

// --- DOCUMENT ENDPOINTS ---
export const fetchDocuments = async (type = null) => {
	const query = type ? `?doc_type=${type}` : '';
	return apiFetch(`/documents${query}`);
};

export const deleteDocument = async (id) => apiFetch(`/documents/${id}`, { method: 'DELETE' });

export const fetchDocumentById = async (id) => {
	const rawDoc = await apiFetch(`/documents/${id}`);
	return normalizeDocumentData(rawDoc);
};

export const createDocument = async ({ title, cvData }) => {
	return apiFetch('/documents', {
		method: 'POST',
		body: JSON.stringify({
			doc_type: 'cv',
			title: title,
			template_code: 'default',
			user_data: cvData,
		}),
	});
};

export const updateDocument = async ({ id, title, cvData }) => {
	return apiFetch(`/documents/${id}`, {
		method: 'PUT',
		body: JSON.stringify({
			title: title,
			content_json: cvData,
			user_data: cvData,
		}),
	});
};

// --- AI CHAT ---
export const startChatSession = async (initialMessage) => {
	return apiFetch('/chat/start', {
		method: 'POST',
		body: JSON.stringify({ initial_message: initialMessage, doc_type: 'cv' }),
	});
};
export const sendChatMessage = async ({ sessionId, message }) => {
	return apiFetch('/chat/message', {
		method: 'POST',
		body: JSON.stringify({ session_id: sessionId, message }),
	});
};
export const finalizeChatSession = async ({ sessionId, title }) => {
	return apiFetch(`/chat/session/${sessionId}/finalize`, {
		method: 'POST',
		body: JSON.stringify({ title: title || 'AI CV', template_code: 'default' }),
	});
};

// --- PROFILE PICTURE ENDPOINTS ---

export const getProfilePicture = async () => {
	return apiFetch('/users/me/profile-picture');
};

export const setProfilePicture = async (base64Image) => {
	return apiFetch('/users/me/profile-picture', {
		method: 'POST',
		body: JSON.stringify({ image_data: base64Image }),
	});
};

export const deleteProfilePicture = async () => {
	return apiFetch('/users/me/profile-picture', { method: 'DELETE' });
};
