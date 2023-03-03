import React, { useState, useEffect } from 'react';
import '../../css/Nav.css';

import { crearAlerta } from '../Toast/Toast.js';
import BuscarLugar from "../Maps/buscarLugar.js";

import LoginModal from '../Sesion/LoginModal';
import RegistroModal from '../Sesion/RegistroModal';
import NavFiltros from './NavFiltros';

import Logo from '../../img/logo.png';
import NoProfileImg from '../../img/no-profile-img.png';

import Dropdown from 'react-bootstrap/Dropdown';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faScrewdriverWrench } from '@fortawesome/free-solid-svg-icons';

function Nav({ isLogged, changeLogged, isAdmin }) {
    
    const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

    useEffect(() => {
        window.addEventListener("resize", () => {
            const ismobile = window.innerWidth < 600;
            if (ismobile !== isMobile) setIsMobile(ismobile);
        }, false);
    }, [isMobile]);

    // REGISTRO

    var [registroModal, setShowRegistro] = useState(false);

    const mostrarRegistro = () => setShowRegistro(true);
    const cerrarRegistro = () => setShowRegistro(false);

    // LOGIN

    var [loginModal, setShowLogin] = useState(false);

    const mostrarLogin = () => setShowLogin(true);
    const cerrarLogin = () => setShowLogin(false);

    // LOGOUT

    const cerrarSesion = async () => {

        const data = await fetch('/cuenta/logout', { 
            method: 'POST',
            
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if(data.status === 200) {
            crearAlerta('exito', '¡Sesión terminada!');

            setTimeout(() => {
                changeLogged(false);

            }, 1000);
        }
    };

    // FOTO PERFIL

    const [fotoPerfil, setFotoPerfil] = useState(NoProfileImg);

    const cargarFotoPerfil = async () => {
        
        const imagen = await fetch('/perfil/foto', {  method: 'GET' });

        if(imagen.status === 200) {
            setFotoPerfil(imagen.url);
        }
    };

    useEffect(() => {

        if(isLogged === true) {
            cargarFotoPerfil();
            cargarNovedades();
        }
    }, [isLogged]);

    // MENSAJES NUEVOS

    const [mensajes, setMensajes] = useState(0);
    const [valoraciones, setValoraciones] = useState(0);

    const cargarNovedades = async () => {
        const data = await fetch('/perfil/notificaciones', { method: 'GET' });

        if(data.status === 200) {
            const items = await data.json();

            setMensajes(items.nuevosMensajes);
            setValoraciones(items.valoraciones);
        }
    };

    //

    const irFavoritos = () => {

        if(isLogged === false) {
            mostrarLogin();
            return;
        }

        window.location.href = '/perfil/favoritos';
    };

    const irRecomendados = () => {

        if(isLogged === false) {
            mostrarLogin();
            return;
        }

        window.location.href = '/perfil/recomendados';
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

                <div className="col-sm-4 mt-4">
                    <BuscarLugar buscar={true} />
                </div>

                <div className={isMobile ? "col-sm-4 mt-3" : "col-sm-4 mt-3 user-col"}>

                    <Dropdown>

                        <span style={isAdmin === true ? {} : { display: 'none' }}>
                            <a style={{ backgroundColor: '#ab47f9', padding: '10px', borderRadius: '10px', color: 'white', verticalAlign: 'middle' }} href="/admin">
                                <FontAwesomeIcon icon={faScrewdriverWrench} />
                            </a>
                        </span>
                        
                        &nbsp;
                        &nbsp;

                        <Dropdown.Toggle variant="link" bsPrefix className="user-btn-no">
                            <FontAwesomeIcon icon={faBars} className="user-icon" />

                            <img className="img-fluid rounded-pill user-img" src={fotoPerfil} alt="Imagen de perfil del usuario"/>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>

                            <span style={isLogged === false ? {} : { display: 'none' }}>
                                <Dropdown.Item eventKey="1" onClick={mostrarRegistro}>Regístrate</Dropdown.Item>
                                <Dropdown.Item eventKey="2" onClick={mostrarLogin}>Inicia sesión</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item eventKey="3" href="/ayuda">Ayuda</Dropdown.Item>
                            </span>

                            <span style={isLogged === true ? {} : { display: 'none' }}>
                                <Dropdown.Item eventKey="1" href="/perfil">Perfil</Dropdown.Item>
                                <Dropdown.Item eventKey="2" href="/perfil/mis-alojamientos">Mis alojamientos</Dropdown.Item>
                                <Dropdown.Item eventKey="4" href="/perfil/mis-reservas">Mis reservas</Dropdown.Item>

                                <Dropdown.Item eventKey="5" href="/perfil/mis-valoraciones">
                                    Mis valoraciones
                                    <span style={valoraciones > 0 ? {} : { display: 'none' }}>
                                        &nbsp;
                                        <span className="noti-style">
                                            &nbsp;&nbsp;{valoraciones}&nbsp;&nbsp;
                                        </span>
                                    </span>
                                </Dropdown.Item>

                                <Dropdown.Item eventKey="6" href="/perfil/mis-chats">
                                    Mis mensajes
                                    <span style={mensajes > 0 ? {} : { display: 'none' }}>
                                        &nbsp;
                                        <span className="noti-style">
                                            &nbsp;&nbsp;{mensajes}&nbsp;&nbsp;
                                        </span>
                                    </span>

                                </Dropdown.Item>

                                <Dropdown.Item eventKey="7" href="/ayuda">Ayuda</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item eventKey="8" onClick={cerrarSesion}>Cerrar sesión</Dropdown.Item>
                            </span>
                        </Dropdown.Menu>

                        <span 
                            style={mensajes > 0 || valoraciones > 0 ? {} : { display: 'none' }}
                            className={isMobile ? "position-absolute translate-middle p-2 bg-danger border border-light rounded-circle" : "position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle"}>
                        </span>
                    </Dropdown>
                    
                </div>
            </div>

            <LoginModal mostrar={loginModal} funcionCerrar={cerrarLogin} changeLogged={changeLogged} />
            <RegistroModal mostrar={registroModal} funcionCerrar={cerrarRegistro} />

        </div>

        <NavFiltros fav={irFavoritos} rec={irRecomendados} />

        <hr/>
    </div>
    );
}

export default Nav;