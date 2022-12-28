import React, { useRef } from "react";
import { useParams } from "react-router-dom";

import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

const DenunciaModal = ({ mostrar, funcionCerrar }) => {

    const denunciarInsultar = useRef();
    const denunciarEstafar = useRef();
    const denunciarSuplantar = useRef();
    
    const denunciaMensaje = useRef();

    const { id } = useParams();

    //

    const enviarDenuncia = async (event) => {
        event.preventDefault();

        //

        const mensaje = denunciaMensaje.current.value;
        if(mensaje.length < 20) {
            return crearAlerta('error', '¡Mensaje demasiado corto!')
        }

        var desactivarBtn = document.getElementById('denuncia-btn');
        desactivarBtn.disabled = true;

        const data = await fetch('/usuario/denunciar', { 
            method: 'POST',

            body: JSON.stringify({ 
                denunciadoId: id,
                mensaje: mensaje,

                insultar: denunciarInsultar.current.checked,
                estafar: denunciarEstafar.current.checked,
                suplantar: denunciarSuplantar.current.checked,
            }),
            
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();
        desactivarBtn.disabled = false;

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error en la base de datos!');

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

                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Razón / Razones
                                        <br/>
                                        <small className="text-muted">
                                            * Selecciona una o varias opciones.
                                        </small>
                                    </Form.Label>
                                    <Form.Check
                                        label="Insultar a otro usuario"
                                        type='checkbox'
                                        ref={denunciarInsultar}
                                    />
                                    <Form.Check
                                        label="Estafa en el alojamiento"
                                        type='checkbox'
                                        ref={denunciarEstafar}
                                    />
                                    <Form.Check
                                        label="Suplantación de identidad"
                                        type='checkbox'
                                        ref={denunciarSuplantar}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Mensaje</Form.Label>
                                    <Form.Control as="textarea" placeholder="Describe el problema" ref={denunciaMensaje} required />
                                </Form.Group>
                            
                                <div className="d-grid gap-2">
                                    <Button type="submit" className="crear-botones" id="denuncia-btn">
                                        <FontAwesomeIcon icon={faRightToBracket} /> Enviar
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
