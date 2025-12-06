import { useState, useRef } from 'react';
import { Accordion, Form, Button, Card, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDocument } from '../api';
import Preview from '../components/PreviewForBuilder';
import { useReactToPrint } from 'react-to-print';

const ManualCVBuilder = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const previewRef = useRef(null);

	// --- STATE (MongoDB Sémára igazítva) ---
	const [cvData, setCvData] = useState({
		profile: {
			name: '',
			title: '',
			summary: '',
		},
		contact: {
			email: '',
			phone: '',
			location: '',
			linkedin: '',
			website: '',
		},
		profilePictureUrl: null,
		experience: [],
		education: [],
		skills: [
			{ category: 'Software Proficiency', items: [] },
			{ category: 'Languages', items: [] },
			{ category: 'Core Competencies', items: [] },
		],
	});

	const [showSaveModal, setShowSaveModal] = useState(false);
	const [docTitle, setDocTitle] = useState('');

	// --- PDF ---
	const handlePrint = useReactToPrint({
		contentRef: previewRef,
		documentTitle: cvData.profile.name || 'CV',
		pageStyle: `@page { size: A4; margin: 0; } @media print { body { -webkit-print-color-adjust: exact; } }`,
	});

	// --- MENTÉS ---
	const saveMutation = useMutation({
		mutationFn: createDocument,
		onSuccess: () => {
			queryClient.invalidateQueries(['documents']);
			alert('Sikeres mentés!');
			navigate('/dashboard');
		},
		onError: (err) => alert('Hiba a mentéskor: ' + err.message),
	});

	const handleSaveSubmit = () => {
		if (!docTitle.trim()) return alert('Adj meg egy címet!');
		saveMutation.mutate({ title: docTitle, cvData });
		setShowSaveModal(false);
	};

	// --- KEZELŐK ---

	// Profile és Contact kezelése
	const handleNestedChange = (section, field, value) => {
		setCvData((prev) => ({
			...prev,
			[section]: { ...prev[section], [field]: value },
		}));
	};

	// Kép feltöltés (Base64)
	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setCvData((prev) => ({ ...prev, profilePictureUrl: reader.result }));
			};
			reader.readAsDataURL(file);
		}
	};

	// Listák (Exp, Edu) kezelése
	const addItem = (section, template) => {
		setCvData((prev) => ({ ...prev, [section]: [...prev[section], template] }));
	};

	const updateListItem = (section, index, field, value) => {
		setCvData((prev) => {
			const newList = [...prev[section]];
			newList[index] = { ...newList[index], [field]: value };
			return { ...prev, [section]: newList };
		});
	};

	const deleteListItem = (section, index) => {
		setCvData((prev) => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }));
	};

	// --- JAVÍTOTT SKILL KEZELÉS (onBlur alapú) ---
	// Csak akkor frissítjük a state-et (és alakítjuk tömbbé), amikor a user befejezte az írást (kikattint).
	// Ez megoldja a "vessző eltűnés" problémát.
	const handleSkillBlur = (categoryName, valueString) => {
		const itemsArray = valueString
			.split(',')
			.map((s) => s.trim())
			.filter((s) => s !== '');

		setCvData((prev) => {
			const newSkills = prev.skills.map((skill) => {
				if (skill.category === categoryName) {
					return { ...skill, items: itemsArray };
				}
				return skill;
			});
			return { ...prev, skills: newSkills };
		});
	};

	// Segéd a skill input megjelenítéséhez (Tömb -> String)
	const getSkillString = (categoryName) => {
		const skill = cvData.skills.find((s) => s.category === categoryName);
		return skill ? skill.items.join(', ') : '';
	};

	return (
		<div className='d-flex flex-column flex-lg-row h-screen bg-gray-100 overflow-hidden'>
			{/* BAL OSZLOP: SZERKESZTŐ */}
			<div className='col-lg-4 col-xl-3 d-flex flex-column h-100 bg-white border-end shadow-sm overflow-hidden'>
				<div className='p-3 border-bottom bg-light d-flex justify-content-between align-items-center'>
					<h4 className='m-0 fw-bold text-primary'>Kézi Szerkesztő</h4>
					<div className='d-flex gap-2'>
						<Button variant='primary' size='sm' onClick={() => setShowSaveModal(true)}>
							Mentés
						</Button>
						<Button variant='success' size='sm' onClick={() => handlePrint()}>
							PDF
						</Button>
					</div>
				</div>

				<div className='flex-grow-1 overflow-y-auto p-3'>
					<Accordion defaultActiveKey='0'>
						{/* 1. PROFIL & KAPCSOLAT */}
						<Accordion.Item eventKey='0'>
							<Accordion.Header>Személyes Adatok</Accordion.Header>
							<Accordion.Body>
								<Form.Group className='mb-2'>
									<Form.Label>Név</Form.Label>
									<Form.Control
										value={cvData.profile.name}
										onChange={(e) =>
											handleNestedChange('profile', 'name', e.target.value)
										}
									/>
								</Form.Group>
								<Form.Group className='mb-2'>
									<Form.Label>Pozíció / Titulus</Form.Label>
									<Form.Control
										value={cvData.profile.title}
										onChange={(e) =>
											handleNestedChange('profile', 'title', e.target.value)
										}
									/>
								</Form.Group>
								<Form.Group className='mb-2'>
									<Form.Label>Email</Form.Label>
									<Form.Control
										type='email'
										value={cvData.contact.email}
										onChange={(e) =>
											handleNestedChange('contact', 'email', e.target.value)
										}
									/>
								</Form.Group>
								<Form.Group className='mb-2'>
									<Form.Label>Telefon</Form.Label>
									<Form.Control
										value={cvData.contact.phone}
										onChange={(e) =>
											handleNestedChange('contact', 'phone', e.target.value)
										}
									/>
								</Form.Group>
								<Form.Group className='mb-2'>
									<Form.Label>Lakcím</Form.Label>
									<Form.Control
										value={cvData.contact.location}
										onChange={(e) =>
											handleNestedChange('contact', 'location', e.target.value)
										}
									/>
								</Form.Group>
								<Form.Group className='mb-2'>
									<Form.Label>LinkedIn</Form.Label>
									<Form.Control
										value={cvData.contact.linkedin || ''}
										onChange={(e) =>
											handleNestedChange('contact', 'linkedin', e.target.value)
										}
									/>
								</Form.Group>
								<Form.Group className='mb-2'>
									<Form.Label>Weboldal</Form.Label>
									<Form.Control
										value={cvData.contact.website || ''}
										onChange={(e) =>
											handleNestedChange('contact', 'website', e.target.value)
										}
									/>
								</Form.Group>
								<Form.Group className='mb-3'>
									<Form.Label>Kép</Form.Label>
									<Form.Control
										type='file'
										accept='image/*'
										onChange={handleImageUpload}
									/>
								</Form.Group>
							</Accordion.Body>
						</Accordion.Item>

						{/* 2. RÖVIDEN MAGAMRÓL */}
						<Accordion.Item eventKey='1'>
							<Accordion.Header>Röviden magamról</Accordion.Header>
							<Accordion.Body>
								<Form.Control
									as='textarea'
									rows={4}
									placeholder='Írj magadról...'
									value={cvData.profile.summary}
									onChange={(e) =>
										handleNestedChange('profile', 'summary', e.target.value)
									}
								/>
							</Accordion.Body>
						</Accordion.Item>

						{/* 3. TANULMÁNYOK */}
						<Accordion.Item eventKey='2'>
							<Accordion.Header>Tanulmányok</Accordion.Header>
							<Accordion.Body>
								{cvData.education.map((edu, idx) => (
									<Card key={idx} className='mb-3 bg-light border-0'>
										<Card.Body className='p-2'>
											<div className='text-end mb-1'>
												<Button
													variant='outline-danger'
													size='sm'
													onClick={() => deleteListItem('education', idx)}
												>
													X
												</Button>
											</div>
											<Form.Control
												className='mb-1'
												placeholder='Intézmény'
												value={edu.institution}
												onChange={(e) =>
													updateListItem(
														'education',
														idx,
														'institution',
														e.target.value,
													)
												}
											/>
											<Form.Control
												className='mb-1'
												placeholder='Végzettség'
												value={edu.degree}
												onChange={(e) =>
													updateListItem('education', idx, 'degree', e.target.value)
												}
											/>
											<Form.Control
												className='mb-1'
												placeholder='Szak'
												value={edu.field}
												onChange={(e) =>
													updateListItem('education', idx, 'field', e.target.value)
												}
											/>
											<div className='d-flex gap-1'>
												<Form.Control
													placeholder='Kezdés'
													value={edu.startDate}
													onChange={(e) =>
														updateListItem(
															'education',
															idx,
															'startDate',
															e.target.value,
														)
													}
												/>
												<Form.Control
													placeholder='Vége'
													value={edu.endDate}
													onChange={(e) =>
														updateListItem(
															'education',
															idx,
															'endDate',
															e.target.value,
														)
													}
												/>
											</div>
										</Card.Body>
									</Card>
								))}
								<Button
									variant='outline-primary'
									size='sm'
									className='w-100'
									onClick={() =>
										addItem('education', {
											institution: '',
											degree: '',
											field: '',
											startDate: '',
											endDate: '',
										})
									}
								>
									+ Új
								</Button>
							</Accordion.Body>
						</Accordion.Item>

						{/* 4. TAPASZTALATOK */}
						<Accordion.Item eventKey='3'>
							<Accordion.Header>Tapasztalatok</Accordion.Header>
							<Accordion.Body>
								{cvData.experience.map((exp, idx) => (
									<Card key={idx} className='mb-3 bg-light border-0'>
										<Card.Body className='p-2'>
											<div className='text-end mb-1'>
												<Button
													variant='outline-danger'
													size='sm'
													onClick={() => deleteListItem('experience', idx)}
												>
													X
												</Button>
											</div>
											<Form.Control
												className='mb-1'
												placeholder='Cég'
												value={exp.company}
												onChange={(e) =>
													updateListItem('experience', idx, 'company', e.target.value)
												}
											/>
											<Form.Control
												className='mb-1'
												placeholder='Pozíció'
												value={exp.position}
												onChange={(e) =>
													updateListItem('experience', idx, 'position', e.target.value)
												}
											/>
											<div className='d-flex gap-1 mb-1'>
												<Form.Control
													placeholder='Kezdés'
													value={exp.startDate}
													onChange={(e) =>
														updateListItem(
															'experience',
															idx,
															'startDate',
															e.target.value,
														)
													}
												/>
												<Form.Control
													placeholder='Vége'
													value={exp.endDate}
													onChange={(e) =>
														updateListItem(
															'experience',
															idx,
															'endDate',
															e.target.value,
														)
													}
												/>
											</div>
											{/* TEXTAREA JAVÍTVA: Sima stringként kezeljük */}
											<Form.Control
												as='textarea'
												rows={4}
												placeholder='Feladatok leírása...'
												value={exp.description}
												onChange={(e) =>
													updateListItem(
														'experience',
														idx,
														'description',
														e.target.value,
													)
												}
											/>
										</Card.Body>
									</Card>
								))}
								<Button
									variant='outline-primary'
									size='sm'
									className='w-100'
									onClick={() =>
										addItem('experience', {
											company: '',
											position: '',
											startDate: '',
											endDate: '',
											description: '',
										})
									}
								>
									+ Új
								</Button>
							</Accordion.Body>
						</Accordion.Item>

						{/* 5. KÉSZSÉGEK - JAVÍTVA (defaultValue + onBlur) */}
						<Accordion.Item eventKey='4'>
							<Accordion.Header>Készségek</Accordion.Header>
							<Accordion.Body>
								<Form.Group className='mb-2'>
									<Form.Label>Szoftverek (vesszővel)</Form.Label>
									<Form.Control
										as='textarea'
										rows={2}
										// defaultValue-t használunk, hogy ne írja felül gépelés közben
										defaultValue={getSkillString('Software Proficiency')}
										onBlur={(e) =>
											handleSkillBlur('Software Proficiency', e.target.value)
										}
									/>
								</Form.Group>
								<Form.Group className='mb-2'>
									<Form.Label>Nyelvek (vesszővel)</Form.Label>
									<Form.Control
										as='textarea'
										rows={2}
										defaultValue={getSkillString('Languages')}
										onBlur={(e) => handleSkillBlur('Languages', e.target.value)}
									/>
								</Form.Group>
								<Form.Group>
									<Form.Label>Egyéb Kompetenciák</Form.Label>
									<Form.Control
										as='textarea'
										rows={2}
										defaultValue={getSkillString('Core Competencies')}
										onBlur={(e) => handleSkillBlur('Core Competencies', e.target.value)}
									/>
								</Form.Group>
							</Accordion.Body>
						</Accordion.Item>
					</Accordion>
				</div>
			</div>

			{/* JOBB OSZLOP: PREVIEW */}
			<div className='col-lg-8 col-xl-9 bg-secondary bg-opacity-25 h-100 overflow-auto d-flex justify-content-center p-4'>
				<div style={{ transform: 'scale(0.9)', transformOrigin: 'top center' }}>
					<Preview ref={previewRef} data={cvData} />
				</div>
			</div>

			{/* MODAL */}
			<Modal show={showSaveModal} onHide={() => setShowSaveModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>Mentés</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form.Control
						placeholder='Dokumentum neve'
						value={docTitle}
						onChange={(e) => setDocTitle(e.target.value)}
						autoFocus
					/>
				</Modal.Body>
				<Modal.Footer>
					<Button variant='secondary' onClick={() => setShowSaveModal(false)}>
						Mégse
					</Button>
					<Button variant='primary' onClick={handleSaveSubmit}>
						Mentés
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default ManualCVBuilder;
