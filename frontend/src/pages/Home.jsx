import { useEffect } from 'react';

import backgroundImage from '../assets/background.jpeg';

function Home() {
    useEffect(() => {
        document.title = 'Home';
    },);

    return (
        <div
            className='h-[calc(100vh-116px)] bg-cover bg-center flex flex-col items-center justify-center text-white'
            style={{ backgroundImage: `url(${backgroundImage})`, overflow: 'hidden' }}
        >
            <h1 className='text-4xl md:text-6xl font-bold bg-black bg-opacity-50 p-4 rounded'>
                Welcome to SmartCV
            </h1>
            
            <h2 className='text-xl md:text-2xl bg-black bg-opacity-50 p-4 rounded mt-4'>
                Improve your existing CV or write a new one from scratch with the help of artificial intelligence
            </h2>
			<h3 className='text-xl md:text-2xl bg-black bg-opacity-50 p-4 rounded mt-4'>
				You just need to answer all the questions what the AI ask, then it will send you a preview of your CV
			</h3>
			<div className='text-xl md:text-2xl bg-black bg-opacity-50 p-4 rounded mt-4'>
                You can try it here
            </div>
            
            <a href="/cvgenerator" role="button" className="btn btn-primary btn-lg mt-4">
                Generate
            </a>
        </div>
    );
}

export default Home;