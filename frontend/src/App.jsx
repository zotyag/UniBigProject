import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppNavbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Profile from './pages/Profile';
import ManualCVBuilder from './pages/ManualCVBuilder';
import Login from './pages/Login';
import Register from './pages/Register';
import CVGenerator from './pages/CVGenerator';
import Dashboard from './pages/Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';

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
						<Route path='/profile' element={<Profile />} />
						<Route path='/login' element={<Login />} />
						<Route path='/register' element={<Register />} />
						<Route path='/cvgenerator' element={<CVGenerator />} />
						<Route path='/cvbuilder' element={<ManualCVBuilder />} />
						<Route path='/dashboard' element={<Dashboard />} />
					</Routes>
				</main>
				<Footer />
			</div>
		</Router>
	);
}

export default App;
