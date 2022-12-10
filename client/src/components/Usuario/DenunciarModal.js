import React from "react";
import { useParams } from "react-router-dom";

import { crearAlerta } from '../Toast/Toast.js';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

const DenunciaModal = ({ mostrar, funcionCerrar }) => {

    const { id } = useParams();

    //

    const enviarDenuncia = async (event) => {
        event.preventDefault();

        //

        const razon = document.getElementById('denuncia-razon').value;

        var desactivarBtn = document.getElementById('denuncia-btn');
        desactivarBtn.disabled = true;

        const data = await fetch('/usuario/denuncia', { 
            method: 'POST',

            body: JSON.stringify({ 
                denunciadoId: id,
                mensaje: razon,
            }),
            
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();
        desactivarBtn.disabled = false;

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error en la base de datos!');

        } else if(items.respuesta === 'err_datos') {
            crearAlerta('error', '¡Los datos introducidos son incorrectos!');

        } else if(items.respuesta === 'err_validado') {
            crearAlerta('error', '¡Mira tu correo para validar la cuenta!');

        } else {
            crearAlerta('exito', '¡Denuncia enviada!');
        }
        funcionCerrar();
    };
    
    return (
        <Modal fullscreen={true} show={mostrar} onHide={funcionCerrar}>

            <Modal.Header closeButton>
                <Modal.Title>Denuncia usuario</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="container">

                    <div className="row">
                        <div className="col-sm-6 mx-auto">

                            <Form onSubmit={enviarDenuncia}>

                                <Form.Group className="mb-3" controlId="denuncia-razon">
                                    <Form.Label>Razón</Form.Label>
                                    <Form.Control as="textarea" placeholder="Describe el problema" required />
                                </Form.Group>
                            
                                <div className="d-grid gap-2">
                                    <Button type="submit" variant="success" id="denuncia-btn">
                                        Enviar
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>

            </Modal.Body>
        </Modal>
    );
}

export default DenunciaModal;
