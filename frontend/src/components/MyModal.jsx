import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

function MyModalComponent() {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false); 
    const handleShow = () => setShow(true);   

    return (
        
        <>
            <Button variant="primary" onClick={handleShow}>
                Nyisd meg a Modalt!
            </Button>

            <Modal show={show} onHide={handleClose}>
                
                <Modal.Header closeButton>
                    <Modal.Title>Modal</Modal.Title>
                </Modal.Header>

                
                <Modal.Body>
                    Ide bármilyen JSX-et (HTML-t) betehetsz, akár egy másik komponenst is.
                </Modal.Body>

                
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Bezárás
                    </Button>
                    <Button variant="primary" onClick={handleClose}>
                        Mentés
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default MyModalComponent;