/**
 * API Kliens a CV Generátorhoz
 * Dokumentáció alapján: Base URL = http://localhost:3000/api/v1
 */

const getToken = () => localStorage.getItem('access_token');
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') + '/api/v1';

// --- SEGÉDFÜGGVÉNY: ADAT NORMALIZÁLÓ ---
// Ez a függvény fordítja le a DB formátumot a Preview formátumra
const normalizeDocumentData = (rawData) => {
	if (!rawData) return null;

	// 1. Gyökér keresése (content_json, user_data, stb.)
	// A dokumentum objektumon belül keressük a tartalmat
	const root = rawData.content_json || rawData.user_data || rawData.content || rawData;

	// 2. Ha már jó formátumban van (ManualBuilder mentés), akkor kész
	if (root.personal_info) {
		// Még egy kis biztonsági háló: a skills legyen tömb
		if (root.skills && !Array.isArray(root.skills)) {
			// Ha objektum, visszaalakítjuk tömbbé a Preview kedvéért
			// (Bár a Preview most már mindkettőt kezeli, de a konzisztencia jó)
			// De itt most feltételezzük, hogy a ManualBuilder jól mentett.
		}
		return { ...rawData, cvData: root }; // Visszaadjuk az eredetit, de a cvData mezőben a tartalmat
	}

	// 3. Backend formátum konverziója
	const rawSkills = Array.isArray(root.skills) ? root.skills : [];

	// A Preview 'items' tömböt vár kategóriánként. Ha a DB-ben csak sima string tömbök vannak,
	// akkor azokat be kell csomagolni.
	// De a DB JSON-od alapján: { category: "...", items: [...] } -> Ez pont jó a Preview-nak!

	const cvData = {
		personal_info: {
			full_name: root.profile?.name || '',
			title: root.profile?.title || '',
			summary: root.profile?.summary || '',
			email: root.contact?.email || '',
			phone: root.contact?.phone || '',
			location: root.contact?.location || '',
			linkedin: root.contact?.linkedin || '',
			website: root.contact?.website || '',
		},
		summary: root.profile?.summary || root.summary || '',

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

		// A Backend skills tömbje (category, items) pont jó a Preview-nak!
		skills: rawSkills,

		key_projects_achievements: [],
		awards_and_recognitions: [],
	};

	// Visszaadjuk a teljes dokumentumot, de kiegészítve a normalizált cvData-val
	return { ...rawData, cvData };
};

// --- FETCH WRAPPER (Marad változatlan) ---
const apiFetch = async (endpoint, options = {}) => {
	const token = getToken();
	const headers = {
		'Content-Type': 'application/json',
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		...options.headers,
	};

	const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

	if (response.status === 401) {
		console.warn('Lejárt token...');
		localStorage.removeItem('access_token');
		throw new Error('Nincs bejelentkezve.');
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

// --- GEMINI API KEY ---
export const setGeminiApiKey = async (apiKey) =>
	apiFetch('/users/me/gemini-api-key', {
		method: 'POST',
		body: JSON.stringify({ api_key: apiKey }),
	});
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

// ITT A VÁLTOZÁS:
export const fetchDocumentById = async (id) => {
	const rawDoc = await apiFetch(`/documents/${id}`);
	// Azonnal normalizáljuk, mielőtt visszaadnánk!
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
