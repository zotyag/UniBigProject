import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.js';

function Login() {
	useEffect(() => {
		document.title = 'SmartCV - Login';
	}, []);

	const [formData, setFormData] = useState({ email: '', password: '' });
	const navigate = useNavigate();

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const [validationErrors, setValidationErrors] = useState({});
	const validateForm = (data) => {
		let errors = {};
		const emailPattern = new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
		const passwordPattern = new RegExp(
			'^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&\\.])[A-Za-z\\d@$!%*?&\\.]{8,32}$',
		);

		// Email validation
		if (!data.email) {
			errors.email = 'Email address cannot be empty.';
			setValidationErrors(errors);
			return false;
		} else if (!emailPattern.test(data.email)) {
			errors.email =
				'Must be a valid email format (e.g., user@domain.com) and contain no spaces.';
			setValidationErrors(errors);
			return false;
		}

		// Password validation
		if (!data.password) {
			errors.password = 'Password cannot be empty.';
			setValidationErrors(errors);
			return false;
		} else if (!passwordPattern.test(data.password)) {
			errors.password =
				'Password must be 8-32 characters, include uppercase and lowercase letters, a number, and a special character.';
			setValidationErrors(errors);
			return false;
		}

		// Update the error state in the component
		setValidationErrors(errors);

		// Return true if the errors object is empty (form is valid)
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const isValid = validateForm(formData);
		if (!isValid) {
			return;
		}

		try {
			// try to log in
			const apiUrl = import.meta.env.VITE_API_BASE_URL;
			const res = await fetch(apiUrl + '/api/v1/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
				credentials: 'include',
			});
			const data = await res.json();
			if (res.ok) {
				// save token + update global store so Navbar updates immediately
				useAuthStore.getState().setToken(data.access_token);
				if (data.user) {
					useAuthStore.getState().setUser(data.user);
				} else {
					// if backend only returns token, fetch /me
					await useAuthStore.getState().fetchCurrentUser();
				}
				navigate('/');
			} else {
				alert(data.error || 'Login failed due to server error.');
			}
		} catch (err) {
			console.error('Network or parsing error:', err);
			alert('Could not connect to the server. Please try again.');
		}
	};

	return (
		<div className='flex justify-center items-center h-[calc(100vh-128px)] bg-gray-100'>
			<form
				noValidate
				onSubmit={handleSubmit}
				className='bg-white p-6 rounded shadow-md w-[90%] sm:w-[400px]'
			>
				<h2 className='text-2xl mb-4 text-center font-bold'>Login</h2>

				{/* Email Input */}
				<input
					type='email'
					name='email'
					placeholder='Email'
					required
					title='Must be a valid email format (e.g., user@domain.com) and contain no spaces.'
					onChange={handleChange}
					id='email_input'
					className={`w-full border p-2 rounded ${
						validationErrors.email ? '!border-red-500 mb-1' : 'mb-3'
					}`}
				/>
				{/* Conditional error message */}
				{validationErrors.email && (
					<p className='text-red-500 text-sm mb-3'>{validationErrors.email}</p>
				)}

				{/* Password Input */}
				<input
					type='password'
					name='password'
					placeholder='Password'
					required
					minLength={8}
					maxLength={32}
					title='Password must be 8-32 characters, include uppercase and lowercase letters, a number, and a special character.'
					onChange={handleChange}
					id='password_input'
					className={`w-full border p-2 rounded ${
						validationErrors.password ? '!border-red-500 mb-1' : 'mb-3'
					}`}
				/>
				{/* Conditional error message */}
				{validationErrors.password && (
					<p className='text-red-500 text-sm mb-3'>{validationErrors.password}</p>
				)}

				<button
					type='submit'
					className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700'
				>
					Login
				</button>
				<span className='form-text mt-3 block text-center'>
					If you don't have an account,{' '}
					<a className='link-primary' href='/register'>
						click here
					</a>{' '}
					to register.
				</span>
			</form>
		</div>
	);
}

export default Login;
