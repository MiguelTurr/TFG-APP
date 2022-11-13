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

        if(nombre === '') {
            alert('Escribe un nombre');
            return;
        }

        //const apellidos = document.getElementById('reg-apellidos').value;

        var prefijo = document.getElementById('reg-prefijo').value;
        var numero = document.getElementById('reg-telefono').value;

        var telefono = prefijo+ ' ' +numero;
        
        console.log(telefono)

        const data = await fetch('/registrar', { 
            method: 'POST',

            body: JSON.stringify({ 
                nombre: document.getElementById('reg-nombre').value,
                apellidos: 'Lopez Sanches',
                email: 'asas@hotmail.com',
                password: '1212121',
                telefono: telefono

            }),
            
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();

        console.log(data);
        console.log(items);
    };

    // LOGIN

    var [loginModal, setShowLogin] = useState(false);

    const mostrarLogin = () => setShowLogin(true);
    const cerrarLogin = () => setShowLogin(false);

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
                        <Button variant="warning" size="sm">Buscar</Button>
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

            <LoginModal mostrar={loginModal} funcionCerrar={cerrarLogin} />
            <RegistroModal mostrar={registroModal} funcionCerrar={cerrarRegistro} funcionRegistro={enviarRegistro} />

        </div>

        <hr className="header-separador"/>

        <div className="container-fluid container-filtros mb-2">

            <div className="row">

                <div className="col-sm-1">
                    
                    <Button variant="warning" size="sm">
                        <img
                            className="img-fluid"
                            src={Fav}
                            alt="" 
                            width="40%"
                        ></img>
                        <br/>
                        Favoritos
                    </Button>
                </div>

                <div className="col-sm-1">
                    
                    <Button variant="warning" size="sm">
                        <img
                            className="img-fluid"
                            src={Sugerencias}
                            alt="" 
                            width="30%"
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
                
                <div className="col-sm-1">
                    
                    <Button variant="warning" size="sm">
                        <img
                            className="img-fluid"
                            src={Fav}
                            alt="" 
                            width="40%"
                        ></img>
                        <br/>
                        Favoritos
                    </Button>
                </div>

                <div className="col-sm-1">
                    
                    <Button variant="warning" size="sm">
                        <img
                            className="img-fluid"
                            src={Sugerencias}
                            alt="" 
                            width="30%"
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