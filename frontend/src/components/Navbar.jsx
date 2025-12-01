import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { useAuthStore } from '../stores/authStore.js';
import Button from 'react-bootstrap/Button';
import NavDropdown from 'react-bootstrap/NavDropdown';

function AppNavbar() {
	const navigate = useNavigate();

	// Zustand store hooks
	const user = useAuthStore((s) => s.user);
	const token = useAuthStore((s) => s.token);
	const fetchCurrentUser = useAuthStore((s) => s.fetchCurrentUser);
	const logoutStore = useAuthStore((s) => s.logout);

	const goToLogin = () => {
		navigate('/login');
	};

	useEffect(() => {
		if (token && !user) fetchCurrentUser();
	}, [token, user, fetchCurrentUser]);

	const logout = () => {
		logoutStore();
		navigate('/');
	};

	return (
		<Navbar
			bg='primary'
			data-bs-theme='dark'
			expand='md'
			sticky='top'
			className='shadow-sm'
			style={{ minHeight: '62px' }}
		>
			<Container fluid>
				<Navbar.Brand className='fw-bold fs-4'>SmartCV</Navbar.Brand>

				<Navbar.Toggle aria-controls='main-navbar' />

				<Navbar.Collapse id='main-navbar'>
					<Nav className='ms-3'>
						<Nav.Link as={Link} to='/' className='fw-semibold fs-5 !text-white'>
							Home
						</Nav.Link>
						<Nav.Link as={Link} to='/profile' className='fw-semibold fs-5 !text-white'>
							Profile
						</Nav.Link>
						<Nav.Link as={Link} to='/cvgenerator' className='fw-semibold fs-5 !text-white'>
							Generator
						</Nav.Link>
						<Nav.Link as={Link} to='/cvbuilder' className='fw-semibold fs-5 !text-white'>
							ManualCVBuilder
						</Nav.Link>
					</Nav>

					<Nav className='ms-auto'>
						{/* <Button variant='secondary' className='text-white' onClick={goToLogin}>
							Login
						</Button> */}
						{/*? Replacement login button for when login and user session are both properly implemented */}
						{/* <Nav.Link className='fw-semibold fs-5 !text-white'>
							{user ? (
								<>
									<span className='mr-4'>Welcome, {user.user.username}</span>
									<button onClick={logout} className='bg-red-500 px-3 py-1 rounded'>
										Logout
									</button>
								</>
							) : (
								<button onClick={goToLogin} className='bg-red-500 px-3 py-1 rounded'>
									Login
								</button>
							)}
						</Nav.Link> */}
						{/* {user ? (
							<>
								<span className='text-white me-3 align-self-center'>
									Welcome, {user.username}
								</span>
								<Button variant='outline-light' className='text-white' onClick={logout}>
									Logout
								</Button>
							</>
						) : (
							<Button variant='secondary' className='text-white' onClick={goToLogin}>
								Login
							</Button>
						)} */}

						<Nav className='ms-auto'>
							{user ? (
								<NavDropdown
									title={<span className='text-white'>{user.username}</span>}
									id='user-nav-dropdown'
									align='end'
								>
									<NavDropdown.Item as={Link} to='/settings'>
										Settings
									</NavDropdown.Item>
									<NavDropdown.Divider />
									<NavDropdown.Item
										onClick={() => {
											logout();
										}}
									>
										Logout
									</NavDropdown.Item>
								</NavDropdown>
							) : (
								<Button variant='secondary' className='text-white' onClick={goToLogin}>
									Login
								</Button>
							)}
						</Nav>
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
}

export default AppNavbar;
