import React, { useRef } from "react";

import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

const Login = ({ mostrar, funcionCerrar, changeLogged }) => {

    const loginEmail = useRef();
    const loginPassword = useRef();

    //
    
    const enviarLogin = async (event) => {
        event.preventDefault();

        //

        var desactivarBtn = document.getElementById('log-btn');
        desactivarBtn.disabled = true;

        const data = await fetch('/cuenta/login', { 
            method: 'POST',

            body: JSON.stringify({ 
                email: loginEmail.current.value,
                password: loginPassword.current.value,
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
            
            crearAlerta('exito', 'Has iniciado sesión como ' +items.nombre);

            setTimeout(() => {
                changeLogged(true);
                window.location.href = '/';

            }, 1000);
        }
    };
    
    return (
        <Modal fullscreen={true} show={mostrar} onHide={funcionCerrar}>

            <Modal.Header closeButton>
                <Modal.Title>Inicia sesión</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="container">

                    <div className="row">
                        <div className="col-sm-6 mx-auto">

                            <Form onSubmit={enviarLogin}>

                                <Form.Group className="mb-3">
                                    <Form.Label>Correo electrónico</Form.Label>
                                    <Form.Control type="email" placeholder="Escribe correo" ref={loginEmail} required />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Contraseña</Form.Label>
                                    <Form.Control type="password" placeholder="Escribe contraseña" ref={loginPassword} required />
                                </Form.Group>
                            
                                <div className="d-grid gap-2">
                                    <Button type="submit" className="crear-botones" id="log-btn">
                                        <FontAwesomeIcon icon={faRightToBracket} /> Iniciar sesión
                                    </Button>

                                    <hr/>
                                    
                                    <a className="text-center" href="/nopassword">¿Has olvidado tu contraseña?</a>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>

            </Modal.Body>
        </Modal>
    );
}

export default Login;