import { useEffect } from 'react';

function CVGenerator() {
	useEffect(() => {
		document.title = 'CV Generator';
	}, []);

	return <div></div>;
}

export default CVGenerator;
