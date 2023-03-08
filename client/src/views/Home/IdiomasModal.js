import React, { useState } from "react";

import idiomasWeb from '../../resources/idiomas.json';
import IdiomasModal from './IdiomasModal.css';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const Idiomas = ({ mostrar, funcionCerrar }) => {

    const [idiomasDisponibles, setIdiomasDisponibles] = useState(idiomasWeb);
    const [idioma, setIdioma] = useState('esp');

    //

    return(
        <Modal fullscreen={true} show={mostrar} onHide={funcionCerrar}>

            <Modal.Header closeButton>
                <Modal.Title>Selecciona tu idioma</Modal.Title>
            </Modal.Header>

            <Modal.Body>

                <div className="container-fluid">
                    <div className="row">
                        {
                            idiomasDisponibles.map((x, index) => (
                                <div className="col-sm-3 mb-3" key={index} >
                                    <Button 
                                        href={ idioma !== idiomasDisponibles[index].acortado ? '.'+x.acortado : ''}
                                        className="btn-idioma"
                                        style={{ border: idioma == x.acortado ? '1px solid black' : 'none' }}>

                                        <strong>
                                            {x.idioma}
                                        </strong>
                                        <br/>
                                        <small className="text-muted">
                                            {x.lugar}
                                        </small>
                                    </Button>
                                </div>
                            ))
                        }
                    </div>
                </div>

            </Modal.Body>
        </Modal>
    );
};

export default Idiomas;

