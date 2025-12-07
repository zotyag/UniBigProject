import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppNavbar from './components/Navbar';
import Footer from './components/Footer';
// import Home from './pages/Home'; 
import Profile from './pages/Profile';
import ManualCVBuilder from './pages/ManualCVBuilder';
import Login from './pages/Login';
import Register from './pages/Register';
import CVGenerator from './pages/CVGenerator';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute'; 
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    useEffect(() => {
        document.title = 'SmartCV'; 
    }, []);

    return (
        <Router>
            <div className='flex flex-col min-h-screen'>
                <AppNavbar />
                <main className='flex-grow'>
                    <Routes>
                        <Route path='/login' element={<Login />} />
                        <Route path='/register' element={<Register />} />
                        <Route path='/'  element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>

                        
                        <Route 
                            path='/profile' 
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            } 
                        />

                       
                        <Route 
                            path='/cvgenerator/:docId?' 
                            element={
                                <ProtectedRoute>
                                    <CVGenerator />
                                </ProtectedRoute>
                            } 
                        />

                        
                        <Route 
                            path='/cvbuilder/:id?' 
                            element={
                                <ProtectedRoute>
                                    <ManualCVBuilder />
                                </ProtectedRoute>
                            } 
                        />

                        
                        <Route 
                            path='/dashboard' 
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            } 
                        />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;