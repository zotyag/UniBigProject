import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppNavbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
	useEffect(() => {
		document.title = 'Home'; // tab title; change on page load
	}, []);

	return (
		<Router>
			<div className='flex flex-col min-h-screen'>
				<AppNavbar />
				<main className='flex-grow'>
					<Routes>
						<Route path='/' element={<Home />} />
						<Route path='/login' element={<Login />} />
						<Route path='/register' element={<Register />} />
					</Routes>
				</main>
				<Footer />
			</div>
		</Router>
	);
}

export default App;
