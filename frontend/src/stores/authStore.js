import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
	token: localStorage.getItem('access_token') || null,
	user: (() => {
		const v = localStorage.getItem('user');
		try {
			return v ? JSON.parse(v) : null;
		} catch {
			return null;
		}
	})(),
	setToken: (t) => {
		if (t) localStorage.setItem('access_token', t);
		else localStorage.removeItem('access_token');
		set({ token: t });
	},
	setUser: (u) => {
		if (u) localStorage.setItem('user', JSON.stringify(u));
		else localStorage.removeItem('user');
		set({ user: u });
	},
	logout: () => {
		localStorage.removeItem('access_token');
		localStorage.removeItem('user');
		set({ token: null, user: null });
	},
	fetchCurrentUser: async () => {
		const token = get().token;
		if (!token) return null;
		try {
			const apiUrl = import.meta.env.VITE_API_BASE_URL || '';
			const res = await fetch(apiUrl + '/api/v1/users/me', {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			});
			if (!res.ok) {
				get().logout();
				return null;
			}
			const data = await res.json();
			set({ user: data });
			localStorage.setItem('user', JSON.stringify(data));
			return data;
		} catch {
			return null;
		}
	},
}));
