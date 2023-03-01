import React, { useRef } from "react";
import '../../css/RegistroModal.css';

import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIdCard } from '@fortawesome/free-solid-svg-icons';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import phonePrefix from '../../resources/phone-prefix.json';
import { sinNumero } from '../../resources/regex.js';

const Registro = ({ mostrar, funcionCerrar }) => {

    const regNombre = useRef();
    const regApellidos = useRef();
    const regEmail = useRef();
    const regNumero = useRef();
    const regPrefijo = useRef();
    const regGenero = useRef(0);

    const fechaNac = useRef();

    const regPassword1 = useRef();
    const regPassword2 = useRef();

    const regPrivacidad = useRef(false);
    const regCondiciones = useRef(false);

    //

    const enviarRegistro = async (event) => {
        event.preventDefault();

        //

        const nombre = regNombre.current.value;
        if(sinNumero.test(nombre) === true) return crearAlerta('error', '¡El nombre no puede contener números!');

        const apellidos = regApellidos.current.value;
        if(sinNumero.test(apellidos) === true) return crearAlerta('error', '¡Los apellidos no pueden contener números!');

        const fecha = new Date(fechaNac.current.value).getTime();
        const fechaHoy = new Date().getTime();
        const fechaFinal = (fechaHoy - fecha) / (1000 * 60 * 60 * 24 * 365);

        if(fechaFinal < 18) {
            return crearAlerta('error', '¡Debes tener más de 18 años!');
        }

        const password = regPassword1.current.value;
        if(password.length < 5) {
            return crearAlerta('error', '¡La contraseña debe tener al menos 5 caracteres!');
        }

        if(password !== regPassword2.current.value) {
            return crearAlerta('error', '¡Las contraseñas no coinciden!');
        }

        if(regCondiciones.current.checked === false) {
            return crearAlerta('error', '¡Acepta los términos y condiciones!');
        }

        if(regPrivacidad.current.checked === false) {
            return crearAlerta('error', '¡Acepta el aviso de privacidad!');
        }

        //

        var desactivarBtn = document.getElementById('reg-btn');
        desactivarBtn.disabled = true;

        const data = await fetch('/cuenta/registrar', { 
            method: 'POST',

            body: JSON.stringify({ 
                nombre: nombre,
                apellidos: apellidos,
                email: regEmail.current.value,
                password: password,
                telefono: regPrefijo.current.value+ ' ' +regNumero.current.value,
                genero: regGenero.current.value,
                fechaNac: fecha,
            }),
            
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();
        desactivarBtn.disabled = false;

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error en la base de datos!');

        } else if(items.respuesta === 'err_email') {
            crearAlerta('error', '¡Ese correo ya está en uso!');

        } else {
            crearAlerta('exito', '¡Verifica tu cuenta en el correo electrónico!');
            funcionCerrar();
        }
    };

    //

    return (
        <Modal fullscreen={true} show={mostrar} onHide={funcionCerrar}>

            <Modal.Header closeButton>
                <Modal.Title>Regístrate</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="container">

                    <Form onSubmit={enviarRegistro}>
                        <div className="container">

                            <div className="row">
                                <div className="col-sm separar">

                                    <Form.Group className="mb-3">
                                        <Form.Label>Nombre</Form.Label>
                                        <Form.Control type="text" placeholder="Escribe nombre" maxLength="30" ref={regNombre} required/>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Apellidos</Form.Label>
                                        <Form.Control type="text" placeholder="Escribe apellidos" maxLength="60" ref={regApellidos} required/>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Género</Form.Label>
                                        <Form.Select aria-label="Seleccion genero" ref={regGenero}>
                                            <option value="0">Hombre</option>
                                            <option value="1">Mujer</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Correo electrónico</Form.Label>
                                        <Form.Control type="email" placeholder="Escribe correo" maxLength="200" ref={regEmail} required/>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Fecha nacimiento</Form.Label>
                                        <Form.Control type="date" ref={fechaNac} required/>
                                    </Form.Group>

                                </div>
                                
                                <div className="col-sm">
                                    
                                    <Form.Group className="mb-3">
                                        <Form.Label>Contraseña</Form.Label>
                                        <Form.Control type="password" placeholder="Escribe contraseña" maxLength="80" ref={regPassword1} required/>
                                    </Form.Group>
                                
                                    <Form.Group className="mb-3">
                                        <Form.Label>Repite contraseña</Form.Label>
                                        <Form.Control type="password" placeholder="Escribe contraseña" maxLength="80" ref={regPassword2} required/>
                                    </Form.Group>
                                
                                    <Form.Group className="mb-3">

                                        <Form.Label>Número teléfono</Form.Label>
                                        <div className="input-group mb-3">

                                            <Form.Select aria-label="Seleccion prefijo telefono" ref={regPrefijo}>
                                                {
                                                    phonePrefix.map((x, index) => {
                                                        return <option key={index} value={x.dial_code}>
                                                            {x.name} {x.dial_code}
                                                        </option>
                                                    })
                                                }
                                            </Form.Select>
                                            <Form.Control type="number" placeholder="Escribe número" maxLength="20" ref={regNumero} required/>
                                        </div>
                                        
                                    </Form.Group>
                                
                                    <Form.Group className="mb-3">

                                        <Form.Check type='checkbox'>
                                            <Form.Check.Input type='checkbox' ref={regCondiciones} />
                                            <Form.Check.Label >
                                                Aceptas nuestros <a href="/condiciones" target="_blank">Términos & Condiciones</a>
                                            </Form.Check.Label>
                                        </Form.Check>
                                        
                                        <Form.Check type='checkbox'>
                                            <Form.Check.Input type='checkbox' ref={regPrivacidad} />
                                            <Form.Check.Label required>
                                                Confirmas haber leído el <a href="/privacidad" target="_blank">Aviso de privacidad</a>
                                            </Form.Check.Label>
                                        </Form.Check>
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="d-grid gap-2 mt-2">

                                <Button type="submit" className="crear-botones" id="reg-btn">
                                    <FontAwesomeIcon icon={faIdCard} /> Registrar cuenta
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