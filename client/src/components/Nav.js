import React, { useState, useEffect } from 'react';
import '../css/Nav.css';

import LoginModal from './LoginModal';
import RegistroModal from './RegistroModal';

import Logo from '../img/logo.png';
import Fav from '../img/favoritos.png';
import Sugerencias from '../img/sugerencias.png';

import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

function Nav() {

    //

    const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

    useEffect(() => {
        window.addEventListener("resize", () => {
            const ismobile = window.innerWidth < 600;
            if (ismobile !== isMobile) setIsMobile(ismobile);
        }, false);
    }, [isMobile]);

    // REGISTRO

    var [registroModal, setShowRegistro] = useState(false);

    const mostrarRegistro= () => setShowRegistro(true);
    const cerrarRegistro = () => setShowRegistro(false);

    const enviarRegistro = async (event) => {
        event.preventDefault()

        const nombre = document.getElementById('reg-nombre').value;
        if(nombre.length < 2) {
            alert('Escribe un nombre');
            return;
        }

        const apellidos = document.getElementById('reg-apellidos').value;
        if(apellidos === '') {
            return alert('Escribe un apellido');
        }

        const email = document.getElementById('reg-email').value;
        if(email === '') {
            return alert('Escribe un correo electrónico');
        }

        const fechaNac = document.getElementById('reg-fechaNac').value;
        const fechaHoy = new Date().getTime();
        const fechaFinal = (fechaHoy - new Date(fechaNac).getTime()) / (1000 * 60 * 60 * 24 * 365);

        if(fechaFinal < 18) {
            return alert('Debes tener más de 18 años');
        }

        const password = document.getElementById('reg-password').value;
        if(password.length < 5) {
            return alert('La contraseña debe tener al menos 5 caracteres');
        }

        const passwordRepite = document.getElementById('reg-password-2').value;
        if(password !== passwordRepite) {
            return alert('La contraseña no coincide');
        }

        const numero = document.getElementById('reg-telefono').value;
        if(numero === '') {
            return alert('Escribe un número');
        }

        const prefijo = document.getElementById('reg-prefijo').value;
        const genero = document.getElementById('reg-genero').value;

        //

        const data = await fetch('/registrar', { 
            method: 'POST',

            body: JSON.stringify({ 
                nombre: nombre,
                apellidos: apellidos,
                email: email,
                password: password,
                telefono: prefijo+ ' ' +numero,
                genero: genero,
                fechaNac: fechaNac,
                residencia: 'León, Castilla y León, España'
            }),
            
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();

        if(items.respuesta == 'err_db') {
            alert('ERROR DB');

        } else if(items.respuesta == 'err_email') {
            alert('DUPLICADO EMAIL');

        } else {
            alert('VERIFICA CORREO');
        }
    };

    // LOGIN

    var [loginModal, setShowLogin] = useState(false);

    const mostrarLogin = () => setShowLogin(true);
    const cerrarLogin = () => setShowLogin(false);

    const enviarLogin = async (event) => {
        event.preventDefault();
        
        const email = document.getElementById('log-email').value;

        if(email === '') {
            alert('Escribe un correo');
            return;
        }

        const password = document.getElementById('log-password').value;

        if(password === '') {
            alert('Escribe una contraseña');
            return;
        }

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

        if(items.respuesta == 'err_db') {
            alert('ERROR DB');

        } else if(items.respuesta == 'err_datos') {
            alert('ERROR DATOS');

        } else if(items.respuesta == 'err_validado') {
            alert('VALIDA EL CORREO');

        } else {
            alert('Login correcto');
        }
    };

    // BUSCAR


    //

    return (
        <div className="header">

        <div className="container-fluid text-center">

            <div className="row">

                <div className={isMobile ? "col-sm-4" : "col-sm-4 logo"}>
                    
                    <a href="/">
                        <img className="img-fluid" 
                            src={Logo}
                            alt="Logo de la página"
                            width="35%"
                        />
                    </a>
                </div>

                <div className="col-sm-4 mt-3">

                    <div className="input-group">
                        <input type="text" className="form-control" placeholder="Escribe un lugar" aria-label="Recipient's username"/>
                        <Button variant="warning" size="sm">
                            <FontAwesomeIcon icon={faSearch} />
                        </Button>
                    </div>

                </div>

                <div className={isMobile ? "col-sm-4 mt-3" : "col-sm-4 mt-3 user-col"}>

                    <DropdownButton
                        className="user-boton"
                        size="sm"
                        variant="warning"
                        title={
                            <>
                                <img className="img-fluid rounded-pill user-img" 
                                    src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
                                    alt="Imagen de perfil del usuario"
                                />
                                &nbsp;&nbsp;&nbsp;
                            </>
                        } 
                    >
                        <Dropdown.Item eventKey="1" onClick={mostrarRegistro}>Regístrate</Dropdown.Item>
                        <Dropdown.Item eventKey="2" onClick={mostrarLogin}>Inicia sesión</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item eventKey="3" href="/ayuda">Ayuda</Dropdown.Item>
                    </DropdownButton>
                </div>
            </div>

            <LoginModal mostrar={loginModal} funcionCerrar={cerrarLogin} funcionLogin={enviarLogin}/>
            <RegistroModal mostrar={registroModal} funcionCerrar={cerrarRegistro} funcionRegistro={enviarRegistro} />

        </div>

        <hr className="header-separador"/>

        <div className="container-fluid container-filtros mb-2">

            <div className="row">

                <div className="col">
                    
                    <Button variant="warning" size="sm">
                        <img
                            className="img-fluid"
                            src={Fav}
                            alt="" 
                            width="20%"
                        ></img>
                        <br/>
                        Favoritos
                    </Button>
                </div>

                <div className="col">
                    
                    <Button variant="warning" size="sm">
                        <img
                            className="img-fluid"
                            src={Sugerencias}
                            alt="" 
                            width="20%"
                        ></img>
                        <br/>
                        Recomendados
                    </Button>
                </div>

                <div className="col-sm-7">

                    <h1>
                        Filtros
                    </h1>
                    
                </div>
                
                <div className="col">
                    
                    <Button variant="warning" size="sm">
                        <img
                            className="img-fluid"
                            src={Fav}
                            alt="" 
                            width="20%"
                        ></img>
                        <br/>
                        Favoritos
                    </Button>
                </div>

                <div className="col">
                    
                    <Button variant="warning" size="sm">
                        <img
                            className="img-fluid"
                            src={Sugerencias}
                            alt="" 
                            width="20%"
                        ></img>
                        <br/>
                        Recomendados
                    </Button>
                </div>

            </div>

        </div>

        </div>
    );
}

export default Nav;