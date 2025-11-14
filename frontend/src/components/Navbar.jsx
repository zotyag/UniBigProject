import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';

function AppNavbar() {
	const navigate = useNavigate();

	const goToLogin = () => {
		navigate('/login');
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
				<Navbar.Brand className='fw-bold fs-4'>MySite</Navbar.Brand>

				<Navbar.Toggle aria-controls='main-navbar' />

				<Navbar.Collapse id='main-navbar'>
					<Nav className='ms-3'>
						<Nav.Link as={Link} to='/' className='fw-semibold fs-5 !text-white'>
							Home
						</Nav.Link>
						<Nav.Link as={Link} to='/login' className='fw-semibold fs-5 !text-white'>
							Login
						</Nav.Link>
						<Nav.Link as={Link} to='/register' className='fw-semibold fs-5 !text-white'>
							Register
						</Nav.Link>
						<Nav.Link as={Link} to='/cvgenerator' className='fw-semibold fs-5 !text-white'>
							Generator
						</Nav.Link>
					</Nav>

					<Nav className='ms-auto'>
						<Button variant='secondary' className='text-white' onClick={goToLogin}>
							Login
						</Button>
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
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
}

export default AppNavbar;
