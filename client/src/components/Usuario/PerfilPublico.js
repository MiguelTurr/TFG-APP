import React from "react";

import { useParams } from "react-router-dom";
import { useEffect, useState } from 'react';

import LoginModal from '../LoginModal';
import DenunciaModal from './DenunciarModal';

import { crearAlerta } from '../Toast/Toast.js';
import NoProfileImg from '../../img/no-profile-img.png';
import userLogin from '../../js/autorizado';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faHouse, faLanguage, faBriefcase, faWarning, faStar, faLocationDot } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";
import Card from 'react-bootstrap/Card';

function PerfilPublico() {

    const { autorizado, setAutorizado } = userLogin();

    //

    var regFecha = { year: 'numeric', month: 'long' };

    const { id } = useParams();

    //

    const [infoPerfil, setInfoPerfil] = useState({ nombre: 'Nadie' });
    const [imgPerfil, setImgPerfil] = useState(NoProfileImg);
    const [alojamientosPerfil, setAlojamientosPerfil] = useState([]);
    const [alojamientosPerfilImg, setAlojamientosPerfilImg] = useState([]);
    const [alojamientosValoraciones, setAlojamientosValoracioens] = useState([]);
    const [valImgPerfil, setValImgPerfil] = useState([]);
    const [valImgAlojamiento, setValImgAlojamiento] = useState([]);
    const [userValoraciones, setUserValoraciones] = useState([]);
    const [userValoracionesImg, setUserValoracionesImg] = useState([]);

    useEffect(() => {
        obtenerInfoPerfil();
        cargarImagenPerfil();
        cargarAlojamientosPerfil();
        cargarAlojamientosVal();
        cargarUsuarioVal();
    }, []);

    const obtenerInfoPerfil = async () => {

        const data = await fetch('/usuario/ver/' + id, {
            method: 'GET',

            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();

        if (items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if (items.respuesta === 'err_datos') {
            window.location.href = '/';

        } else if (items.respuesta === 'correcto') {
            setInfoPerfil(items.user[0]);
        }
    };

    const cargarImagenPerfil = async () => {

        const imagen = await fetch('/alojamiento/hospedador/foto/' + id, { method: 'GET' });

        if (imagen.status === 200) {
            setImgPerfil(imagen.url);
        }
    };

    const cargarAlojamientosPerfil = async () => {

        const data = await fetch('/usuario/alojamientos/' + id, {
            method: 'GET',

            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();

        if (items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if (items.respuesta === 'correcto') {
            setAlojamientosPerfil(items.alojamientos);
            
            var len = items.alojamientos.length;
            var arrayImg = [];

            for(var i = 0; i < len; i++) {

                const imagen = await fetch('/alojamiento/imagen/' +items.alojamientos[i].ID+ '-0', { 
                    method: 'GET',
            
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                if(imagen.status === 200) {
                    arrayImg.push(imagen.url);
                }
            }
            setAlojamientosPerfilImg(arrayImg);
        }
    };

    const cargarAlojamientosVal = async () => {

        const data = await fetch('/usuario/alojamientos/valoraciones/' + id, {
            method: 'GET',

            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();

        if (items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if (items.respuesta === 'correcto') {
            setAlojamientosValoracioens(items.valoraciones);

            //

            var len = items.valoraciones.length;
            var arrayPerfiles = [];
            var arrayAlojamientos = [];

            for(var i = 0; i < len; i++) {

                // IMÁGENES PERFIL

                const perfil = await fetch('/alojamiento/hospedador/foto/' +items.valoraciones[i].usuarioId, { method: 'GET' });

                if(perfil.status === 200) {
                    arrayPerfiles.push(perfil.url);

                } else {
                    arrayPerfiles.push(NoProfileImg);
                }

                // IMÁGENES ALOJAMIENTOS

                const alojamiento = await fetch('/alojamiento/imagen/' +items.valoraciones[i].alojamientoId+ '-0', { 
                    method: 'GET',
            
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                if(alojamiento.status === 200) {
                    arrayAlojamientos.push(alojamiento.url);
                }
            }
    
            setValImgPerfil(arrayPerfiles);
            setValImgAlojamiento(arrayAlojamientos);
        }
    };

    const cargarUsuarioVal = async () => {
        const data = await fetch('/usuario/valoraciones/' + id, {
            method: 'GET',

            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();

        if (items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if (items.respuesta === 'correcto') {
            setUserValoraciones(items.valoraciones);

            
            //

            var len = items.valoraciones.length;
            var arrayPerfiles = [];

            for(var i = 0; i < len; i++) {

                // IMÁGENES PERFIL

                const perfil = await fetch('/alojamiento/hospedador/foto/' +items.valoraciones[i].usuarioId, { method: 'GET' });

                if(perfil.status === 200) {
                    arrayPerfiles.push(perfil.url);

                } else {
                    arrayPerfiles.push(NoProfileImg);
                }
            }
    
            setUserValoracionesImg(arrayPerfiles);
        }
    };

    //

    const verAlojamiento = (e, index) => {
        window.location.href = '/alojamiento/ver?casa=' +alojamientosPerfil[index].ID;
    };

    const verValoracionAlojamiento = (e, index) => {
        window.location.href = '/alojamiento/ver?casa=' +alojamientosValoraciones[index].alojamientoId;
    };

    const verPerfilUsuario = (e, index) => {
        window.location.href = '/usuario/ver/' +alojamientosValoraciones[index].usuarioId;
    };

    const verPerfilUsuarioVal = (e, index) => {
        window.location.href = '/usuario/ver/' +userValoraciones[index].usuarioId;
    };

    //

    var [loginModal, setShowLogin] = useState(false);
    var [denunciaModal, setShowDenuncia] = useState(false);

    const cerrarLogin = () => setShowLogin(false);
    const cerrarDenuncia = () => setShowDenuncia(false);

    const denunciarPerfil = () => {
        if(autorizado === false) {
            window.scrollTo(0, 0);
            return setShowLogin(true);
        }
        setShowDenuncia(true);
    };

    return (
        <div className="container-fluid mt-4 mb-5" style={{ paddingLeft: '30px', paddingRight: '30px' }}>

            <div className="row mb-3">

                <div className="col-sm-2">
                    <img src={imgPerfil} key={imgPerfil} className="img-fluid rounded-pill" alt="Imagen de perfil del usuario"></img>

                    <hr/>

                    <ul className="lista-sin-numeros">

                        <li style={{ fontSize: '17px', marginBottom: '5px' }}>
                            <FontAwesomeIcon icon={faCheck} /> Identidad
                        </li>

                        <li style={{ fontSize: '17px', marginBottom: '5px' }}>
                            <FontAwesomeIcon icon={faCheck} /> Número de teléfono
                        </li>

                        <li style={{ fontSize: '17px', marginBottom: '5px' }}>
                            <FontAwesomeIcon icon={faCheck} /> Correo electrónico
                        </li>
                    </ul>

                </div>

                <div className="col" style={{ marginLeft: '100px' }}>
                    <span style={{ fontSize: '25px' }}>
                        Soy {infoPerfil.nombre} {infoPerfil.apellidos}
                    </span>

                    <br/>

                    <small>
                        Registrado en {new Date(infoPerfil.fechaReg).toLocaleDateString('es-ES', regFecha)}
                    </small>

                    <hr/>

                    <h3>
                        Sobre mi
                    </h3>

                    <div dangerouslySetInnerHTML={{ __html: infoPerfil.presentacion }} />

                    <hr/>

                    <ul className="lista-sin-numeros">

                        {infoPerfil.residencia !== '' &&   
                            <li style={{ marginBottom: '10px' }}>
                                <FontAwesomeIcon icon={faHouse} /> Reside en <strong>{infoPerfil.residencia}</strong>
                            </li>
                        }

                        {infoPerfil.idiomas !== '' &&

                            <li style={{ marginBottom: '10px' }}>
                                <FontAwesomeIcon icon={faLanguage} /> Habla <strong>{infoPerfil.idiomas}</strong>
                            </li>
                        }

                        {infoPerfil.trabajo !== '' &&

                            <li style={{ marginBottom: '10px' }}>
                                <FontAwesomeIcon icon={faBriefcase} /> Trabaja en <strong>{infoPerfil.trabajo}</strong>
                            </li>
                        }
                    </ul>

                </div>
            </div>

            <hr/>

            <div className="row mb-3">     

                <h3>
                    Alojamientos de {infoPerfil.nombre}
                </h3>

                <div className="col mt-3">

                    <div className="row">
                    {
                        alojamientosPerfil.map((x, index) => (

                            <div className="col-sm-3 mb-3" key={index}>

                                <Card className="container-casa h-100" onClick={e => { verAlojamiento(e, index) }}>
                                 
                                    <img
                                        className="card-img-top"
                                        height="250px"
                                        src={alojamientosPerfilImg[index]}/>

                                    <Card.Body className="card-body">

                                        <FontAwesomeIcon icon={faStar} />&nbsp;{parseFloat(x.valoracionMedia).toFixed(2)}
                                        &nbsp;
                                        <span className="text-muted">
                                            ({x.vecesValorado})
                                        </span>
                                        <br/>
                                        <FontAwesomeIcon icon={faLocationDot} />&nbsp;{x.ubicacion}
                                    </Card.Body>
                                </Card>
                            </div>

                        ))
                    }
                    </div>
                </div>
            </div>

            <hr/>

            <div className="row mb-3">     

                <div className="col">

                    <h3>
                        <FontAwesomeIcon icon={faStar} />&nbsp;{alojamientosValoraciones.length} valoraciones de huéspedes
                    </h3>

                    <ul className="lista-sin-numeros mt-3">
                        {
                            alojamientosValoraciones.map((x, index) => (

                                <li key={index} style={{ marginBottom: '15px' }}>
                                    <div className="row">
                    
                                        <div className="col">
                                            <span style={{ fontWeight: 'bold' }}>
                                                <FontAwesomeIcon icon={faLocationDot} />&nbsp;{x.ubicacion}
                                                <br/>
                                                <small className="text-muted">
                                                    {new Date(x.creadaEn).toLocaleDateString('es-ES', regFecha)}
                                                </small>
                                            </span>

                                            <br/>
                                            <br/>
                                            {x.mensaje}

                                            <br/>
                                            <br/>
                                            
                                        </div>
                                        <div className="col-sm-3">
                                            <img
                                                style={{ cursor: 'pointer' }}
                                                className="card-img-top"
                                                height='100px'
                                                src={valImgAlojamiento[index]}
                                                onClick={e => { verValoracionAlojamiento(e, index) }}/>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-2">
                                            <img 
                                                style={{ cursor: 'pointer' }}
                                                src={valImgPerfil[index]} 
                                                key={valImgPerfil[index]} 
                                                className="img-fluid rounded-pill" 
                                                alt="Imagen de perfil del usuario"
                                                onClick={e => { verPerfilUsuario(e, index) }}/>
                                        </div>
                                        <div className="col">

                                            <strong>
                                                {x.nombre} de {x.residencia}
                                            </strong>
                                            <br/>
                                            <small>
                                                {new Date(x.fechaReg).toLocaleDateString('es-ES', regFecha)}
                                            </small>
                                        </div>
                                    </div>

                                    <hr/>
                                </li>

                            ))
                        }
                    </ul>
                </div>
                <div className="col">

                    <h3>
                        <FontAwesomeIcon icon={faStar} />&nbsp;{userValoraciones.length} valoraciones de hospedadores
                    </h3>

                   
                    <ul className="lista-sin-numeros mt-3">
                        {
                            userValoraciones.map((x, index) => (
                                <li>
                                    <span style={{ fontWeight: 'bold' }}>
                                        <small className="text-muted">
                                            {new Date(x.creadoEn).toLocaleDateString('es-ES', regFecha)}
                                        </small>
                                    </span>

                                    <br/>
                                    <br/>
                                    {x.mensaje}

                                    <br/>
                                    <br/>
                                    <div className="row">
                                        <div className="col-sm-2">
                                            <img 
                                                style={{ cursor: 'pointer' }}
                                                src={userValoracionesImg[index]} 
                                                key={userValoracionesImg[index]} 
                                                className="img-fluid rounded-pill" 
                                                alt="Imagen de perfil del usuario"
                                                onClick={e => { verPerfilUsuarioVal(e, index) }}/>
                                        </div>
                                        <div className="col">

                                            <strong>
                                                {x.nombre} de {x.residencia}
                                            </strong>
                                            <br/>
                                            <small>
                                                {new Date(x.fechaReg).toLocaleDateString('es-ES', regFecha)}
                                            </small>
                                        </div>
                                    </div>

                                    <hr/>
                                </li>
                            ))
                        }
                    </ul>
                </div>
            </div>
  
            <div className="row mb-3">     
                <div className="col text-center">    
                    <Button className="borrar-botones" size="sm" onClick={denunciarPerfil}>
                        <FontAwesomeIcon icon={faWarning} /> Denunciar este perfil
                    </Button>
                </div>
            </div>
            
            <LoginModal mostrar={loginModal} funcionCerrar={cerrarLogin} />
            <DenunciaModal mostrar={denunciaModal} funcionCerrar={cerrarDenuncia} />

        </div>
    );
}

export default PerfilPublico;