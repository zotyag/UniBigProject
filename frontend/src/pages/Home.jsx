import { useEffect } from 'react';

import backgroundImage from '../assets/background.jpeg';

function Home() {
	useEffect(() => {
		document.title = 'Home';
	}, []);

	return (
		<div
			className='h-[calc(100vh-116px)] bg-cover bg-center flex flex-column items-center justify-center text-white'
			style={{ backgroundImage: `url(${backgroundImage})`, overflow: 'hidden' }}
		>
			<h1 className='text-4xl md:text-6xl font-bold bg-black bg-opacity-50 p-4 rounded'>
				Welcome to MySite
			</h1>
		</div>
	);
}

export default Home;
