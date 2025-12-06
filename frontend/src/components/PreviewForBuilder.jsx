import React, { forwardRef } from 'react';

const Preview = forwardRef(({ data = {} }, ref) => {
	// Alapértelmezett struktúra a MongoDB JSON alapján
	const {
		profile = {},
		contact = {},
		experience = [],
		education = [],
		skills = [], // Ez most már TÖMB, nem objektum!
	} = data || {};

	// Segédfüggvény a dátumokhoz
	const formatDate = (date) => date || '';

	// PDF-biztos stílusok
	const cellStyle = {
		padding: '8px',
		verticalAlign: 'top',
		border: '1px solid #9ca3af',
		wordBreak: 'break-word',
	};

	// JAVÍTÁS: Ellenőrizzük, hogy van-e TÉNYLEGES skill adat
	const hasAnySkill =
		Array.isArray(skills) &&
		skills.some((group) => Array.isArray(group.items) && group.items.length > 0);

	return (
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
			{/* --- 1. HEADER (Profile + Contact) --- */}
			<div className='flex justify-between items-start mb-6 border-b-2 border-black pb-4'>
				<div className='flex-1'>
					<h1 className='text-3xl font-bold uppercase mb-1'>{profile.name || 'Név'}</h1>
					<p className='text-xl text-gray-600 mb-3'>{profile.title || 'Pozíció'}</p>

					<div className='text-sm leading-relaxed text-gray-700'>
						<div className='flex flex-wrap gap-x-4'>
							{contact.email && <span>📧 {contact.email}</span>}
							{contact.phone && <span>📱 {contact.phone}</span>}
							{contact.location && <span>📍 {contact.location}</span>}
						</div>
						<div className='flex flex-wrap gap-x-4 mt-1'>
							{contact.linkedin && <span>🔗 {contact.linkedin}</span>}
							{contact.website && <span>🌐 {contact.website}</span>}
						</div>
					</div>
				</div>

				{data.profilePictureUrl && (
					<div className='ml-6 flex-shrink-0'>
						<div className='w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center'>
							<img
								src={data.profilePictureUrl}
								alt='Profil'
								className='w-full h-full object-cover'
							/>
						</div>
					</div>
				)}
			</div>

			{/* --- 2. SUMMARY (Profile) --- */}
			{profile.summary && (
				<div className='mb-6'>
					<h2 className='text-lg font-bold uppercase mb-2 border-b border-gray-300 pb-1'>
						Röviden magamról
					</h2>
					<p className='text-justify whitespace-pre-line text-sm'>{profile.summary}</p>
				</div>
			)}

			{/* --- 3. EDUCATION --- */}
			{education.length > 0 && (
				<div className='mb-6'>
					<h2 className='text-lg font-bold uppercase mb-2 border-b border-gray-300 pb-1'>
						Tanulmányok
					</h2>
					<table className='w-full border-collapse border border-gray-400 text-sm'>
						<thead className='bg-gray-100'>
							<tr>
								<th className='border border-gray-400 p-2 text-left w-1/4'>
									Intézmény / Dátum
								</th>
								<th className='border border-gray-400 p-2 text-left w-3/4'>Részletek</th>
							</tr>
						</thead>
						<tbody>
							{education.map((edu, idx) => (
								<tr key={idx}>
									<td style={cellStyle} className='bg-gray-5'>
										<div className='font-bold'>{edu.institution}</div>
										<div className='text-xs text-gray-600 mt-1'>
											{formatDate(edu.startDate)} - {formatDate(edu.endDate)}
										</div>
									</td>
									<td style={cellStyle}>
										<div className='font-bold'>{edu.degree}</div>
										<div className='text-gray-700'>{edu.field}</div>
										{edu.description && (
											<div className='text-xs text-gray-500 mt-1'>{edu.description}</div>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* --- 4. EXPERIENCE --- */}
			{experience.length > 0 && (
				<div className='mb-6'>
					<h2 className='text-lg font-bold uppercase mb-2 border-b border-gray-300 pb-1'>
						Szakmai Tapasztalat
					</h2>
					<table className='w-full border-collapse border border-gray-400 text-sm'>
						<thead className='bg-gray-100'>
							<tr>
								<th className='border border-gray-400 p-2 text-left w-1/4'>Cég / Dátum</th>
								<th className='border border-gray-400 p-2 text-left w-3/4'>Részletek</th>
							</tr>
						</thead>
						<tbody>
							{experience.map((exp, idx) => (
								<tr key={idx}>
									<td style={cellStyle} className='bg-gray-50'>
										<div className='font-bold'>{exp.company}</div>
										<div className='text-xs text-gray-600 mt-1'>
											{formatDate(exp.startDate)} -{' '}
											{formatDate(exp.endDate || 'Jelenleg')}
										</div>
										<div className='text-xs text-gray-500 mt-1 italic'>
											{exp.location}
										</div>
									</td>
									<td style={cellStyle}>
										<div className='font-bold mb-1 text-primary-700'>{exp.position}</div>
										<div className='whitespace-pre-line text-gray-700'>
											{exp.description || '-'}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* --- 5. SKILLS (Tömb alapú - JAVÍTOTT MEGJELENÍTÉS) --- */}
			{/* Csak akkor rendereljük a szekciót, ha van benne valami */}
			{hasAnySkill && (
				<div className='mb-6'>
					<h2 className='text-lg font-bold uppercase mb-2 border-b border-gray-300 pb-1'>
						Készségek
					</h2>
					<div className='grid grid-cols-2 gap-4'>
						{skills.map((skillGroup, idx) => {
							// Csak azokat a kategóriákat írjuk ki, ahol van elem
							if (!Array.isArray(skillGroup.items) || skillGroup.items.length === 0) {
								return null;
							}

							return (
								<div key={idx} className='mb-2'>
									<h3 className='font-bold text-sm text-gray-800 border-b border-gray-200 mb-1'>
										{skillGroup.category}
									</h3>
									<p className='text-sm leading-relaxed'>{skillGroup.items.join(' • ')}</p>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
});

export default Preview;
