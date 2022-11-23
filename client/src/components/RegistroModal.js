import React from "react";
import '../css/RegistroModal.css';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import phonePrefix from '../resources/phone-prefix.json';

const Registro = ({ mostrar, funcionCerrar, funcionRegistro }) => {
    return (
        <Modal fullscreen={true} show={mostrar} onHide={funcionCerrar}>

            <Modal.Header closeButton>
                <Modal.Title>Regístrate</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="container">

                    <Form onSubmit={funcionRegistro}>
                        <div className="container">

                            <div className="row">
                                <div className="col-sm separar">

                                    <Form.Group className="mb-3" controlId="reg-nombre">
                                        <Form.Label>Nombre</Form.Label>
                                        <Form.Control type="text" placeholder="Escribe nombre" />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="reg-apellidos">
                                        <Form.Label>Apellidos</Form.Label>
                                        <Form.Control type="text" placeholder="Escribe apellidos" />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Género</Form.Label>
                                        <Form.Select aria-label="Seleccion genero" id="reg-genero">
                                            <option value="0">Hombre</option>
                                            <option value="1">Mujer</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="reg-email">
                                        <Form.Label>Correo electrónico</Form.Label>
                                        <Form.Control type="email" placeholder="Escribe correo" />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="reg-fechaNac">
                                        <Form.Label>Fecha nacimiento</Form.Label>
                                        <Form.Control type="date"/>
                                    </Form.Group>

                                </div>
                                
                                <div className="col-sm">
                                    
                                    <Form.Group className="mb-3" controlId="reg-password">
                                        <Form.Label>Contraseña</Form.Label>
                                        <Form.Control type="password" placeholder="Escribe contraseña" />
                                    </Form.Group>
                                
                                    <Form.Group className="mb-3" controlId="reg-password-2">
                                        <Form.Label>Repite contraseña</Form.Label>
                                        <Form.Control type="password" placeholder="Escribe contraseña" />
                                    </Form.Group>
                                
                                    <Form.Group className="mb-3">

                                        <Form.Label>Número teléfono</Form.Label>
                                        <div className="input-group mb-3">

                                            <Form.Select aria-label="Seleccion prefijo telefono" id="reg-prefijo">
                                                {
                                                    phonePrefix.map((x, index) => {
                                                        return <option key={index} value={x.dial_code}>
                                                            {x.name} {x.dial_code}
                                                        </option>
                                                    })
                                                }
                                            </Form.Select>
                                            <Form.Control type="number" placeholder="Escribe número" id="reg-telefono"/>
                                        </div>
                                        
                                    </Form.Group>
                                
                                    <Form.Group className="mb-3">

                                        <Form.Check type='checkbox' id='reg-condiciones'>
                                            <Form.Check.Input type='checkbox' />
                                            <Form.Check.Label>Aceptas nuestros <a href="/condiciones">Términos & Condiciones</a></Form.Check.Label>
                                        </Form.Check>
                                        
                                        <Form.Check type='checkbox' id='reg-privacidad'>
                                            <Form.Check.Input type='checkbox' />
                                            <Form.Check.Label>Confirmas haber leído el <a href="/privacidad">Aviso de privacidad</a></Form.Check.Label>
                                        </Form.Check>
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="d-grid gap-2 mt-2">

                                <Button type="submit" variant="success" id="reg-btn">
                                    Registrar cuenta
                                </Button>
                            </div>

                        </div>

                    </Form>
                </div>

            </Modal.Body>
        </Modal>
    );
}

export default Registro;