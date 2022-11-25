import React from "react";

import { crearAlerta } from './Toast/Toast.js';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';

function RecordarPassword() {

    const recordarPassword = async (event) => {
        event.preventDefault();
        
        const email = document.getElementById('recordar-email').value;

        if(email === '') {
            return crearAlerta('error', '¡Escribe un correo!');
        }

        const desactivarBtn = document.getElementById('recordar-btn');
        desactivarBtn.disabled = true;

        const data = await fetch('/noPassword', { 
            method: 'POST',

            body: JSON.stringify({ 
                email: email
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

    return (
        <div className="container-fluid">

            <div className="row">

                <div className="col-sm-3">
                </div>

                <div className="col">

                    <Card>

                        <Card.Header className="text-center">
                            ¿Has olvidado tu contraseña?
                        </Card.Header>

                        <Card.Body>
                            <Form onSubmit={recordarPassword}>

                                <Form.Group className="mb-3" controlId="recordar-email">
                                    <Form.Control type="email" placeholder="Escribe correo" />
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button type="submit" variant="success" id='recordar-btn'>
                                        Enviar
                                    </Button>
                                </div>

                            </Form>
                        </Card.Body>
                    </Card>
                </div>

                <div className="col-sm-3">
                </div>

            </div>
        </div>
    );
}

export default RecordarPassword;