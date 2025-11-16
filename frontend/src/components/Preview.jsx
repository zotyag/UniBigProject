import React, { forwardRef } from 'react';

/**
 * Simple A4 Preview component.
 * - fixed physical size: 210mm x 297mm (A4)
 * - prevents shrinking via min/max width and flex rules
 * - accepts `data` prop with basic cv fields
 */
const Preview = forwardRef(({ data = {} }, ref) => {
	// const { personalInfo = {}, summary = '', experience = [], education = [] } = data;

	const { personal_info = {}, summary = '', experience = [], education = [], skills = {} } = data;

	// Helper for placeholder data
	const experiencePlaceholder = [
		{
			title: 'Job Title',
			company: 'Company',
			start_date: '2020',
			end_date: 'Present',
			description_bullets: ['Your key responsibilities and achievements.'],
		},
	];

	const educationPlaceholder = [
		{
			degree: 'Degree',
			field_of_study: 'Field of Study',
			institution: 'School Name',
			graduation_date: '2020',
		},
	];

	return (
		<div
			ref={ref}
			className='cv-document shadow-lg bg-white'
			style={{
				width: '210mm',
				minWidth: '210mm',
				maxWidth: '210mm',
				flex: '0 0 210mm',
				height: '297mm',
				boxSizing: 'border-box',
				padding: '20mm',
				background: 'white',
				color: '#111827',
			}}
		>
			<header style={{ marginBottom: '8mm' }}>
				<h1 style={{ fontSize: '20pt', margin: 0, color: '#1f2937' }}>
					{personal_info?.full_name || 'Your Name'}
				</h1>
				<p style={{ fontSize: '11pt', margin: '2px 0', color: '#374151' }}>
					{personal_info?.title || 'Professional Title'}
				</p>
				<div style={{ fontSize: '10pt', color: '#4b5563', marginTop: '4mm' }}>
					{personal_info?.email || 'email@example.com'}
					{personal_info?.phone && ` · ${personal_info.phone}`}
					{personal_info?.location && ` · ${personal_info.location}`}
				</div>
			</header>

			<section style={{ marginBottom: '6mm' }}>
				<h2 style={styles.h2}>Summary</h2>
				<p style={styles.p}>
					{summary ||
						'Short professional summary describing your skills, experience, and goals.'}
				</p>
			</section>

			<section style={{ marginBottom: '6mm' }}>
				<h2 style={styles.h2}>Experience</h2>
				{(experience?.length ? experience : experiencePlaceholder).map((exp, i) => (
					<div key={i} style={{ marginBottom: '4mm' }}>
						<div style={styles.jobTitle}>
							{exp.title} — {exp.company}
						</div>
						<div style={styles.subTitle}>
							{exp.start_date} - {exp.end_date}
						</div>
						<ul style={styles.ul}>
							{exp.description_bullets?.map((bullet, j) => (
								<li key={j} style={styles.li}>
									{bullet}
								</li>
							))}
						</ul>
					</div>
				))}
			</section>

			<section style={{ marginBottom: '6mm' }}>
				<h2 style={styles.h2}>Education</h2>
				{(education?.length ? education : educationPlaceholder).map((ed, i) => (
					<div key={i} style={{ marginBottom: '4mm' }}>
						<div style={styles.jobTitle}>
							{ed.degree} — {ed.institution}
						</div>
						<div style={styles.subTitle}>
							{ed.field_of_study} · {ed.graduation_date}
						</div>
					</div>
				))}
			</section>

			<section>
				<h2 style={styles.h2}>Skills</h2>
				{skills?.core_competencies?.length > 0 && (
					<>
						<h3 style={styles.h3}>Core Competencies</h3>
						<p style={styles.p}>{skills.core_competencies.join(' · ')}</p>
					</>
				)}
				{skills?.software_proficiency?.length > 0 && (
					<>
						<h3 style={styles.h3}>Software Proficiency</h3>
						<p style={styles.p}>{skills.software_proficiency.join(' · ')}</p>
					</>
				)}
				{skills?.language_fluency?.length > 0 && (
					<>
						<h3 style={styles.h3}>Languages</h3>
						<p style={styles.p}>{skills.language_fluency.join(' · ')}</p>
					</>
				)}
			</section>
		</div>
	);
});

const styles = {
	h2: {
		fontSize: '12pt',
		margin: '0 0 4px 0',
		color: '#111827',
		borderBottom: '1px solid #e5e7eb',
		paddingBottom: '2px',
	},
	h3: {
		fontSize: '11pt',
		margin: '4px 0 2px 0',
		color: '#1f2937',
		fontWeight: 600,
	},
	p: {
		fontSize: '10pt',
		margin: 0,
		color: '#374151',
	},
	jobTitle: {
		fontWeight: 600,
		fontSize: '10pt',
		color: '#1f2937',
	},
	subTitle: {
		fontSize: '9pt',
		color: '#4b5563',
		margin: '1px 0',
	},
	ul: {
		margin: '4px 0',
		paddingLeft: '5mm',
	},
	li: {
		fontSize: '10pt',
		color: '#374151',
		marginBottom: '2px',
	},
};

export default Preview;
