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

	// --- STATE ---
	// Kezdeti üres állapot a struktúránknak megfelelően
	const [cvData, setCvData] = useState({
		personal_info: {
			full_name: '',
			email: '',
			phone: '',
			location: '',
			linkedin: '',
			website: '',
		},
		profilePictureUrl: null, // Helyi URL a feltöltött képhez
		summary: '',
		education: [],
		experience: [],
		skills: {
			core_competencies: [],
			software_proficiency: [],
			language_fluency: [],
		},
	});

	// Mentés Modal State
	const [showSaveModal, setShowSaveModal] = useState(false);
	const [docTitle, setDocTitle] = useState('');

	// --- HANDLERS ---

	// Személyes adatok és Summary frissítése
	const handleInfoChange = (section, field, value) => {
		if (section === 'root') {
			// Pl. summary
			setCvData((prev) => ({ ...prev, [field]: value }));
		} else {
			// Pl. personal_info.full_name
			setCvData((prev) => ({
				...prev,
				[section]: { ...prev[section], [field]: value },
			}));
		}
	};

	// Kép feltöltés és előnézet (csak kliens oldalon)
	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			const url = URL.createObjectURL(file);
			setCvData((prev) => ({ ...prev, profilePictureUrl: url }));
		}
	};

	// --- LISTA KEZELŐK (Education, Experience) ---

	const addItem = (section, template) => {
		setCvData((prev) => ({
			...prev,
			[section]: [...prev[section], template],
		}));
	};

	const updateItem = (section, index, field, value) => {
		setCvData((prev) => {
			const newList = [...prev[section]];
			newList[index] = { ...newList[index], [field]: value };
			return { ...prev, [section]: newList };
		});
	};

	const deleteItem = (section, index) => {
		setCvData((prev) => ({
			...prev,
			[section]: prev[section].filter((_, i) => i !== index),
		}));
	};

	// --- SKILLS KEZELÉS (Vesszővel elválasztva) ---
	const handleSkillChange = (category, value) => {
		// String -> Array konverzió
		const skillsArray = value
			.split(',')
			.map((s) => s.trim())
			.filter((s) => s !== '');
		setCvData((prev) => ({
			...prev,
			skills: { ...prev.skills, [category]: skillsArray },
		}));
	};

	const handlePrint = useReactToPrint({
		// FIGYELEM: v3-ban 'contentRef'-et kell használni 'content' helyett!
		contentRef: previewRef,
		documentTitle: cvData.personal_info.full_name || 'CV',
		pageStyle: `
            @page {
                size: A4;
                margin: 0;
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                }
            }
        `,
	});

	const saveMutation = useMutation({
		mutationFn: createDocument,
		onSuccess: () => {
			// Sikeres mentés után frissítjük a listákat és visszamegyünk a Dashboardra
			queryClient.invalidateQueries(['documents']);
			alert('Sikeres mentés!');
			navigate('/'); // Vagy maradhatunk itt is, ha tovább akar szerkeszteni
		},
		onError: (err) => {
			alert('Hiba a mentéskor: ' + err.message);
		},
	});

	const handleSaveSubmit = () => {
		if (!docTitle.trim()) return alert('Adj meg egy címet!');
		saveMutation.mutate({ title: docTitle, cvData });
		setShowSaveModal(false);
	};

	return (
		<div className='d-flex flex-column flex-lg-row h-screen bg-gray-100 overflow-hidden'>
			{/* --- BAL OSZLOP: SZERKESZTŐ (Görgethető) --- */}
			<div className='col-lg-4 col-xl-3 d-flex flex-column h-100 bg-white border-end shadow-sm overflow-hidden'>
				<div className='p-3 border-bottom bg-light d-flex justify-content-between align-items-center'>
					<h4 className='m-0 fw-bold text-primary'>Kézi Szerkesztő</h4>
					<div className='d-flex gap-2'>
						{/* MENTÉS GOMB */}
						<Button variant='primary' size='sm' onClick={() => setShowSaveModal(true)}>
							Mentés
						</Button>
						{/* PDF GOMB */}
						<Button variant='success' size='sm' onClick={() => handlePrint()}>
							PDF
						</Button>
					</div>
				</div>

				<div className='flex-grow-1 overflow-y-auto p-3'>
					<Accordion defaultActiveKey='0'>
						{/* 1. SZEMÉLYES ADATOK */}
						<Accordion.Item eventKey='0'>
							<Accordion.Header>Személyes Adatok</Accordion.Header>
							<Accordion.Body>
								<Form.Group className='mb-2'>
									<Form.Label>Teljes név</Form.Label>
									<Form.Control
										type='text'
										value={cvData.personal_info.full_name}
										onChange={(e) =>
											handleInfoChange('personal_info', 'full_name', e.target.value)
										}
									/>
								</Form.Group>
								<Form.Group className='mb-2'>
									<Form.Label>Email</Form.Label>
									<Form.Control
										type='email'
										value={cvData.personal_info.email}
										onChange={(e) =>
											handleInfoChange('personal_info', 'email', e.target.value)
										}
									/>
								</Form.Group>
								<Form.Group className='mb-2'>
									<Form.Label>Telefon</Form.Label>
									<Form.Control
										type='text'
										value={cvData.personal_info.phone}
										onChange={(e) =>
											handleInfoChange('personal_info', 'phone', e.target.value)
										}
									/>
								</Form.Group>
								<Form.Group className='mb-2'>
									<Form.Label>Lakcím</Form.Label>
									<Form.Control
										type='text'
										value={cvData.personal_info.location}
										onChange={(e) =>
											handleInfoChange('personal_info', 'location', e.target.value)
										}
									/>
								</Form.Group>
								<Form.Group className='mb-2'>
									<Form.Label>LinkedIn URL</Form.Label>
									<Form.Control
										type='text'
										placeholder='https://linkedin.com/in/...'
										value={cvData.personal_info.linkedin || ''} // Biztonsági || '' ha undefined lenne
										onChange={(e) =>
											handleInfoChange('personal_info', 'linkedin', e.target.value)
										}
									/>
								</Form.Group>

								<Form.Group className='mb-2'>
									<Form.Label>Weboldal / Portfólió</Form.Label>
									<Form.Control
										type='text'
										placeholder='https://sajatom.hu'
										value={cvData.personal_info.website || ''}
										onChange={(e) =>
											handleInfoChange('personal_info', 'website', e.target.value)
										}
									/>
								</Form.Group>
								<Form.Group className='mb-3'>
									<Form.Label>Profilkép feltöltés</Form.Label>
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
									placeholder='Írj magadról pár mondatot...'
									value={cvData.summary}
									onChange={(e) => handleInfoChange('root', 'summary', e.target.value)}
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
											<div className='d-flex justify-content-end mb-1'>
												<Button
													variant='outline-danger'
													size='sm'
													onClick={() => deleteItem('education', idx)}
												>
													Törlés
												</Button>
											</div>
											<Form.Control
												className='mb-1'
												placeholder='Intézmény'
												value={edu.institution}
												onChange={(e) =>
													updateItem('education', idx, 'institution', e.target.value)
												}
											/>
											<Form.Control
												className='mb-1'
												placeholder='Végzettség (pl. BSc)'
												value={edu.degree}
												onChange={(e) =>
													updateItem('education', idx, 'degree', e.target.value)
												}
											/>
											<Form.Control
												className='mb-1'
												placeholder='Szak'
												value={edu.field_of_study}
												onChange={(e) =>
													updateItem(
														'education',
														idx,
														'field_of_study',
														e.target.value,
													)
												}
											/>
											<Form.Control
												placeholder='Dátum (pl. 2020-2024)'
												value={edu.graduation_date}
												onChange={(e) =>
													updateItem(
														'education',
														idx,
														'graduation_date',
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
										addItem('education', {
											institution: '',
											degree: '',
											field_of_study: '',
											graduation_date: '',
										})
									}
								>
									+ Új tanulmány
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
											<div className='d-flex justify-content-end mb-1'>
												<Button
													variant='outline-danger'
													size='sm'
													onClick={() => deleteItem('experience', idx)}
												>
													Törlés
												</Button>
											</div>
											<Form.Control
												className='mb-1'
												placeholder='Cég neve'
												value={exp.company}
												onChange={(e) =>
													updateItem('experience', idx, 'company', e.target.value)
												}
											/>
											<Form.Control
												className='mb-1'
												placeholder='Beosztás'
												value={exp.title}
												onChange={(e) =>
													updateItem('experience', idx, 'title', e.target.value)
												}
											/>
											<div className='d-flex gap-1 mb-1'>
												<Form.Control
													placeholder='Kezdés'
													value={exp.start_date}
													onChange={(e) =>
														updateItem(
															'experience',
															idx,
															'start_date',
															e.target.value,
														)
													}
												/>
												<Form.Control
													placeholder='Vége'
													value={exp.end_date}
													onChange={(e) =>
														updateItem('experience', idx, 'end_date', e.target.value)
													}
												/>
											</div>
											<Form.Control
												as='textarea'
												rows={2}
												placeholder='Feladatok (pontozott listához írd soronként)'
												value={exp.description}
												onChange={(e) => {
													// Itt most egyszerűsítve kezeljük: a beírt szöveg description lesz,
													// de a Preview-ban szétbonthatnánk soronként bullet pointokká.
													// Most a Preview-t úgy írtam meg, hogy a description_bullets-et várja, vagy a descriptiont.
													// Egyszerűsítsük: a description mezőt írjuk, és a Preview majd kiírja.
													updateItem('experience', idx, 'description', e.target.value);
												}}
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
											title: '',
											start_date: '',
											end_date: '',
											description: '',
										})
									}
								>
									+ Új munkahely
								</Button>
							</Accordion.Body>
						</Accordion.Item>

						{/* 5. KÉSZSÉGEK */}
						<Accordion.Item eventKey='4'>
							<Accordion.Header>Készségek</Accordion.Header>
							<Accordion.Body>
								<Form.Group className='mb-3'>
									<Form.Label>Fő készségek (vesszővel elválasztva)</Form.Label>
									<Form.Control
										as='textarea'
										rows={2}
										defaultValue={cvData.skills.core_competencies.join(', ')}
										onBlur={(e) => handleSkillChange('core_competencies', e.target.value)}
									/>
								</Form.Group>
								<Form.Group className='mb-3'>
									<Form.Label>Szoftverek (vesszővel elválasztva)</Form.Label>
									<Form.Control
										as='textarea'
										rows={2}
										defaultValue={cvData.skills.software_proficiency.join(', ')}
										onBlur={(e) =>
											handleSkillChange('software_proficiency', e.target.value)
										}
									/>
								</Form.Group>
								<Form.Group>
									<Form.Label>Nyelvek (vesszővel elválasztva)</Form.Label>
									<Form.Control
										as='textarea'
										rows={2}
										defaultValue={cvData.skills.language_fluency.join(', ')}
										onBlur={(e) => handleSkillChange('language_fluency', e.target.value)}
									/>
								</Form.Group>
							</Accordion.Body>
						</Accordion.Item>
					</Accordion>
				</div>
			</div>

			{/* --- JOBB OSZLOP: PREVIEW (Fix A4) --- */}
			<div className='col-lg-8 col-xl-9 bg-secondary bg-opacity-25 h-100 overflow-auto d-flex justify-content-center p-4'>
				<div style={{ transform: 'scale(0.9)', transformOrigin: 'top center' }}>
					<Preview ref={previewRef} data={cvData} />
				</div>
			</div>

			{/* --- MENTÉS MODAL --- */}
			<Modal show={showSaveModal} onHide={() => setShowSaveModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>CV Mentése</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form.Group>
						<Form.Label>Dokumentum neve</Form.Label>
						<Form.Control
							type='text'
							placeholder='pl. Programozó CV 2025'
							value={docTitle}
							onChange={(e) => setDocTitle(e.target.value)}
							autoFocus
						/>
					</Form.Group>
				</Modal.Body>
				<Modal.Footer>
					<Button variant='secondary' onClick={() => setShowSaveModal(false)}>
						Mégse
					</Button>
					<Button
						variant='primary'
						onClick={handleSaveSubmit}
						disabled={saveMutation.isPending}
					>
						{saveMutation.isPending ? 'Mentés...' : 'Mentés'}
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default ManualCVBuilder;
