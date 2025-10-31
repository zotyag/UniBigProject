function Footer() {
	return (
		<footer
			className='bg-gray-800 text-white text-center flex justify-center items-center'
			style={{ height: '54px' }}
		>
			© {new Date().getFullYear()} MySite. All rights reserved.
		</footer>
	);
}

export default Footer;
