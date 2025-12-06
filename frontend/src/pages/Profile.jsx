import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserProfile, updateUserProfile, setGeminiApiKey, deleteGeminiApiKey, changeUserPassword } from '../api';
import { Form, Button, Alert, Card, Badge, InputGroup, Spinner } from 'react-bootstrap';

const Profile = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const fileInputRef = useRef(null);

	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [oldPassword, setOldPassword] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	// Állapotok a visszajelzésekhez
	const [message, setMessage] = useState({ type: '', text: '' });
	const [validationErrors, setValidationErrors] = useState({});

	// Gemini Key state
	const [apiKeyInput, setApiKeyInput] = useState('');
	const [showApiKey, setShowApiKey] = useState(false);

	// ADATOK LEKÉRÉSE
	const { data: user, isLoading } = useQuery({
		queryKey: ['userProfile'],
		queryFn: fetchUserProfile,
	});

	// Ha megjött az adat, töltsük ki a mezőket
	useEffect(() => {
		if (user) {
			setUsername(user.username || '');
			setEmail(user.email || '');
		}
	}, [user]);

	// VALIDÁCIÓS LOGIKA (Ugyanaz a Regex, mint a regisztrációnál)
	const validateForm = () => {
		let errors = {};
		// A RegEx pontosan a Register.jsx-ből
		const passwordPattern = new RegExp(
			'^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&\\.])[A-Za-z\\d@$!%*?&\\.]{8,32}$',
		);

		// Csak akkor validálunk jelszót, ha a felhasználó írt valamit a mezőbe!
		if (password) {
			if (!oldPassword) {
				errors.oldPassword = 'A jelszó megváltoztatásához meg kell adni a régit.';
			}

			// 1. Jelszó erősség ellenőrzése
			if (!passwordPattern.test(password)) {
				errors.password =
					'A jelszónak 8-32 karakter hosszúnak kell lennie, tartalmaznia kell kis- és nagybetűt, számot és speciális karaktert.';
			}

			// 2. Jelszó megerősítés ellenőrzése
			if (!confirmPassword) {
				errors.confirmPassword = 'Kérlek erősítsd meg a jelszót.';
			} else if (password !== confirmPassword) {
				errors.confirmPassword = 'A jelszavak nem egyeznek.';
			}
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0; // Ha nincs hiba, true-val tér vissza
	};

	// PROFIL MÓDOSÍTÁSA
	const updateProfileMutation = useMutation({
		mutationFn: updateUserProfile,
		onSuccess: () => {
			setMessage({ type: 'success', text: 'Profil sikeresen frissítve!' });
			setPassword('');
			setConfirmPassword('');
			setValidationErrors({}); // Hibák törlése siker esetén
			queryClient.invalidateQueries(['userProfile']);
		},
		onError: () => setMessage({ type: 'danger', text: 'Hiba a mentéskor.' }),
	});

	// JELSZÓ MÓDOSÍTÁSA
	const passwordMutation = useMutation({
		mutationFn: changeUserPassword,
		onSuccess: () => {
			setMessage({ type: 'success', text: 'Jelszó sikeresen frissítve!' });
			setOldPassword('');
			setPassword('');
			setConfirmPassword('');
			setValidationErrors({});
		},
		onError: (err) => {
			const defaultMessage = 'Hiba a jelszó módosításakor.';
			// Próbáljuk meg kinyerni a konkrét hibaüzenetet a backend válaszából
			const errorMessage = err.message || defaultMessage;
			setMessage({ type: 'danger', text: errorMessage });
		},
	});

	// GEMINI API KULCS KEZELÉS MUTÁCIÓK
	const apiKeyMutation = useMutation({
		mutationFn: setGeminiApiKey,
		onSuccess: () => {
			setMessage({ type: 'success', text: 'Gemini API kulcs elmentve!' });
			setApiKeyInput('');
			queryClient.invalidateQueries(['userProfile']);
		},
		onError: () => setMessage({ type: 'danger', text: 'Hiba a kulcs mentésekor.' }),
	});

	const deleteKeyMutation = useMutation({
		mutationFn: deleteGeminiApiKey,
		onSuccess: () => {
			setMessage({ type: 'warning', text: 'API kulcs törölve.' });
			queryClient.invalidateQueries(['userProfile']);
		},
		onError: () => setMessage({ type: 'danger', text: 'Hiba a törléskor.' }),
	});

	// HANDLERS
	const handleSave = (e) => {
		e.preventDefault();
		setMessage({ type: '', text: '' });

		// Validáció futtatása mentés előtt
		if (!validateForm()) {
			return; // Ha hiba van, megállunk
		}

		// Megnézzük, hogy a jelszó mezők ki vannak-e töltve
		if (password) {
			passwordMutation.mutate({
				old_password: oldPassword,
				new_password: password,
				password_confirm: confirmPassword,
			});
		}

		// A profiladatokat (pl. username) külön frissítjük, ha változtak
		if (username !== user.username || email !== user.email) {
			updateProfileMutation.mutate({ username, email });
		}
	};

	const handleApiKeySubmit = (e) => {
		e.preventDefault();
		if (!apiKeyInput.trim() || apiKeyInput.length < 10) {
			setMessage({ type: 'danger', text: 'Kérlek adj meg egy érvényes API kulcsot.' });
			return;
		}
		apiKeyMutation.mutate(apiKeyInput);
	};

	const handleDeleteKey = () => {
		if (confirm('Biztosan törlöd az API kulcsot?')) {
			deleteKeyMutation.mutate();
		}
	};

	if (isLoading) return <div className='p-5 text-center'>Betöltés...</div>;

	return (
		<div className='min-h-screen bg-gray-50 py-10 px-4'>
			<div className='max-w-5xl mx-auto'>
				{/* HEADER */}
				<div className='flex justify-between items-center mb-8'>
					<h1 className='text-3xl font-bold text-gray-800'>Profil beállítások</h1>
					<Button variant='outline-secondary' onClick={() => navigate('/')}>
						Vissza a főoldalra
					</Button>
				</div>

				{message.text && (
					<Alert
						variant={message.type}
						className='mb-6 shadow-sm'
						onClose={() => setMessage({ type: '', text: '' })}
						dismissible
					>
						{message.text}
					</Alert>
				)}

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					{/* --- BAL OSZLOP: SZEMÉLYES ADATOK ÉS JELSZÓ --- */}
					<div className='lg:col-span-2 space-y-6'>
						<Card className='shadow-sm border-0'>
							<Card.Body className='p-6'>
								<h3 className='text-xl font-bold mb-4 text-gray-700 border-b pb-2'>
									Személyes Adatok
								</h3>
								<Form onSubmit={handleSave}>
									<Form.Group className='mb-4'>
										<Form.Label className='font-semibold text-gray-600'>
											Felhasználónév
										</Form.Label>
										<Form.Control
											type='text'
											value={username}
											onChange={(e) => setUsername(e.target.value)}
											className='bg-gray-50 border-gray-300 focus:bg-white transition-colors'
										/>
									</Form.Group>

									<Form.Group className='mb-6'>
										<Form.Label className='font-semibold text-gray-600'>
											Email cím
										</Form.Label>
										<Form.Control
											type='email'
											value={email}
											onChange={(e) => setEmail(e.target.value)} // Elvileg read-only, de ha az API engedi, maradhat
											className='bg-gray-50 border-gray-300 focus:bg-white transition-colors'
										/>
									</Form.Group>

									<hr className='my-6 border-gray-200' />

									<h3 className='text-xl font-bold mb-4 text-gray-700 border-b pb-2'>
										Jelszó módosítása
									</h3>
									<p className='text-sm text-gray-500 mb-4'>
										Hagyd üresen, ha nem szeretnéd megváltoztatni.
									</p>

									{/* Régi Jelszó */}
									<Form.Group className='mb-4'>
										<Form.Label className='font-semibold text-gray-600'>
											Régi Jelszó
										</Form.Label>
										<Form.Control
											type='password'
											placeholder='••••••••'
											value={oldPassword}
											onChange={(e) => setOldPassword(e.target.value)}
											isInvalid={!!validationErrors.oldPassword}
											className='bg-gray-50 border-gray-300 focus:bg-white transition-colors'
										/>
										<Form.Control.Feedback type='invalid'>
											{validationErrors.oldPassword}
										</Form.Control.Feedback>
									</Form.Group>

									{/* Új Jelszó */}
									<Form.Group className='mb-4'>
										<Form.Label className='font-semibold text-gray-600'>
											Új Jelszó
										</Form.Label>
										<Form.Control
											type='password'
											placeholder='••••••••'
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											isInvalid={!!validationErrors.password} // Bootstrap piros keret
											className='bg-gray-50 border-gray-300 focus:bg-white transition-colors'
										/>
										{/* Hibaüzenet megjelenítése */}
										<Form.Control.Feedback type='invalid'>
											{validationErrors.password}
										</Form.Control.Feedback>
									</Form.Group>

									{/* Jelszó megerősítés */}
									<Form.Group className='mb-6'>
										<Form.Label className='font-semibold text-gray-600'>
											Új Jelszó Megerősítése
										</Form.Label>
										<Form.Control
											type='password'
											placeholder='••••••••'
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											isInvalid={!!validationErrors.confirmPassword} // Bootstrap piros keret
											className='bg-gray-50 border-gray-300 focus:bg-white transition-colors'
										/>
										<Form.Control.Feedback type='invalid'>
											{validationErrors.confirmPassword}
										</Form.Control.Feedback>
									</Form.Group>

									<div className='flex justify-end'>
										<Button
											variant='primary'
											type='submit'
											size='lg'
											disabled={
												updateProfileMutation.isPending || passwordMutation.isPending
											}
											className='px-6 fw-bold'
										>
											{updateProfileMutation.isPending || passwordMutation.isPending
												? 'Mentés...'
												: 'Változások mentése'}
										</Button>
									</div>
								</Form>
							</Card.Body>
						</Card>
					</div>

					{/* --- JOBB OSZLOP: AI BEÁLLÍTÁSOK --- */}
					<div className='lg:col-span-1'>
						<Card
							className={`shadow-sm border-0 ${
								user?.has_gemini_api_key ? 'bg-green-50' : 'bg-white'
							}`}
						>
							<Card.Body className='p-6'>
								<div className='flex justify-between items-center mb-4 border-b pb-2 border-gray-200'>
									<h3 className='text-xl font-bold text-gray-700 m-0'>Gemini AI</h3>
									{user?.has_gemini_api_key ? (
										<Badge bg='success' className='px-3 py-2'>
											Aktív
										</Badge>
									) : (
										<Badge bg='warning' text='dark' className='px-3 py-2'>
											Nincs beállítva
										</Badge>
									)}
								</div>

								<p className='text-sm text-gray-600 mb-4'>
									A CV generáláshoz szükség van egy Google Gemini API kulcsra. A kulcsot
									titkosítva tároljuk.
								</p>

								{user?.has_gemini_api_key && (
									<div className='mb-6 p-3 bg-white rounded border border-green-200'>
										<div className='text-green-700 font-semibold text-sm mb-2'>
											✅ A kulcs be van állítva.
										</div>
										<Button
											variant='outline-danger'
											size='sm'
											className='w-100'
											onClick={handleDeleteKey}
											disabled={deleteKeyMutation.isPending}
										>
											Kulcs törlése / Csere
										</Button>
									</div>
								)}

								<Form onSubmit={handleApiKeySubmit}>
									<Form.Label className='font-semibold text-gray-600 text-sm'>
										{user?.has_gemini_api_key
											? 'Új kulcs megadása (Felülírás)'
											: 'API Kulcs megadása'}
									</Form.Label>

									<InputGroup className='mb-3'>
										<Form.Control
											type={showApiKey ? 'text' : 'password'}
											placeholder='AIzaSy...'
											value={apiKeyInput}
											onChange={(e) => setApiKeyInput(e.target.value)}
											className='border-gray-300'
										/>
										<Button
											variant='light'
											className='border border-gray-300 text-gray-500 hover:text-gray-700 d-flex align-items-center'
											onClick={() => setShowApiKey(!showApiKey)}
											title={showApiKey ? 'Kód elrejtése' : 'Kód mutatása'}
										>
											{showApiKey ? (
												<svg
													xmlns='http://www.w3.org/2000/svg'
													width='16'
													height='16'
													fill='currentColor'
													viewBox='0 0 16 16'
												>
													<path d='M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486z' />
													<path d='M11.297 9.377 8 5.965 6 7.965l5.297 1.412M12 12a4 4 0 0 1-4 4 2 2 0 0 1-2.22-3.32l5.22 5.22zM4.5 8a3.5 3.5 0 0 1 7 0 3.5 3.5 0 0 1-7 0z' />
													<path d='M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z' />
												</svg>
											) : (
												<svg
													xmlns='http://www.w3.org/2000/svg'
													width='16'
													height='16'
													fill='currentColor'
													viewBox='0 0 16 16'
												>
													<path d='M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z' />
													<path d='M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0' />
												</svg>
											)}
										</Button>
									</InputGroup>

									<Button
										variant={user?.has_gemini_api_key ? 'secondary' : 'success'}
										type='submit'
										className='w-100 fw-bold'
										disabled={apiKeyMutation.isPending}
									>
										{apiKeyMutation.isPending ? 'Ellenőrzés...' : 'Kulcs mentése'}
									</Button>
								</Form>

								<div className='mt-4 text-xs text-gray-400 text-center'>
									<a
										href='https://aistudio.google.com/app/apikey'
										target='_blank'
										rel='noreferrer'
										className='text-blue-500 hover:underline'
									>
										Itt igényelhetsz kulcsot ↗
									</a>
								</div>
							</Card.Body>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Profile;
