import React from "react";

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';

function RecordarPassword() {

    const recordarPassword = async (event) => {
        event.preventDefault();
        
        const email = document.getElementById('recordar-email').value;

        if(email === '') {
            alert('Escribe un correo');
            return;
        }

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

        if(items.respuesta == 'err_db') {
            alert('ERROR DB');

        } else if(items.respuesta == 'err_datos') {
            alert('ERROR DATOS');

        } else if(items.respuesta == 'err_reset') {
            alert('HACE POCO YA SE HA RESETADO');

        } else {
            alert('Correo enviado');
            //window.location.reload(false);
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
                                    <Button type="submit" variant="success">
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