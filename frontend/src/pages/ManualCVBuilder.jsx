import { useState, useRef, useEffect } from 'react';
import { Accordion, Form, Button, Card, Modal, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useReactToPrint } from 'react-to-print';
import { createDocument, updateDocument, fetchDocumentById } from '../api';
import Preview from '../components/PreviewForBuilder';

const ManualCVBuilder = () => {
	// --- HOOKS ---
	const { id } = useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const previewRef = useRef(null);

	// --- STATE: CV Data ---
	const [cvData, setCvData] = useState({
		personal_info: {
			full_name: '',
			email: '',
			phone: '',
			title: '',
			linkedin: '',
			website: '',
			location: '',
		},
		profilePictureUrl: null,
		summary: '',
		experience: [],
		education: [],
		skills: {
			core_competencies: [],
			software_proficiency: [],
			language_fluency: [],
		},
	});

	// --- STATE: UI ---
	const [showSaveModal, setShowSaveModal] = useState(false);
	const [docTitle, setDocTitle] = useState('');

	// --- Queries ---

	// Fetch existing document if editing
	const { data: existingDoc, isLoading: isLoadingDoc } = useQuery({
		queryKey: ['document', id],
		queryFn: () => fetchDocumentById(id),
		enabled: !!id,
	});

	// -- - EFFECTS ---
	useEffect(() => {
		document.title = 'SmartCV - Manual CV Builder';
	}, []);

	// Load existing document data into state
	useEffect(() => {
		if (existingDoc) {
			const content =
				existingDoc.cvData || existingDoc.content_json || existingDoc.user_data || {};

			setDocTitle(existingDoc.title || '');

			setCvData((prev) => ({ ...prev, ...content }));
		}
	}, [existingDoc]);

	// --- PDF Print Configuration ---
	const handlePrint = useReactToPrint({
		contentRef: previewRef,
		documentTitle: cvData.personal_info.full_name || 'CV',
		pageStyle: `@page { size: A4; margin: 0; } @media print { body { -webkit-print-color-adjust: exact; } }`,
	});

	// --- Mutations ---

	const saveMutation = useMutation({
		mutationFn: (data) => (id ? updateDocument({ id, ...data }) : createDocument(data)),
		onSuccess: () => {
			queryClient.invalidateQueries(['documents']);
			alert(id ? 'Sikeres frissítés!' : 'Sikeres mentés!');
			navigate('/dashboard');
		},
		onError: (err) => alert('Hiba a mentéskor: ' + err.message),
	});

	// --- Handlers: Save ---

	const handleSaveSubmit = () => {
		if (!docTitle.trim()) return alert('Adj meg egy címet!');
		saveMutation.mutate({ title: docTitle, cvData });
		setShowSaveModal(false);
	};

	// --- Handlers: Input Changes ---

	const handleInfoChange = (field, value) => {
		setCvData((prev) => ({
			...prev,
			personal_info: { ...prev.personal_info, [field]: value },
		}));
	};

	const handleSummaryChange = (val) => {
		setCvData((prev) => ({ ...prev, summary: val }));
	};

	// --- Handlers: List Items (Education, Experience) ---

	const addItem = (section, template) =>
		setCvData((prev) => ({ ...prev, [section]: [...prev[section], template] }));

	const updateListItem = (section, index, field, value) => {
		setCvData((prev) => {
			const newList = [...prev[section]];
			newList[index] = { ...newList[index], [field]: value };
			return { ...prev, [section]: newList };
		});
	};

	const deleteListItem = (section, index) =>
		setCvData((prev) => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }));

	// --- Handlers: Skills ---
	const handleSkillChange = (category, value) => {
		const skillsArray = value
			.split(',')
			.map((s) => s.trim())
			.filter((s) => s !== '');
		setCvData((prev) => ({
			...prev,
			skills: { ...prev.skills, [category]: skillsArray },
		}));
	};

	if (isLoadingDoc)
		return (
			<div className='text-center p-10'>
				<Spinner animation='border' /> Betöltés...
			</div>
		);

	return (
		<div className='d-flex flex-column flex-lg-row h-screen bg-gray-100 overflow-hidden'>
			{/* BAL OSZLOP */}
			<div className='col-lg-4 col-xl-3 d-flex flex-column h-100 bg-white border-end shadow-sm overflow-hidden'>
				{/* Header */}
				<div className='p-3 border-bottom bg-light d-flex justify-content-between align-items-center'>
					<h4 className='m-0 fw-bold text-primary'>Kézi Szerkesztő</h4>
					<div>
						<Button
							variant='primary'
							size='sm'
							onClick={() => setShowSaveModal(true)}
							className='me-2'
						>
							Mentés
						</Button>
						<Button variant='success' size='sm' onClick={() => handlePrint()}>
							PDF
						</Button>
					</div>
				</div>

				<div className='flex-grow-1 overflow-y-auto p-3'>
					<Accordion defaultActiveKey='0'>
						{/* SZEMÉLYES ADATOK */}
						<Accordion.Item eventKey='0'>
							<Accordion.Header>Személyes Adatok</Accordion.Header>
							<Accordion.Body>
								<Form.Group className='mb-2'>
									<Form.Label>Név</Form.Label>
									<Form.Control
										value={cvData.personal_info.full_name}
										onChange={(e) => handleInfoChange('full_name', e.target.value)}
									/>
								</Form.Group>
								<Form.Group className='mb-2'>
									<Form.Label>Pozíció</Form.Label>
									<Form.Control
										value={cvData.personal_info.title}
										onChange={(e) => handleInfoChange('title', e.target.value)}
									/>
								</Form.Group>
								<Form.Group className='mb-2'>
									<Form.Label>Email</Form.Label>
									<Form.Control
										value={cvData.personal_info.email}
										onChange={(e) => handleInfoChange('email', e.target.value)}
									/>
								</Form.Group>
								<Form.Group className='mb-2'>
									<Form.Label>Telefon</Form.Label>
									<Form.Control
										value={cvData.personal_info.phone}
										onChange={(e) => handleInfoChange('phone', e.target.value)}
									/>
								</Form.Group>
								<Form.Group className='mb-2'>
									<Form.Label>Lakcím</Form.Label>
									<Form.Control
										value={cvData.personal_info.location}
										onChange={(e) => handleInfoChange('location', e.target.value)}
									/>
								</Form.Group>
								<Form.Group className='mb-2'>
									<Form.Label>LinkedIn</Form.Label>
									<Form.Control
										value={cvData.personal_info.linkedin}
										onChange={(e) => handleInfoChange('linkedin', e.target.value)}
									/>
								</Form.Group>
								<Form.Group className='mb-2'>
									<Form.Label>Weboldal</Form.Label>
									<Form.Control
										value={cvData.personal_info.website}
										onChange={(e) => handleInfoChange('website', e.target.value)}
									/>
								</Form.Group>
							</Accordion.Body>
						</Accordion.Item>

						{/* SUMMARY */}
						<Accordion.Item eventKey='1'>
							<Accordion.Header>Röviden magamról</Accordion.Header>
							<Accordion.Body>
								<Form.Control
									as='textarea'
									rows={4}
									value={cvData.summary}
									onChange={(e) => handleSummaryChange(e.target.value)}
								/>
							</Accordion.Body>
						</Accordion.Item>

						{/* EDUCATION */}
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
												value={edu.field_of_study}
												onChange={(e) =>
													updateListItem(
														'education',
														idx,
														'field_of_study',
														e.target.value,
													)
												}
											/>
											<Form.Control
												placeholder='Dátum'
												value={edu.graduation_date}
												onChange={(e) =>
													updateListItem(
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
									+ Új
								</Button>
							</Accordion.Body>
						</Accordion.Item>

						{/* EXPERIENCE */}
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
												placeholder='Beosztás'
												value={exp.title}
												onChange={(e) =>
													updateListItem('experience', idx, 'title', e.target.value)
												}
											/>
											<div className='d-flex gap-1 mb-1'>
												<Form.Control
													placeholder='Kezdés'
													value={exp.start_date}
													onChange={(e) =>
														updateListItem(
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
														updateListItem(
															'experience',
															idx,
															'end_date',
															e.target.value,
														)
													}
												/>
											</div>
											{/* TEXTAREA -> description (String) */}
											<Form.Control
												as='textarea'
												rows={3}
												placeholder='Feladatok'
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
											title: '',
											start_date: '',
											end_date: '',
											description: '',
										})
									}
								>
									+ Új
								</Button>
							</Accordion.Body>
						</Accordion.Item>

						{/* SKILLS */}
						<Accordion.Item eventKey='4'>
							<Accordion.Header>Készségek</Accordion.Header>
							<Accordion.Body>
								<Form.Group className='mb-2'>
									<Form.Label>Kompetenciák (vesszővel)</Form.Label>
									<Form.Control
										as='textarea'
										rows={2}
										defaultValue={cvData.skills.core_competencies.join(', ')}
										onBlur={(e) => handleSkillChange('core_competencies', e.target.value)}
										key={`core-${cvData.skills.core_competencies.join(',')}`}
									/>
								</Form.Group>

								<Form.Group className='mb-2'>
									<Form.Label>Szoftverek (vesszővel)</Form.Label>
									<Form.Control
										as='textarea'
										rows={2}
										defaultValue={cvData.skills.software_proficiency.join(', ')}
										onBlur={(e) =>
											handleSkillChange('software_proficiency', e.target.value)
										}
										key={`soft-${cvData.skills.software_proficiency.join(',')}`}
									/>
								</Form.Group>

								<Form.Group>
									<Form.Label>Nyelvek (vesszővel)</Form.Label>
									<Form.Control
										as='textarea'
										rows={2}
										defaultValue={cvData.skills.language_fluency.join(', ')}
										onBlur={(e) => handleSkillChange('language_fluency', e.target.value)}
										key={`lang-${cvData.skills.language_fluency.join(',')}`}
									/>
								</Form.Group>
							</Accordion.Body>
						</Accordion.Item>
					</Accordion>
				</div>
			</div>

			{/* JOBB OSZLOP */}
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
