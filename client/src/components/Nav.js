import React, { useState, useEffect } from 'react';
import '../css/Nav.css';

import LoginModal from './LoginModal';
import RegistroModal from './RegistroModal';
import userLogin from '../js/autorizado';

import Logo from '../img/logo.png';
import Fav from '../img/favoritos.png';
import Sugerencias from '../img/sugerencias.png';
import NoProfileImg from '../img/no-profile-img.png';

import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

function Nav() {

    const { autorizado, setAutorizado } = userLogin();

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
            setAutorizado(true);

            window.location.reload(false);
        }
    };

    // LOGOUT

    const cerrarSesion = async () => {

        const data = await fetch('/logout', { 
            method: 'POST',
            
            headers: {
                'Content-Type': 'application/json'
            },
        });

        console.log(data.status);

        if(data.status == 200) {
            
            alert('Logout correcto');
            setAutorizado(false);

            window.location.reload(false);
        }
    };

    // BUSCAR

    const buscarLugar = () => {
        const lugar = document.getElementById('buscar-lugar').value;

        if(lugar == '') {
            return alert('Escribe un lugar para visitar');
        }

        window.location.href = '/buscar?place=' +lugar;
    };

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
                        <input type="text" className="form-control" id='buscar-lugar' placeholder="Escribe un lugar" aria-label="Lugar para visitar"/>

                        <Button className="color-boton" size="sm" onClick={buscarLugar}>
                            <FontAwesomeIcon icon={faSearch} />
                        </Button>
                    </div>

                </div>

                <div className={isMobile ? "col-sm-4 mt-3" : "col-sm-4 mt-3 user-col"}>

                    <DropdownButton
                        className="user-boton"
                        size="sm"
                        title={
                            <>
                                <img className="img-fluid rounded-pill user-img" 
                                    src={NoProfileImg}
                                    alt="Imagen de perfil del usuario"
                                />
                                &nbsp;&nbsp;&nbsp;
                            </>
                        } 
                    >
                        {autorizado === false &&
                            <>
                                <Dropdown.Item eventKey="1" onClick={mostrarRegistro}>Regístrate</Dropdown.Item>
                                <Dropdown.Item eventKey="2" onClick={mostrarLogin}>Inicia sesión</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item eventKey="3" href="/ayuda">Ayuda</Dropdown.Item>
                            </>
                        }

                        {autorizado == true &&
                            <>
                                <Dropdown.Item eventKey="1" href="/perfil">Perfil</Dropdown.Item>
                                <Dropdown.Item eventKey="2" href="/ayuda">Ayuda</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item eventKey="3" onClick={cerrarSesion}>Cerrar sesión</Dropdown.Item>
                            </>
                        }

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
                    
                    <Button className="color-boton" size="sm">
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
                    
                    <Button className="color-boton" size="sm">
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

                <div className="col">

                    <h1 style={{color: 'black'}}>
                        Filtros
                    </h1>
                    
                </div>
                
                <div className="col">
                    
                    <Button className="color-boton" size="sm">
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
                    
                    <Button className="color-boton" size="sm">
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