import React from "react";

import { crearAlerta } from '../Toast/Toast.js';
import userLogin from '../../js/autorizado';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

const Login = ({ mostrar, funcionCerrar }) => {

    const { autorizado, setAutorizado } = userLogin();

    //
    
    const enviarLogin = async (event) => {
        event.preventDefault();
        
        const email = document.getElementById('log-email').value;
        const password = document.getElementById('log-password').value;

        var desactivarBtn = document.getElementById('log-btn');
        desactivarBtn.disabled = true;

        const data = await fetch('/login', { 
            method: 'POST',

            body: JSON.stringify({ 
                email: email,
                password: password
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
                setAutorizado(true);
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
                                <Form.Group className="mb-3" controlId="log-email">
                                    <Form.Label>Correo electrónico</Form.Label>
                                    <Form.Control type="email" placeholder="Escribe correo" required />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="log-password">
                                    <Form.Label>Contraseña</Form.Label>
                                    <Form.Control type="password" placeholder="Escribe contraseña" required />
                                </Form.Group>
                            
                                <div className="d-grid gap-2">
                                    <Button type="submit" variant="success" id="log-btn">
                                        Iniciar sesión
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