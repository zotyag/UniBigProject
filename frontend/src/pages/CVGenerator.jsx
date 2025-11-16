import { useEffect, useState, useRef } from 'react';
import Preview from '../components/Preview';
import './styles/document.css';
import './styles/app.css';
import MyModalComponent from '../components/MyModal.jsx';

function CVGenerator() {
	useEffect(() => {
		document.title = 'CV Generator';
	}, []);
	const previewRef = useRef(null);

	// --- State-ek ---
	const [messages, setMessages] = useState([
		{
			id: 1,
			text: 'Szia! Készen állok. Mit szeretnél készíteni, önéletrajzot vagy motivációs levelet?',
			sender: 'bot',
		},
	]);
	const [currentMessage, setCurrentMessage] = useState('');

	// Betöltési állapot (amíg az AI válaszára várunk)
	const [isLoading, setIsLoading] = useState(false);

	const messagesEndRef = useRef(null);

	const [cvData, setCvData] = useState({
        personalInfo: { name: '', email: '', phone: '' },
        profilePictureUrl: '', summary: '', experience: [], education: []
    });

	// Automatikus görgetés
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(scrollToBottom, [messages]);

	// Üzenetküldés
	const handleSubmit = async (e) => {
		e.preventDefault();
		const userInput = currentMessage.trim();

		if (userInput === '' || isLoading) return;

		setIsLoading(true);

		// A USER üzenetének azonnali hozzáadása (optimistic update)
		const userMessage = {
			id: Date.now(), // Egyedi üzenet ID
			text: userInput,
			sender: 'user',
		};
		setMessages((prevMessages) => [...prevMessages, userMessage]);

		setCurrentMessage('');

		try {
			// TODO: API hivás a backend felé

			const aiText = 'Ideiglenes AI üzenet, míg a valós AI hívás nincs implementálva.';

			// AI válaszának hozzáadása
			const botMessage = {
				id: Date.now() + 1, // Új egyedi ID
				text: aiText,
				sender: 'bot',
			};
			setMessages((prevMessages) => [...prevMessages, botMessage]);
		} catch (error) {
			console.error('Hiba az AI válasszal:', error);

			const errorMessage = {
				id: Date.now() + 1,
				text: 'Sajnálom, hiba történt a válasz feldolgozása közben. Próbáld újra.',
				sender: 'bot',
			};
			setMessages((prevMessages) => [...prevMessages, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div>
			<div className='flex flex-row w-full h-[calc(100vh-116px)] p-4 gap-4 bg-gray-100'>
				{/* Chatbox */}
				<div className='w-1/2 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden'>
					<form noValidate className='flex flex-col h-full' onSubmit={handleSubmit}>
						<div className='flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50'>
							{/* Üzenetek renderelése */}
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
										{msg.text}
									</div>
								</div>
							))}
							<div ref={messagesEndRef} />
						</div>

						{/* Alsó input sáv */}
						<div className='p-4 border-t bg-white flex gap-2 flex-shrink-0'>
							<input
								type='text'
								name='input'
								required
								id='user_input'
								className={'border p-2 rounded flex-1 form-control'}
								placeholder={isLoading ? 'AI gondolkodik...' : 'Írj üzenetet...'}
								value={currentMessage}
								onChange={(e) => setCurrentMessage(e.target.value)}
								disabled={isLoading}
							/>
							<button
								type='submit'
								className='bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-300'
								disabled={isLoading}
							>
								{isLoading ? 'Küldés...' : 'Send'}
							</button>
						</div>
					</form>
				</div>

				<div className='overflow-y-scroll'><main className='preview-area'>
				 <Preview ref={previewRef} />
            	</main>
				<div className="flex-shrink-0 flex justify-center gap-4">
                        <button
                            type="button"
                            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-semibold text-sm" // 'text-sm' a kisebb mérethez
                        >
                            Upload
                        </button>
                        <button
                            type="button"
                            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 font-semibold text-sm" // 'text-sm' a kisebb mérethez
                        >
                            Print
                        </button>
                    </div>
				</div>
							
				<div className="p-4 border-t d-md-none">
                <MyModalComponent />
            	</div>
			</div>
		</div>
	)
}

export default CVGenerator;
