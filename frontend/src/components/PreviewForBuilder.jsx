import React, { forwardRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProfilePicture } from '../api';

const Preview = forwardRef(({ data = {} }, ref) => {
	// --- Props Destructuring with Defaults ---
	const {
		personal_info = {},
		summary = '',
		education = [],
		experience = [],
		skills = {},
	} = data || {};

	// --- PROFILKÉP LEKÉRÉSE ---
	const { data: avatarData } = useQuery({
		queryKey: ['userAvatar'],
		queryFn: getProfilePicture,
		staleTime: Infinity,
		retry: false,
	});

	const displayImage = data.profilePictureUrl || avatarData?.url;

	// --- Style Definitions ---

	const cellStyle = {
		padding: '4px',
		verticalAlign: 'top',
		border: '1px solid #9ca3af',
		wordBreak: 'break-word',
	};
	const listStyle = { margin: 0, paddingLeft: '15px', listStyleType: 'disc' };

	// --- Helper Functions ---

	// Check if any skill category has items
	const hasAnySkill =
		(skills.core_competencies && skills.core_competencies.length > 0) ||
		(skills.software_proficiency && skills.software_proficiency.length > 0) ||
		(skills.language_fluency && skills.language_fluency.length > 0);

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
			{/* HEADER (personal_info)*/}
			<div className='flex justify-between items-start mb-6 border-b-2 border-black pb-4'>
				<div className='flex-1'>
					<h1 className='text-3xl font-bold uppercase mb-1'>
						{personal_info.full_name || 'Név'}
					</h1>
					<p className='text-xl text-gray-600 mb-3'>{personal_info.title || 'Pozíció'}</p>

					<div className='text-sm leading-relaxed text-gray-700'>
						<div className='flex flex-wrap gap-x-4'>
							{personal_info.email && <span>📧 {personal_info.email}</span>}
							{personal_info.phone && <span>📱 {personal_info.phone}</span>}
							{personal_info.location && <span>📍 {personal_info.location}</span>}
						</div>
						<div className='flex flex-wrap gap-x-4 mt-1'>
							{personal_info.linkedin && <span>🔗 {personal_info.linkedin}</span>}
							{personal_info.website && <span>🌐 {personal_info.website}</span>}
						</div>
					</div>
				</div>

				{/* KÉP MEGJELENÍTÉSE */}
				{displayImage && (
					<div className='ml-6 flex-shrink-0'>
						<div className='w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center'>
							<img src={displayImage} alt='Profil' className='w-full h-full object-cover' />
						</div>
					</div>
				)}
			</div>

			{/* SUMMARY */}
			{summary && (
				<div className='mb-6'>
					<h2 className='text-lg font-bold uppercase mb-2 border-b border-gray-300 pb-1'>
						Röviden magamról
					</h2>
					<p className='text-justify whitespace-pre-line text-sm'>{summary}</p>
				</div>
			)}

			{/* EDUCATION  */}
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
									<td style={cellStyle} className='bg-gray-50'>
										<div className='font-bold'>{edu.institution}</div>
										<div className='text-xs text-gray-600 mt-1'>
											{edu.startDate && edu.endDate
												? `${edu.startDate} - ${edu.endDate}`
												: edu.graduation_date || ''}
										</div>
									</td>
									<td style={cellStyle}>
										<div className='font-bold'>{edu.degree}</div>
										<div className='text-gray-700'>{edu.field || edu.field_of_study}</div>
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

			{/* EXPERIENCE */}
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
											{exp.start_date || exp.startDate} -{' '}
											{exp.end_date || exp.endDate || 'Jelenleg'}
										</div>
										<div className='text-xs text-gray-500 mt-1 italic'>
											{exp.location}
										</div>
									</td>
									<td style={cellStyle}>
										<div className='font-bold mb-1 text-primary-700'>
											{exp.position || exp.title}
										</div>

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

			{/* SKILLS */}
			{hasAnySkill && (
				<div className='mb-6'>
					<h2 className='text-lg font-bold uppercase mb-2 border-b border-gray-300 pb-1'>
						Készségek
					</h2>
					<div className='grid grid-cols-2 gap-4'>
						{skills.core_competencies?.length > 0 && (
							<div className='mb-2'>
								<h3 className='font-bold text-sm text-gray-800 border-b border-gray-200 mb-1'>
									Kompetenciák
								</h3>
								<p className='text-sm leading-relaxed'>
									{skills.core_competencies.join(' • ')}
								</p>
							</div>
						)}

						{skills.software_proficiency?.length > 0 && (
							<div className='mb-2'>
								<h3 className='font-bold text-sm text-gray-800 border-b border-gray-200 mb-1'>
									Szoftverek
								</h3>
								<p className='text-sm leading-relaxed'>
									{skills.software_proficiency.join(' • ')}
								</p>
							</div>
						)}

						{skills.language_fluency?.length > 0 && (
							<div className='mb-2'>
								<h3 className='font-bold text-sm text-gray-800 border-b border-gray-200 mb-1'>
									Nyelvek
								</h3>
								<p className='text-sm leading-relaxed'>
									{skills.language_fluency.join(' • ')}
								</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
});

export default Preview;
