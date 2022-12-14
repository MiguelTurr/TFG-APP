import React from "react";

import Modal from 'react-bootstrap/Modal';

const FiltrosModal = ({ mostrar, funcionCerrar }) => {

    return(
        <Modal fullscreen={true} show={mostrar} onHide={funcionCerrar}>

            <Modal.Header closeButton>
                <Modal.Title>Filtros avanzados</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <h1>
                    Filtros
                </h1>

            </Modal.Body>
        </Modal>
    );
};

export default FiltrosModal;
