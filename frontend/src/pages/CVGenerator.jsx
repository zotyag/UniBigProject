import { useEffect, useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { startChatSession, sendChatMessage, finalizeChatSession } from '../api';
import Preview from '../components/PreviewForBuilder';
import { Modal, Button } from 'react-bootstrap';
import { useAuthStore } from '../stores/authStore.js';
import ReactMarkdown from 'react-markdown';

import './styles/document.css';
import { BASE_URL as API_BASE_URL } from '../api.js';
import './styles/app.css';

function CVGenerator() {
	// --- HOOKS ---
	const { docId } = useParams();
	const previewRef = useRef(null);
	const messagesEndRef = useRef(null);

	// --- STATE ---
	const accessToken = useAuthStore((state) => state.token);
	const [sessionId, setSessionId] = useState(null);
	const [messages, setMessages] = useState([]);
	const [currentMessage, setCurrentMessage] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const [showPreviewModal, setShowPreviewModal] = useState(false);
	const openPreview = () => setShowPreviewModal(true);
	const closePreview = () => setShowPreviewModal(false);

	// Initial CV Data Structure
	const [cvData, setCvData] = useState({
		personal_info: {
			full_name: '',
			email: '',
			phone: '',
			title: '',
			linkedin: '',
			website: '',
			location: '',
		},
		profilePictureUrl: '',
		summary: '',
		experience: [],
		education: [],
		skills: {
			core_competencies: [],
			software_proficiency: [],
			language_fluency: [],
			certifications: [],
		},
		key_projects_achievements: [],
		awards_and_recognitions: [],
	});

	const [progress, setProgress] = useState(0);
	const [isComplete, setIsComplete] = useState(false);

	// --- Effects ---

	useEffect(() => {
		document.title = 'CV Generator';
	}, []);

	// Auto scroll
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	// Initialize chat session
	useEffect(() => {
		if (!accessToken) return;

		const startChatSession = async () => {
			setIsLoading(true);
			try {
				const firstMessage = docId
					? 'Szia, szeretném szerkeszteni a meglévő dokumentumomat.'
					: 'Szia, szeretnék egy új CV-t készíteni.';

				const body = {
					initial_message: firstMessage,
					doc_type: 'cv',
				};

				if (docId) {
					body.existing_doc_id = docId;
				}

				const response = await fetch(`${API_BASE_URL}/chat/start`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${accessToken}`,
					},
					body: JSON.stringify(body),
				});

				if (!response.ok) throw new Error('Failed to start chat');
				const data = await response.json();
				setSessionId(data.session_id);

				// update CV data if provided
				if (data.cv_data) updateCvDataFromAI(data.cv_data);

				setProgress(data.progress);
				setIsComplete(data.is_complete);
				setMessages([
					{ id: Date.now(), text: data.message || 'Szia! Kezdhetjük.', sender: 'bot' },
				]);
			} catch (error) {
				console.error('Error starting chat session:', error);
				setMessages([{ id: Date.now(), text: `Hiba: ${error.message}`, sender: 'bot' }]);
			} finally {
				setIsLoading(false);
			}
		};

		startChatSession();
	}, [accessToken, docId]);

	// Normalizes AI response data to match Preview component structure
	const updateCvDataFromAI = (aiResponseData) => {
		console.log('🔄 AI Response Data Received:', aiResponseData);
		if (!aiResponseData) return;

		// Deep merge for better stability
		setCvData((prev) => {
			const newData = {
				...prev,
				personal_info: { ...prev.personal_info, ...aiResponseData.personal_info },
				summary: aiResponseData.summary || prev.summary,

				// Replace arrays only if they are provided and are actually arrays
				experience: Array.isArray(aiResponseData.experience)
					? aiResponseData.experience
					: prev.experience,
				education: Array.isArray(aiResponseData.education)
					? aiResponseData.education
					: prev.education,
				skills: {
					...prev.skills,
					...aiResponseData.skills,
				},
				key_projects_achievements: Array.isArray(aiResponseData.key_projects_achievements)
					? aiResponseData.key_projects_achievements
					: prev.key_projects_achievements,
				awards_and_recognitions: Array.isArray(aiResponseData.awards_and_recognitions)
					? aiResponseData.awards_and_recognitions
					: prev.awards_and_recognitions,
			};
			console.log('✅ New CV Data State:', newData);
			return newData;
		});
	};

	// --- Handlers ---

	const handleSubmit = async (e) => {
		e.preventDefault();
		const userInput = currentMessage.trim();
		if (!userInput || isLoading || !sessionId) return;

		const userMessage = { id: Date.now(), text: userInput, sender: 'user' };
		setMessages((prev) => [...prev, userMessage]);
		setCurrentMessage('');
		setIsLoading(true);

		try {
			const response = await fetch(`${API_BASE_URL}/chat/message`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
				body: JSON.stringify({ session_id: sessionId, message: userInput }),
			});

			if (!response.ok) throw new Error('API call failed');
			const data = await response.json();

			const botMessage = {
				id: Date.now() + 1,
				text: data.message || 'Adatok frissítve!',
				sender: 'bot',
			};
			setMessages((prev) => [...prev, botMessage]);

			// Update CV data if provided
			if (data.cv_data) updateCvDataFromAI(data.cv_data);

			setProgress(data.progress);
			setIsComplete(data.is_complete);
		} catch (error) {
			console.error('Error sending message:', error);
			const errorMessage = { id: Date.now() + 1, text: `Hiba: ${error.message}`, sender: 'bot' };
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleFinalize = async () => {
		if (!sessionId) return;
		setIsLoading(true);
		try {
			const title = cvData.personal_info.full_name
				? `${cvData.personal_info.full_name} - CV`
				: 'My Professional CV';
			const response = await fetch(`${API_BASE_URL}/chat/session/${sessionId}/finalize`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
				body: JSON.stringify({ title: title, template_code: 'default' }),
			});
			if (!response.ok) throw new Error('Failed to finalize session');
			const data = await response.json();
			setMessages((prev) => [
				...prev,
				{
					id: Date.now() + 1,
					text: `Szuper! A CV-d elmentve. ID: ${data.document.id}.`,
					sender: 'bot',
				},
			]);
		} catch (error) {
			setMessages((prev) => [
				...prev,
				{ id: Date.now() + 1, text: `Hiba a mentéskor: ${error.message}`, sender: 'bot' },
			]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div>
			<div className='flex flex-row w-full h-[calc(100vh-116px)] p-4 gap-4 bg-gray-100'>
				<div className='flex-1 min-w-0 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden'>
					<form noValidate className='flex flex-col h-full' onSubmit={handleSubmit}>
						<div className='flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50'>
							{messages.map((msg) => (
								<div
									key={msg.id}
									className={`flex ${
										msg.sender === 'user' ? 'justify-end' : 'justify-start'
									}`}
								>
									<div
										className={`py-2 px-4 rounded-lg max-w-[80%] ${
											msg.sender === 'user'
												? 'bg-blue-500 text-white'
												: 'bg-white text-gray-800 shadow-sm'
										}`}
									>
										<ReactMarkdown>{msg.text}</ReactMarkdown>
									</div>
								</div>
							))}
							{isLoading && (
								<div className='flex justify-start'>
									<div className='bg-gray-200 text-gray-500 py-2 px-4 rounded-lg text-sm italic animate-pulse'>
										Gondolkodom...
									</div>
								</div>
							)}
							<div ref={messagesEndRef} />
						</div>

						<div className='p-4 border-t bg-white flex gap-2 flex-shrink-0'>
							<input
								type='text'
								className='border p-2 rounded flex-1 form-control'
								placeholder={isLoading ? 'AI gondolkodik...' : 'Írj üzenetet...'}
								value={currentMessage}
								onChange={(e) => setCurrentMessage(e.target.value)}
								disabled={isLoading}
								autoFocus
							/>
							<button
								type='submit'
								className='bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-300'
								disabled={isLoading || !sessionId}
							>
								Send
							</button>
							<button
								type='button'
								className='bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-green-300'
								disabled={isLoading || !sessionId}
								onClick={handleFinalize}
							>
								Finalize
							</button>
							<Button
								variant='secondary'
								className='ml-2 block lg:hidden'
								onClick={openPreview}
							>
								Preview
							</Button>
						</div>
					</form>
				</div>

				<div
					className='hidden lg:block'
					style={{ flex: '0 0 210mm', width: '210mm', maxWidth: '210mm', overflow: 'auto' }}
				>
					<main className='preview-area flex justify-center p-4'>
						<Preview ref={previewRef} data={cvData} />
					</main>
				</div>
			</div>

			<Modal
				show={showPreviewModal}
				onHide={closePreview}
				size='lg'
				centered
				dialogClassName='modal-preview'
			>
				<Modal.Header closeButton>
					<Modal.Title>Preview</Modal.Title>
				</Modal.Header>
				<Modal.Body className='d-flex justify-content-center'>
					<div style={{ overflow: 'auto', width: '100%' }}>
						<div className='preview-wrapper'>
							<Preview ref={previewRef} data={cvData} />
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button variant='secondary' onClick={closePreview}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
}

export default CVGenerator;
