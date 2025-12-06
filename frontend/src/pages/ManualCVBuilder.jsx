import { useState, useRef, useEffect } from 'react';
import { Accordion, Form, Button, Card, Modal, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom'; // useParams kell!
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createDocument, updateDocument, fetchDocumentById } from '../api'; // updateDocument kell!
import Preview from '../components/PreviewForBuilder';
import { useReactToPrint } from 'react-to-print';

const ManualCVBuilder = () => {
	const { id } = useParams(); // URL paraméter (ha van)
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const previewRef = useRef(null);

	// --- STATE ---
	const [cvData, setCvData] = useState({
		profile: { name: '', title: '', summary: '' },
		contact: { email: '', phone: '', location: '', linkedin: '', website: '' },
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

	// --- 1. ADATOK BETÖLTÉSE (CSAK SZERKESZTÉSKOR) ---
	const { data: existingDoc, isLoading: isLoadingDoc } = useQuery({
		queryKey: ['document', id],
		queryFn: () => fetchDocumentById(id),
		enabled: !!id, // Csak akkor fusson, ha van ID az URL-ben
	});

	// Ha megérkeztek az adatok, töltsük be a state-be
	useEffect(() => {
		if (existingDoc) {
			// Adatkinyerés (kompatibilitás miatt többet is megnézünk)
			const content =
				existingDoc.content_json || existingDoc.user_data || existingDoc.content || {};

			// 1. Cím beállítása
			setDocTitle(existingDoc.title || '');

			// 2. CV Adatok beállítása (összefésüljük az alapértelmezettel, hogy ne legyen undefined hiba)
			setCvData((prev) => ({
				...prev,
				...content,
				// A skills-nél biztosítani kell, hogy meglegyenek a kategóriák, ha esetleg hiányoznának
				skills: content.skills || prev.skills,
			}));
		}
	}, [existingDoc]);

	// --- PDF ---
	const handlePrint = useReactToPrint({
		contentRef: previewRef,
		documentTitle: cvData.profile.name || 'CV',
		pageStyle: `@page { size: A4; margin: 0; } @media print { body { -webkit-print-color-adjust: exact; } }`,
	});

	// --- MENTÉS (LÉTREHOZÁS VAGY FRISSÍTÉS) ---
	const saveMutation = useMutation({
		// Döntés: Ha van ID -> Update, ha nincs -> Create
		mutationFn: (data) => (id ? updateDocument({ id, ...data }) : createDocument(data)),

		onSuccess: () => {
			queryClient.invalidateQueries(['documents']);
			alert(id ? 'Sikeres frissítés!' : 'Sikeres mentés!');
			navigate('/dashboard');
		},
		onError: (err) => alert('Hiba a mentéskor: ' + err.message),
	});

	const handleSaveSubmit = () => {
		if (!docTitle.trim()) return alert('Adj meg egy címet!');
		saveMutation.mutate({ title: docTitle, cvData });
		setShowSaveModal(false);
	};

	// --- KEZELŐK (Változatlanok) ---
	const handleNestedChange = (section, field, value) => {
		setCvData((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
	};

	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () =>
				setCvData((prev) => ({ ...prev, profilePictureUrl: reader.result }));
			reader.readAsDataURL(file);
		}
	};

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

	const handleSkillChange = (categoryName, valueString) => {
		const itemsArray = valueString
			.split(',')
			.map((s) => s.trim())
			.filter((s) => s !== '');
		setCvData((prev) => {
			const newSkills = prev.skills.map((skill) => {
				if (skill.category === categoryName) return { ...skill, items: itemsArray };
				return skill;
			});
			return { ...prev, skills: newSkills };
		});
	};

	const getSkillValue = (categoryName) => {
		const skill = cvData.skills.find((s) => s.category === categoryName);
		return skill ? skill.items.join(', ') : '';
	};

	if (isLoadingDoc)
		return (
			<div className='text-center p-10'>
				<Spinner animation='border' variant='primary' /> Betöltés...
			</div>
		);

	return (
		<div className='d-flex flex-column flex-lg-row h-screen bg-gray-100 overflow-hidden'>
			{/* BAL OSZLOP */}
			<div className='col-lg-4 col-xl-3 d-flex flex-column h-100 bg-white border-end shadow-sm overflow-hidden'>
				<div className='p-3 border-bottom bg-light d-flex justify-content-between align-items-center'>
					<h4 className='m-0 fw-bold text-primary'>{id ? 'Szerkesztés' : 'Új CV'}</h4>
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
						{/* --- MEZŐK (Ugyanaz, mint eddig) --- */}
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
									<Form.Label>Pozíció</Form.Label>
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

						<Accordion.Item eventKey='1'>
							<Accordion.Header>Röviden magamról</Accordion.Header>
							<Accordion.Body>
								<Form.Control
									as='textarea'
									rows={4}
									value={cvData.profile.summary}
									onChange={(e) =>
										handleNestedChange('profile', 'summary', e.target.value)
									}
								/>
							</Accordion.Body>
						</Accordion.Item>

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
											<Form.Control
												as='textarea'
												rows={4}
												placeholder='Feladatok...'
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

						<Accordion.Item eventKey='4'>
							<Accordion.Header>Készségek</Accordion.Header>
							<Accordion.Body>
								<Form.Group className='mb-2'>
									<Form.Label>Szoftverek</Form.Label>
									<Form.Control
										as='textarea'
										rows={2}
										defaultValue={getSkillValue('Software Proficiency')}
										onBlur={(e) =>
											handleSkillChange('Software Proficiency', e.target.value)
										}
									/>
								</Form.Group>
								<Form.Group className='mb-2'>
									<Form.Label>Nyelvek</Form.Label>
									<Form.Control
										as='textarea'
										rows={2}
										defaultValue={getSkillValue('Languages')}
										onBlur={(e) => handleSkillChange('Languages', e.target.value)}
									/>
								</Form.Group>
								<Form.Group>
									<Form.Label>Egyéb Kompetenciák</Form.Label>
									<Form.Control
										as='textarea'
										rows={2}
										defaultValue={getSkillValue('Core Competencies')}
										onBlur={(e) => handleSkillChange('Core Competencies', e.target.value)}
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

			{/* MENTÉS MODAL */}
			<Modal show={showSaveModal} onHide={() => setShowSaveModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>{id ? 'Módosítások mentése' : 'Mentés'}</Modal.Title>
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
						{id ? 'Frissítés' : 'Mentés'}
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default ManualCVBuilder;
