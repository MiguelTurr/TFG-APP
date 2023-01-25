import React, { useRef } from "react";

import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function RecordarPassword() {

    const correoElectronico = useRef();

    const recordarPassword = async (event) => {
        event.preventDefault();

        //

        const desactivarBtn = document.getElementById('recordar-btn');
        desactivarBtn.disabled = true;

        const data = await fetch('/cuenta/recordar-password', { 
            method: 'POST',

            body: JSON.stringify({ 
                email: correoElectronico.current.value,
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
            crearAlerta('error', '¡Los datos intruducidos son incorrectos!');

        } else if(items.respuesta === 'err_reset') {
            crearAlerta('error', '¡Ya se ha usado el sistema recientemente!');

        } else {
            crearAlerta('exito', '¡Correo enviado!');

            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        }
    };

    //

    return (
        <div className="container-fluid">
                    
            <h4 style={{ fontWeight: 'bold' }}>
                ¿Has olvidado tu contraseña?
            </h4>

            <hr/>

            <div className="row">

                <div className="col-sm-4 mx-auto">

                    <Form onSubmit={recordarPassword}>

                        <Form.Group className="mb-3" controlId="recordar-email">
                            <Form.Label>Escribe el correo de tu cuenta:</Form.Label>
                            <Form.Control type="email" placeholder="Correo" maxlength="200" ref={correoElectronico} required/>
                        </Form.Group>

                        <hr/>

                        <div className="d-grid gap-2">      
                            <Button type="submit" className="crear-botones" id='recordar-btn'>
                                <FontAwesomeIcon icon={faPaperPlane} /> Enviar
                            </Button>
                        </div>

                        <small className="text-muted">
                            * Recibirás una nueva contraseña al correo.
                        </small>

                    </Form>
                </div>

            </div>
        </div>
    );
}

export default RecordarPassword;