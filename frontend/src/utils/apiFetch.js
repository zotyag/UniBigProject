import { useAuthStore } from '../stores/authStore.js';

export const API_BASE = (
	import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'
).replace(/\/+$/, '');

export async function apiFetch(path, options = {}) {
	const store = useAuthStore.getState();
	const access = store.token || localStorage.getItem('access_token');
	const headers = {
		'Content-Type': 'application/json',
		...(options.headers || {}),
		...(access ? { Authorization: `Bearer ${access}` } : {}),
	};

	let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

	// if access token expired -> refresh once and retry
	if (res.status === 401) {
		try {
			const newAccess = await useAuthStore.getState().refreshTokens();
			const retryHeaders = { ...headers, Authorization: `Bearer ${newAccess}` };
			res = await fetch(`${API_BASE}${path}`, { ...options, headers: retryHeaders });
		} catch {
			// keep 401 for caller to handle (e.g., redirect to login)
		}
	}
	return res;
}
