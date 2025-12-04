/**
 * API Kliens a CV Generátorhoz
 * Dokumentáció alapján: Base URL = http://localhost:3000/api/v1
 */

const getToken = () => localStorage.getItem('access_token');

// A dokumentáció szerint a verzió v1
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') + '/api/v1';

/**
 * Általános fetch wrapper
 * Kezeli a tokent, a JSON parse-olást és a globális hibákat (pl. 401).
 */
const apiFetch = async (endpoint, options = {}) => {
	const token = getToken();
	const headers = {
		'Content-Type': 'application/json',
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		...options.headers,
	};

	// NINCS TRY-CATCH, mert a hívó fél (useQuery) úgyis elkapja a hibát
	const response = await fetch(`${BASE_URL}${endpoint}`, {
		...options,
		headers,
	});

	// 401 kezelése (Kijelentkeztetés)
	if (response.status === 401) {
		console.warn('Lejárt vagy érvénytelen token -> Kijelentkeztetés...');
		localStorage.removeItem('access_token');
		throw new Error('Nincs bejelentkezve vagy lejárt a munkamenet.');
	}

	// 204 No Content kezelése
	if (response.status === 204) {
		return null;
	}

	// Egyéb hiba kezelése
	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.error || errorData.message || 'Hálózati hiba');
	}

	return response.json();
};

/* ==========================================================================
   USER ENDPOINTS
   ========================================================================== */

// Jelenlegi felhasználó lekérése (Ez a képen lévő FetchCurrentUser megfelelője)
// Endpoint: GET /users/me
export const fetchUserProfile = async () => {
	return apiFetch('/users/me');
};

// Profil frissítése (Username, Email)
// Endpoint: PUT /users/me
export const updateUserProfile = async (data) => {
	return apiFetch('/users/me', {
		method: 'PUT',
		body: JSON.stringify(data),
	});
};

/* ==========================================================================
   GEMINI API KEY ENDPOINTS
   ========================================================================== */

// Kulcs mentése
// Endpoint: POST /users/me/gemini-api-key
export const setGeminiApiKey = async (apiKey) => {
	return apiFetch('/users/me/gemini-api-key', {
		method: 'POST',
		body: JSON.stringify({ api_key: apiKey }),
	});
};

// Kulcs törlése
// Endpoint: DELETE /users/me/gemini-api-key
export const deleteGeminiApiKey = async () => {
	return apiFetch('/users/me/gemini-api-key', {
		method: 'DELETE',
	});
};

/* ==========================================================================
   AUTH ENDPOINTS
   ========================================================================== */

export const loginUser = async (credentials) => {
	return apiFetch('/auth/login', {
		method: 'POST',
		body: JSON.stringify(credentials),
	});
};

export const registerUser = async (userData) => {
	return apiFetch('/auth/register', {
		method: 'POST',
		body: JSON.stringify(userData),
	});
};

/* ==========================================================================
   DOCUMENT ENDPOINTS (CV LISTA)
   ========================================================================== */

// Dokumentumok listázása
// Endpoint: GET /documents
export const fetchDocuments = async (type = null) => {
	const query = type ? `?doc_type=${type}` : '';
	return apiFetch(`/documents${query}`);
};

// Dokumentum törlése
// Endpoint: DELETE /documents/:id
export const deleteDocument = async (id) => {
	return apiFetch(`/documents/${id}`, { method: 'DELETE' });
};

/* ==========================================================================
   AI CHAT API
   ========================================================================== */

// 1. Start Chat
export const startChatSession = async (initialMessage) => {
	return apiFetch('/chat/start', {
		method: 'POST',
		body: JSON.stringify({
			initial_message: initialMessage,
			doc_type: 'cv', // Most fixen CV-t generálunk
		}),
	});
};

// 2. Send Message
export const sendChatMessage = async ({ sessionId, message }) => {
	return apiFetch('/chat/message', {
		method: 'POST',
		body: JSON.stringify({
			session_id: sessionId,
			message: message,
		}),
	});
};

// 3. Finalize Session
export const finalizeChatSession = async ({ sessionId, title }) => {
	return apiFetch(`/chat/session/${sessionId}/finalize`, {
		method: 'POST',
		body: JSON.stringify({
			title: title || 'My AI Generated CV',
			template_code: 'default',
		}),
	});
};

// ÚJ DOKUMENTUM MENTÉSE (Manuális szerkesztőből)
// Endpoint: POST /documents
export const createDocument = async ({ title, cvData }) => {
	return apiFetch('/documents', {
		method: 'POST',
		body: JSON.stringify({
			doc_type: 'cv', // Típus
			title: title, // A user által megadott cím
			template_code: 'default', // Sablon (egyelőre default)
			user_data: cvData, // A teljes CV tartalom (a backend ezt menti el)
		}),
	});
};
