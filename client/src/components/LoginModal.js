import React from "react";

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

const Login = ({ mostrar, funcionCerrar }) => {
    return (
        <Modal fullscreen={true} show={mostrar} onHide={funcionCerrar}>

            <Modal.Header closeButton>
                <Modal.Title>Inicia sesión</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="container">

                    <Form>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Correo electrónico</Form.Label>
                            <Form.Control type="email" placeholder="Escribe correo" />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Contraseña</Form.Label>
                            <Form.Control type="password" placeholder="Escribe contraseña" />
                        </Form.Group>
                    
                        <div className="d-grid gap-2">
                            <Button variant="success btn-block" onClick={funcionCerrar}>
                                Iniciar sesión
                            </Button>
                        </div>

                    </Form>
                </div>

            </Modal.Body>
        </Modal>
    );
}

export default Login;