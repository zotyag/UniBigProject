import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useReactToPrint } from 'react-to-print';
import { fetchDocuments, deleteDocument, fetchDocumentById } from '../api';
import { Button, Card, Badge, Spinner, Container, Row, Col, Modal } from 'react-bootstrap';
import Preview from '../components/PreviewForBuilder';

const Dashboard = () => {
	// --- HOOKS ---
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const previewRef = useRef(null);

	// --- STATE ---
	const [selectedDoc, setSelectedDoc] = useState(null);
	const [showPreview, setShowPreview] = useState(false);

	// --- Helpers ---

	const formatDate = (dateString) => {
		if (!dateString) return '';
		return new Date(dateString).toLocaleDateString('hu-HU', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	useEffect(() => {
		document.title = 'SmartCV - Dashboard';
	}, []);

	// --- Queries ---

	// Fetch all documents for the list view
	const {
		data: documents,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['documents'],
		queryFn: () => fetchDocuments(),
	});

	// --- Mutations ---

	// Fetch full details of a single document (Lazy loading)
	const fetchDocMutation = useMutation({
		mutationFn: fetchDocumentById,
		onSuccess: (data) => {
			console.log('Betöltött dokumentum (normalizálva):', data);
			setSelectedDoc(data);
			setShowPreview(true);
		},
		onError: () => alert('Nem sikerült betölteni a dokumentumot.'),
	});

	const deleteMutation = useMutation({
		mutationFn: deleteDocument,
		onSuccess: () => {
			queryClient.invalidateQueries(['documents']);
		},
		onError: (err) => alert('Hiba a törléskor: ' + err.message),
	});

	// --- PDF Print Logic ---

	const handlePrint = useReactToPrint({
		contentRef: previewRef,
		documentTitle: selectedDoc?.title || 'CV',
		pageStyle: `@page { size: A4; margin: 0; } @media print { body { -webkit-print-color-adjust: exact; } }`,
	});

	// --- Event Handlers ---

	const handleDelete = (e, id) => {
		e.stopPropagation();
		if (confirm('Biztosan törlöd?')) deleteMutation.mutate(id);
	};

	const handleOpenPreview = (id) => {
		fetchDocMutation.mutate(id);
	};

	// --- Render ---

	if (isLoading)
		return (
			<div className='text-center p-5'>
				<Spinner animation='border' variant='primary' />
			</div>
		);
	if (isError)
		return (
			<div className='text-center p-5 text-danger'>
				Hiba történt a dokumentumok betöltésekor.
			</div>
		);

	return (
		<div className='min-h-screen bg-gray-50 py-5'>
			<Container>
				<div className='d-flex justify-content-between align-items-center mb-5'>
					<h1 className='fw-bold text-gray-800 mb-1'>Dokumentumaim</h1>
					<div className='d-flex gap-2'>
						<Button variant='outline-primary' onClick={() => navigate('/cvbuilder')}>
							✏️ Kézi Szerkesztő
						</Button>
						<Button variant='primary' onClick={() => navigate('/cvgenerator')}>
							✨ AI Generátor
						</Button>
					</div>
				</div>

				{documents?.length === 0 ? (
					<div className='text-center py-5 bg-white rounded shadow-sm'>
						<h3 className='text-gray-400 mb-3'>Még nincs dokumentumod</h3>
					</div>
				) : (
					<Row xs={1} md={2} lg={3} className='g-4'>
						{documents.map((doc) => (
							<Col key={doc.id}>
								<Card className='h-100 shadow-sm hover:shadow-md border-0'>
									<Card.Body className='d-flex flex-column'>
										<div className='d-flex justify-content-between align-items-start mb-2'>
											<Badge
												bg={doc.doc_type === 'cv' ? 'info' : 'warning'}
												className='text-white'
											>
												{doc.doc_type}
											</Badge>
											<button
												className='btn-close'
												onClick={(e) => handleDelete(e, doc.id)}
											></button>
										</div>
										<Card.Title className='fw-bold text-primary mb-3 text-truncate'>
											{doc.title || 'Névtelen'}
										</Card.Title>
										<div className='mt-auto text-muted small mb-3'>
											Frissítve: {formatDate(doc.updated_at)}
										</div>
										<div className='mt-auto d-flex gap-2'>
											{/* SZERKESZTÉS GOMB */}
											<Button
												variant='primary'
												className='flex-fill btn-sm'
												onClick={() => navigate(`/cvbuilder/${doc.id}`)}
											>
												Szerkesztés
											</Button>
											<Button
												variant='info'
												className='flex-fill btn-sm'
												onClick={() => navigate(`/cvgenerator/${doc.id}`)}
											>
												AI szerkesztés
											</Button>
											<Button
												variant='outline-secondary'
												className='flex-fill btn-sm'
												onClick={() => handleOpenPreview(doc.id)}
												disabled={fetchDocMutation.isPending}
											>
												{fetchDocMutation.isPending &&
												fetchDocMutation.variables === doc.id
													? 'Betöltés...'
													: 'Megtekintés'}
											</Button>
										</div>
									</Card.Body>
								</Card>
							</Col>
						))}
					</Row>
				)}

				<Modal show={showPreview} onHide={() => setShowPreview(false)} size='xl' centered>
					<Modal.Header closeButton>
						<Modal.Title>{selectedDoc?.title}</Modal.Title>
					</Modal.Header>
					<Modal.Body
						className='bg-secondary bg-opacity-10 d-flex justify-content-center overflow-auto'
						style={{ maxHeight: '80vh' }}
					>
						{selectedDoc && (
							<div style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
								<Preview ref={previewRef} data={selectedDoc.cvData} />
							</div>
						)}
					</Modal.Body>
					<Modal.Footer>
						<Button variant='secondary' onClick={() => setShowPreview(false)}>
							Bezárás
						</Button>
						<Button variant='success' onClick={() => handlePrint()}>
							PDF Letöltése
						</Button>
					</Modal.Footer>
				</Modal>
			</Container>
		</div>
	);
};

export default Dashboard;
