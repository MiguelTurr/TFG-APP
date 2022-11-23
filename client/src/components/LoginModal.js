import React from "react";

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

const Login = ({ mostrar, funcionCerrar, funcionLogin }) => {
    
    return (
        <Modal fullscreen={true} show={mostrar} onHide={funcionCerrar}>

            <Modal.Header closeButton>
                <Modal.Title>Inicia sesión</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="container">

                    <Form onSubmit={funcionLogin}>
                        <Form.Group className="mb-3" controlId="log-email">
                            <Form.Label>Correo electrónico</Form.Label>
                            <Form.Control type="email" placeholder="Escribe correo" />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="log-password">
                            <Form.Label>Contraseña</Form.Label>
                            <Form.Control type="password" placeholder="Escribe contraseña" />
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

            </Modal.Body>
        </Modal>
    );
}

export default Login;