import React, { useState, useEffect } from "react";

import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faLocationDot, faArrowDown } from '@fortawesome/free-solid-svg-icons';

import Button from 'react-bootstrap/Button';

var paginaHechasAlojamientos = 0;
var paginaHechasUsuarios = 0;

var paginaRecibidasAlojamientos = 0;
var paginaRecibidasUsuarios = 0;

function UserValoraciones() {

    var fechaOptions = { year: 'numeric', month: 'long', day: 'numeric' };

    //
    
    const [valoracionesAlo, setValoracionesAlo] = useState([]);
    const [valoracionesUser, setValoracionesUser] = useState([]);
    const [recibidasAlo, setRecibidasAlo] = useState([]);
    const [recibidasUser, setRecibidasUser] = useState([]);

    //

    const [valVista, setValVista] = useState('hechas');

    const cambiarVista = (tipoId) => {
        setValVista(tipoId);

        if(tipoId === 'hechas-2' && valoracionesUser.length === 0) {
            obtenerUsuariosHechas(paginaHechasUsuarios);

        } else if(tipoId === 'recibidas' && recibidasAlo.length === 0) {
            obtenerAlojamientosRecibidas(paginaRecibidasAlojamientos);

        } else if(tipoId === 'recibidas-2' && recibidasUser.length === 0) {
            obtenerUsuariosRecibidas(paginaRecibidasUsuarios);
        }
    };

    //

    useEffect(() => {
        obtenerAlojamientosHechas(paginaHechasAlojamientos);
    }, []);

    const obtenerAlojamientosHechas = async (columnas) => {

        const btn = document.getElementById('mas-hechas');
        btn.disabled = true;

        const data = await fetch('/perfil/mis-valoraciones/hechas-alo/' +columnas, { method: 'GET' });
        const items = await data.json();

        btn.disabled = false;

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {
            setValoracionesAlo([...valoracionesAlo, ...items.valoracion]);
        }
    };

    const obtenerUsuariosHechas = async (columnas) => {

        const btn = document.getElementById('mas-hechas-2');
        btn.disabled = true;

        const data = await fetch('/perfil/mis-valoraciones/hechas-user/' +columnas, { method: 'GET' });
        const items = await data.json();

        btn.disabled = false;

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {
            setValoracionesUser([...valoracionesUser, ...items.valoracion]);
        }
    };

    const obtenerAlojamientosRecibidas = async (columnas) => {

        const btn = document.getElementById('mas-recibidas');
        btn.disabled = true;

        const data = await fetch('/perfil/mis-valoraciones/recibidas-alo/' +columnas, { method: 'GET' });
        const items = await data.json();

        btn.disabled = false;

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {
            setRecibidasAlo([...recibidasAlo, ...items.valoracion]);

            var len = items.valoracion.length;
            paginaRecibidasAlojamientos += len;

            if(len === 0) {
                btn.disabled = true;
            }
        }
    };

    const obtenerUsuariosRecibidas = async (columnas) => {

        const btn = document.getElementById('mas-recibidas-2');
        btn.disabled = true;

        const data = await fetch('/perfil/mis-valoraciones/recibidas-user/' +columnas, { method: 'GET' });
        const items = await data.json();

        btn.disabled = false;

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {
            setRecibidasUser([...recibidasUser, ...items.valoracion]);

            var len = items.valoracion.length;
            paginaRecibidasUsuarios += len;

            if(len === 0) {
                btn.disabled = true;
            }
        }
    };

    //
 
    return (

        <div className="container-fluid mb-5">
            
            <div className="row">
                <div className="col">

                    <button className={valVista === 'hechas' ? "btn-no-style btn-activo" : "btn-no-style"} onClick={() => { cambiarVista('hechas') }} id="btn-visitante">
                        Hechas-Alojamientos
                    </button>

                    <span className="vista-separador">/</span>          

                    <button className={valVista === 'hechas-2' ? "btn-no-style btn-activo" : "btn-no-style"} onClick={() => { cambiarVista('hechas-2') }} id="btn-visitante">
                        Hechas-Usuarios
                    </button>

                    <span className="vista-separador">/</span>

                    <button className={valVista === 'recibidas' ? "btn-no-style btn-activo" : "btn-no-style"} onClick={() => { cambiarVista('recibidas') }} id="btn-hospedador">
                        Recibidas-Alojamientos
                    </button>

                    <span className="vista-separador">/</span>

                    <button className={valVista === 'recibidas-2' ? "btn-no-style btn-activo" : "btn-no-style"} onClick={() => { cambiarVista('recibidas-2') }} id="btn-hospedador">
                        Recibidas-Usuarios
                    </button>
                </div>
            </div>

            <hr/>

            <div className="row" style={ valVista === 'hechas' ? {} : { display: 'none' }}>
                <div className="col">
                    <h4 style={{ fontWeight: 'bold'}}>
                        Valoraciones ({valoracionesAlo.length})
                    </h4>

                    <hr/>

                    <h5 style={ valoracionesAlo.length === 0 ? {} : { display: 'none' }}>
                        No has valorado ningún alojamiento.
                    </h5>

                    <table className="table">   
                        <tbody>
                        {
                            valoracionesAlo.map((x, index) => (

                                <tr key={index} className="tabla-seleccion" onClick={() => { window.location.href = '/alojamiento/ver?casa=' +x.alojamientoID }}>

                                    <td>
                                        <FontAwesomeIcon icon={faLocationDot} style={{ color: 'green' }} /> {x.ubicacion}
                                        <br/>
                                        <FontAwesomeIcon icon={faStar}/> {x.valoracionMedia} <span className="text-muted">({x.vecesValorado})</span>
                                    </td> 

                                    <td>        
                                        Llegada: {x.valLlegada}<br/>
                                        Veracidad: {x.valVeracidad}<br/>
                                        Comunicación: {x.valComunicacion}<br/>
                                        Ubicación: {x.valUbicacion}<br/>
                                        Limpieza: {x.valLimpieza}<br/>
                                        Calidad: {x.valCalidad}<br/>
                                    </td>

                                    <td>
                                        {new Date(x.creadaEn).toLocaleDateString('es-ES', fechaOptions)}<br/>
                                        <strong>{x.mensaje}</strong>
                                    </td> 
                                </tr> 
                            ))
                        }
                        </tbody>
                    </table>

                    <div className="text-center" style={ valoracionesAlo.length > 0 ? {} : { display: 'none' }}>
                        <Button className="filtros-botones" onClick={() => { obtenerAlojamientosHechas(++paginaHechasAlojamientos) }} id="mas-hechas">
                            <FontAwesomeIcon icon={faArrowDown} /> Mostrar más
                        </Button>
                    </div>
                </div>
            </div>

            <div className="row" style={ valVista === 'hechas-2' ? {} : { display: 'none' }}>
                <div className="col">
                    <h4 style={{ fontWeight: 'bold'}}>
                        Valoraciones ({valoracionesUser.length})
                    </h4>

                    <hr/>

                    <h5 style={ valoracionesUser.length === 0 ? {} : { display: 'none' }}>
                        No has valorado ningún usuario.
                    </h5>
                    
                    <table className="table">   
                        <tbody>
                        {
                            valoracionesUser.map((x, index) => (

                                <tr key={index} className="tabla-seleccion" onClick={() => { window.location.href = '/usuario/ver/' +x.userValoradoID }}>

                                    <td>
                                        <strong>{x.nombre}</strong> de {x.residencia}
                                        <br/>
                                        Registrado en {new Date(x.fechaReg).toLocaleDateString('es-ES', fechaOptions)}
                                    </td>

                                    <td>
                                        {new Date(x.creadoEn).toLocaleDateString('es-ES', fechaOptions)}<br/>
                                        <strong>{x.mensaje}</strong>
                                    </td> 
                                </tr> 
                            ))
                        }
                        </tbody>
                    </table>

                    <div className="text-center" style={ valoracionesUser.length > 0 ? {} : { display: 'none' }}>
                        <Button className="filtros-botones" onClick={() => { obtenerUsuariosHechas(++paginaHechasUsuarios) }} id="mas-hechas-2">
                            <FontAwesomeIcon icon={faArrowDown} /> Mostrar más
                        </Button>
                    </div>
                </div>
            </div>

            <div className="row" style={ valVista === 'recibidas' ? {} : { display: 'none' }}>
                <div className="col">
                    <h4 style={{ fontWeight: 'bold'}}>
                        Valoraciones ({recibidasAlo.length})
                    </h4>

                    <hr/>

                    <h5 style={ recibidasAlo.length === 0 ? {} : { display: 'none' }}>
                        No te han valorado ningún alojamiento.
                    </h5>
                    
                    <table className="table">   
                        <tbody>
                        {
                            recibidasAlo.map((x, index) => (

                                <tr key={index} style={{ verticalAlign: 'middle' }}>

                                    <td style={ x.sinLeer === 0 ? { } : { display: 'none' }}>
                                        <span style={{backgroundColor: '#476cff', padding: '6px', borderRadius: '10px', fontWeight: 'bold', color: 'white' }}>
                                            Nueva
                                        </span>
                                    </td> 

                                    <td style={ x.sinLeer !== 0 ? { } : { display: 'none' }}>
                                        <span style={{backgroundColor: '#ff962c', padding: '6px', borderRadius: '10px', fontWeight: 'bold', color: 'white' }}>
                                            Vista
                                        </span>
                                    </td> 

                                    <td className="tabla-seleccion" onClick={() => { window.location.href = '/alojamiento/ver?casa=' +x.alojamientoID }}>
                                        <FontAwesomeIcon icon={faLocationDot} style={{ color: 'green' }} /> {x.ubicacion}
                                        <br/>
                                        <FontAwesomeIcon icon={faStar}/> {x.valoracionMedia} <span className="text-muted">({x.vecesValorado})</span>
                                    </td>

                                    <td className="tabla-seleccion" onClick={() => { window.location.href = '/usuario/ver/' +x.alojamientoID }}>
                                        <strong>{x.nombre}</strong> de {x.residencia}
                                        <br/>
                                        Registrado en {new Date(x.fechaReg).toLocaleDateString('es-ES', fechaOptions)}
                                    </td> 

                                    <td>
                                        {new Date(x.creadaEn).toLocaleDateString('es-ES', fechaOptions)}<br/>
                                        <strong>{x.mensaje}</strong>
                                    </td> 
                                </tr> 
                            ))
                        }
                        </tbody>
                    </table>

                    <div className="text-center" style={ recibidasAlo.length > 0 ? {} : { display: 'none' }}>
                        <Button className="filtros-botones" onClick={() => { obtenerAlojamientosRecibidas(paginaRecibidasAlojamientos) }} id="mas-recibidas">
                            <FontAwesomeIcon icon={faArrowDown} /> Mostrar más
                        </Button>
                    </div>
                </div>
            </div>

            <div className="row" style={ valVista === 'recibidas-2' ? {} : { display: 'none' }}>
                <div className="col">
                    <h4 style={{ fontWeight: 'bold'}}>
                        Valoraciones ({recibidasUser.length})
                    </h4>

                    <hr/>

                    <h5 style={ recibidasUser.length === 0 ? {} : { display: 'none' }}>
                        No te han valorado ningún usuario.
                    </h5>
                    
                    <table className="table">   
                        <tbody>
                        {
                            recibidasUser.map((x, index) => (

                                <tr key={index}  style={{ verticalAlign: 'middle' }} className="tabla-seleccion" onClick={() => { window.location.href = '/usuario/ver/' +x.usuarioID }}>

                                    <td style={ x.sinLeer === 0 ? { } : { display: 'none' }}>
                                        <span style={{backgroundColor: '#476cff', padding: '6px', borderRadius: '10px', fontWeight: 'bold', color: 'white' }}>
                                            Nueva
                                        </span>
                                    </td> 

                                    <td style={ x.sinLeer !== 0 ? { } : { display: 'none' }}>
                                        <span style={{backgroundColor: '#ff962c', padding: '6px', borderRadius: '10px', fontWeight: 'bold', color: 'white' }}>
                                            Vista
                                        </span>
                                    </td> 

                                    <td>
                                        <strong>{x.nombre}</strong> de {x.residencia}
                                        <br/>
                                        Registrado en {new Date(x.fechaReg).toLocaleDateString('es-ES', fechaOptions)}
                                    </td>

                                    <td style={ x.tipo === 0 ? { } : { display: 'none' }}>
                                        <span style={{backgroundColor: '#50d932', padding: '6px', borderRadius: '10px', fontWeight: 'bold', color: 'white' }}>
                                            Positiva
                                        </span>
                                    </td> 

                                    <td style={ x.tipo !== 0 ? { } : { display: 'none' }}>
                                        <span style={{backgroundColor: '#ff2c2c', padding: '6px', borderRadius: '10px', fontWeight: 'bold', color: 'white' }}>
                                            Negativa
                                        </span>
                                    </td> 

                                    <td>
                                        {new Date(x.creadoEn).toLocaleDateString('es-ES', fechaOptions)}<br/>
                                        <strong>{x.mensaje}</strong>
                                    </td> 
                                </tr> 
                            ))
                        }
                        </tbody>
                    </table>

                    <div className="text-center" style={ recibidasUser.length > 0 ? {} : { display: 'none' }}>
                        <Button className="filtros-botones" onClick={() => { obtenerUsuariosRecibidas(paginaRecibidasUsuarios) }} id="mas-recibidas-2">
                            <FontAwesomeIcon icon={faArrowDown} /> Mostrar más
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserValoraciones;