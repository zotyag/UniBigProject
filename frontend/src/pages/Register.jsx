import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
	useEffect(() => {
		document.title = 'Register';
	}, []);

	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
		password_confirm: '',
	});

	const [validationErrors, setValidationErrors] = useState({});

	const validateForm = (data) => {
		let errors = {};
		const usernamePattern = new RegExp('^[a-zA-Z0-9_]{8,24}$');
		const emailPattern = new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
		const passwordPattern = new RegExp(
			'^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&\\.])[A-Za-z\\d@$!%*?&\\.]{8,32}$',
		);

		// Username validation
		if (!data.username) {
			errors.username = 'Username cannot be empty.';
			setValidationErrors(errors);
			return false;
		} else if (!usernamePattern.test(data.username)) {
			errors.username =
				'Username must be 8-24 characters and can only contain letters, numbers, and underscores.';
			setValidationErrors(errors);
			return false;
		}

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

		// Password confirmation (cross-field check)
		if (!data.password_confirm) {
			errors.password_confirm = 'Password confirmation is required.';
			setValidationErrors(errors);
			return false;
		} else if (data.password !== data.password_confirm) {
			errors.password_confirm = 'Passwords do not match.';
			setValidationErrors(errors);
			return false;
		}

		// Update the error state in the component
		setValidationErrors(errors);

		// Return true if the errors object is empty (form is valid)
		return Object.keys(errors).length === 0;
	};

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const isValid = validateForm(formData);
		if (!isValid) {
			return;
		}

		try {
			// try to register
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
				<h2 className='text-2xl mb-4 text-center font-bold'>Register</h2>

				{/* Username Input */}
				<input
					type='text'
					name='username'
					placeholder='Username'
					required
					minLength={8}
					maxLength={24}
					title='Username must be 8-24 characters and can only contain letters, numbers, and underscores.'
					onChange={handleChange}
					id='username_input'
					className={`w-full border p-2 rounded ${
						validationErrors.username ? '!border-red-500 mb-1' : 'mb-3'
					}`}
				/>
				{/* Conditional error message */}
				{validationErrors.username && (
					<p className='text-red-500 text-sm mb-3'>{validationErrors.username}</p>
				)}

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

				{/* Password Confirmation */}
				<input
					type='password'
					name='password_confirm'
					placeholder='Password Confirmation'
					required
					minLength={8}
					maxLength={32}
					title='Must match the password entered above.'
					onChange={handleChange}
					id='password_confirm_input'
					className={`w-full border p-2 rounded ${
						validationErrors.password_confirm ? '!border-red-500 mb-1' : 'mb-3'
					}`}
				/>
				{/* Conditional error message */}
				{validationErrors.password_confirm && (
					<p className='text-red-500 text-sm mb-3'>{validationErrors.password_confirm}</p>
				)}

				<button
					type='submit'
					className='w-full bg-green-600 text-white py-2 rounded hover:bg-green-700'
				>
					Register
				</button>
			</form>
		</div>
	);
}

export default Register;
