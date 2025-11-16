import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore.js';

import backgroundImage from '../assets/background.jpeg';

function Home() {
	useEffect(() => {
		document.title = 'Home';
	}, []);

	// auth + api helpers
	const user = useAuthStore((s) => s.user);
	const token = useAuthStore((s) => s.token);
	const fetchCurrentUser = useAuthStore.getState().fetchCurrentUser;

	const [apiKey, setApiKey] = useState('');
	const [loading, setLoading] = useState(false);

	const apiUrl = import.meta.env.VITE_API_BASE_URL || '';

	const handleSetKey = async (e) => {
		e?.preventDefault();
		if (!apiKey) {
			alert('Please enter an API key.');
			return;
		}
		if (!token) {
			alert('You must be logged in to set an API key.');
			return;
		}
		setLoading(true);
		try {
			const res = await fetch(`${apiUrl}/api/v1/users/me/gemini-api-key`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ api_key: apiKey }),
			});
			if (res.ok) {
				alert('API key saved.');
				await fetchCurrentUser();
				setApiKey('');
			} else {
				const body = await res.json().catch(() => ({}));
				alert(body.error || `Failed to save key (${res.status})`);
			}
		} catch (err) {
			console.error(err);
			alert('Network error while saving API key.');
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteKey = async () => {
		if (!token) {
			alert('You must be logged in to remove an API key.');
			return;
		}
		if (!confirm('Remove stored Gemini API key?')) return;
		setLoading(true);
		try {
			const res = await fetch(`${apiUrl}/api/v1/users/me/gemini-api-key`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			});
			if (res.ok) {
				alert('API key removed.');
				await fetchCurrentUser();
			} else {
				const body = await res.json().catch(() => ({}));
				alert(body.error || `Failed to remove key (${res.status})`);
			}
		} catch (err) {
			console.error(err);
			alert('Network error while removing API key.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className='h-[calc(100vh-116px)] bg-cover bg-center flex flex-col items-center justify-center text-white'
			style={{ backgroundImage: `url(${backgroundImage})`, overflow: 'hidden' }}
		>
			<h1 className='text-4xl md:text-6xl font-bold bg-black bg-opacity-50 p-4 rounded'>
				Welcome to SmartCV
			</h1>

			<div className='text-xl md:text-2xl bg-black bg-opacity-75 p-4 rounded mt-4 text-center w-11/12 max-w-2xl'>
				<p>
					Improve your existing CV or write a new one from scratch with the help of artificial
					intelligence.
				</p>
				<p className='mt-4'>
					You just need to answer all the questions what the AI ask, then it will send you a
					preview of your CV.
				</p>
				<p className='mt-4'>
					You can try it here:
					<br></br>
					<a href='/cvgenerator' role='button' className='btn btn-primary btn-lg mt-4'>
						Generate
					</a>
				</p>
			</div>

			{/* Gemini API Key section */}
			<div className='mt-6 text-left w-11/12 max-w-2xl bg-black bg-opacity-75 p-6 rounded'>
				<h2 className='text-2xl font-semibold text-white'>Gemini API key (required for AI)</h2>
				<p className='mt-2 text-sm text-gray-200'>
					This site uses the Gemini API — you must provide your own API key. See the official
					instructions here:{' '}
					<a
						href='https://developers.generativeai.google/'
						target='_blank'
						rel='noopener noreferrer'
						className='underline'
					>
						Gemini / Generative AI docs
					</a>
					.
				</p>

				{!token ? (
					<div className='mt-4 text-sm text-yellow-200'>
						You must be logged in to set your API key. Please{' '}
						<a href='/login' className='underline'>
							login
						</a>
						.
					</div>
				) : user && user.has_gemini_api_key ? (
					<div className='mt-4 flex items-center justify-between'>
						<span className='text-sm text-green-200'>
							A Gemini API key is already set for your account.
						</span>
						<button
							onClick={handleDeleteKey}
							disabled={loading}
							className='btn btn-outline-danger'
						>
							Remove key
						</button>
					</div>
				) : (
					<form onSubmit={handleSetKey} className='mt-4 flex flex-col sm:flex-row gap-2'>
						<input
							type='password'
							placeholder='Enter Gemini API key'
							value={apiKey}
							onChange={(e) => setApiKey(e.target.value)}
							className='form-input px-3 py-2 rounded w-full text-black'
							aria-label='Gemini API key'
						/>
						<button type='submit' disabled={loading} className='btn btn-primary'>
							{loading ? 'Saving...' : 'Save API key'}
						</button>
					</form>
				)}
			</div>
		</div>
	);
}

export default Home;
