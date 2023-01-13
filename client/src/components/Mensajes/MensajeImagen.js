import React from "react";

import Modal from 'react-bootstrap/Modal';

const MensajeImagen = ({ imagen, funcionCerrar }) => {

    return(
        <Modal show={imagen !== null} onHide={funcionCerrar}>

            <Modal.Header closeButton>
                <Modal.Title>Imagen chat</Modal.Title>
            </Modal.Header>

            <Modal.Body className="text-center">
                <div className="container">
                    <div className="row">
                        <div className="col">
                            <img className='img-fluid' src={imagen} alt="Imagen del chat"/>
                        </div>
                    </div>

                </div>
            </Modal.Body>
        </Modal>
    );
};

export default MensajeImagen;