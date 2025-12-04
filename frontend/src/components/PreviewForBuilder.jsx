import React, { forwardRef } from 'react';

// forwardRef kell, hogy a szülő (Builder) hozzáférjen a DOM-hoz a nyomtatásnál
const Preview = forwardRef(({ data }, ref) => {
	// Biztonsági ellenőrzés, ha üres lenne az adat
	const {
		personal_info = {},
		summary = '',
		education = [],
		experience = [],
		skills = {},
	} = data || {};

	const ListStyles = {
		ul: { margin: 0, paddingLeft: '1.2em' },
		li: { marginBottom: '2px', lineHeight: '1.2' },
	};

	return (
		// A4-es papír konténer (Tailwind)
		<div
			ref={ref}
			className='bg-white text-black p-[20mm] mx-auto shadow-lg'
			style={{
				width: '210mm',
				minHeight: '296.8mm',
				fontFamily: 'Arial, Helvetica, sans-serif',
				fontSize: '11pt',
				lineHeight: '1.5',
			}}
		>
			{/* --- 1. HEADER (SZEMÉLYES ADATOK + KÉP) --- */}
			<div className='flex justify-between items-start mb-6'>
				{/* Bal oldal: Adatok */}
				<div className='flex-1'>
					<h2 className='text-xl font-bold uppercase mb-2 border-b-2 border-black pb-1'>
						Személyes adatok:
					</h2>
					<div className='leading-tight'>
						<p>
							<strong>Teljes név:</strong> {personal_info.full_name}
						</p>
						<p>
							<strong>Email:</strong> {personal_info.email}
						</p>
						<p>
							<strong>Tel.:</strong> {personal_info.phone}
						</p>
						<p>
							<strong>Lakcím:</strong> {personal_info.location}
						</p>
						{personal_info.linkedin && (
							<p>
								<strong>LinkedIn:</strong> {personal_info.linkedin}
							</p>
						)}
						{personal_info.website && (
							<p>
								<strong>Weboldal:</strong> {personal_info.website}
							</p>
						)}
					</div>
				</div>

				{/* Jobb oldal: Kép (Kör alakban) */}
				{data.profilePictureUrl && (
					<div className='ml-4 flex-shrink-0'>
						<div className='w-32 h-32 rounded-full overflow-hidden border-2 border-black flex items-center justify-center'>
							<img
								src={data.profilePictureUrl}
								alt='Profil'
								className='w-full h-full object-cover'
							/>
						</div>
					</div>
				)}
			</div>

			{/* --- 2. SUMMARY (RÖVIDEN MAGAMRÓL) --- */}
			{summary && (
				<div className='mb-6'>
					<h2 className='text-xl font-bold uppercase mb-2 border-b-2 border-black pb-1'>
						Röviden magamról:
					</h2>
					<p className='text-justify'>{summary}</p>
				</div>
			)}

			{/* --- 3. EDUCATION (TANULMÁNYOK - TÁBLÁZAT) --- */}
			{education.length > 0 && (
				<div className='mb-6'>
					<h2 className='text-xl font-bold uppercase mb-2 border-b-2 border-black pb-1'>
						Tanulmányok:
					</h2>
					<table className='w-full border-collapse border border-gray-400 text-sm'>
						<thead className='bg-gray-100'>
							<tr>
								<th className='border border-gray-400 p-1 text-left'>Intézmény</th>
								<th className='border border-gray-400 p-1 text-center'>Végzettség</th>
								<th className='border border-gray-400 p-1 text-center'>Szak</th>
								<th className='border border-gray-400 p-1 text-center'>Elvégzés dátuma</th>
							</tr>
						</thead>
						<tbody>
							{education.map((edu, idx) => (
								<tr key={idx}>
									<td className='border border-gray-400 p-1'>{edu.institution}</td>
									<td className='border border-gray-400 p-1 text-center'>{edu.degree}</td>
									<td className='border border-gray-400 p-1 text-center'>
										{edu.field_of_study}
									</td>
									<td className='border border-gray-400 p-1 text-center'>
										{edu.graduation_date}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* --- 4. EXPERIENCE (TAPASZTALATOK - TÁBLÁZAT) --- */}
			{/* --- 4. EXPERIENCE (TISZTA VERZIÓ) --- */}
			{experience.length > 0 && (
				<div className='mb-6'>
					<h2 className='text-xl font-bold uppercase mb-2 border-b-2 border-black pb-1'>
						Tapasztalatok:
					</h2>
					<table className='w-full border-collapse border border-gray-400 text-sm'>
						<thead className='bg-gray-100'>
							<tr>
								<th className='border border-gray-400 p-1 text-left'>Cég neve</th>
								<th className='border border-gray-400 p-1 text-center'>Beosztás</th>
								<th
									className='border border-gray-400 p-1 text-center'
									style={{ width: '100px' }}
								>
									Mettől-meddig
								</th>
								<th className='border border-gray-400 p-1 text-left'>
									Felelősségek/Feladatok
								</th>
							</tr>
						</thead>
						<tbody>
							{experience.map((exp, idx) => (
								<tr key={idx}>
									<td className='border border-gray-400 p-1 font-bold align-top'>
										{exp.company}
									</td>
									<td className='border border-gray-400 p-1 text-center align-top'>
										{exp.title}
									</td>
									<td className='border border-gray-400 p-1 text-center align-top'>
										{exp.start_date} - {exp.end_date || 'Jelenleg'}
									</td>
									<td className='border border-gray-400 p-1 align-top'>
										{/* Sima, egyszerű lista - a böngésző jól kezeli */}
										<ul className='list-disc list-inside m-0 pl-1'>
											{exp.description_bullets?.length > 0
												? exp.description_bullets.map((bull, i) => (
														<li key={i}>{bull}</li>
												  ))
												: exp.description
												? exp.description
														.split('\n')
														.map(
															(line, i) =>
																line.trim() !== '' && <li key={i}>{line}</li>,
														)
												: '-'}
										</ul>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* --- 5. SKILLS (KÉSZSÉGEK) --- */}
			{/* --- 5. SKILLS (KÉSZSÉGEK - HELYTAKARÉKOS 3 OSZLOP) --- */}
			<div className='mb-6'>
				<h2 className='text-xl font-bold uppercase mb-3 border-b-2 border-black pb-1'>
					Készségek:
				</h2>

				{/* Flex konténer a 3 oszlopnak */}
				<div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
					{/* 1. Oszlop: Fő készségek */}
					{skills.core_competencies?.length > 0 && (
						<div style={{ flex: 1 }}>
							<h3 className='font-bold text-sm uppercase text-gray-700 mb-1 border-b border-gray-300 pb-1'>
								Kompetenciák
							</h3>
							<p className='text-sm leading-snug'>{skills.core_competencies.join(' • ')}</p>
						</div>
					)}

					{/* 2. Oszlop: Szoftverek */}
					{skills.software_proficiency?.length > 0 && (
						<div style={{ flex: 1 }}>
							<h3 className='font-bold text-sm uppercase text-gray-700 mb-1 border-b border-gray-300 pb-1'>
								Szoftverek
							</h3>
							<p className='text-sm leading-snug'>
								{skills.software_proficiency.join(' • ')}
							</p>
						</div>
					)}

					{/* 3. Oszlop: Nyelvek */}
					{skills.language_fluency?.length > 0 && (
						<div style={{ flex: 1 }}>
							<h3 className='font-bold text-sm uppercase text-gray-700 mb-1 border-b border-gray-300 pb-1'>
								Nyelvek
							</h3>
							<p className='text-sm leading-snug'>{skills.language_fluency.join(' • ')}</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
});

export default Preview;
