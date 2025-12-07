function Footer() {
	const hideOnPaths = ['/login', '/register'];

	if (hideOnPaths.includes(location.pathname)) {
		return null;
	}
	return (
		<footer
			className='bg-gray-800 text-white text-center flex justify-center items-center'
			style={{ height: '54px' }}
		>
			© {new Date().getFullYear()} SmartCV. All rights reserved.
		</footer>
	);
}

export default Footer;
