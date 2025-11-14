import { useEffect } from 'react';

function CVGenerator() {
	useEffect(() => {
		document.title = 'CV Generator';
	}, []);

	return (
		<div>
			<div className='flex flex-row w-full min-h-screen p-4 gap-4 bg-gray-100'>
				{/* Chatbox */}
				<div className='w-1/2 bg-white p-6 rounded-lg shadow-lg'>
					<h2 className='text-2xl font-bold mb-4'>Szerkesztő</h2>
				</div>

				{/* Preview */}
				<div className='w-1/2 bg-white p-6 rounded-lg shadow-lg border border-gray-200'>
					<h2 className='text-2xl font-bold mb-4'>Előnézet</h2>
					<p>Itt fog megjelenni a generált CV.</p>
				</div>
			</div>
		</div>
	);
}

export default CVGenerator;
