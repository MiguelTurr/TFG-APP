import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faLocationDot, faArrowDown } from '@fortawesome/free-solid-svg-icons';

import Button from 'react-bootstrap/Button';

var paginaHechasAlojamientos = 0; 

const fechaOptions = { year: 'numeric', month: 'long', day: 'numeric' };

function ValoracionesAlojamientos({ changeLogged }) {

    const navigate = useNavigate();

    //

    const [valoracionesAlo, setValoracionesAlo] = useState([]);

    //

    useEffect(() => {
        paginaHechasAlojamientos = 0;
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

        } else if(items.respuesta === 'err_user') {
            changeLogged(false);

        } else if(items.respuesta === 'correcto') {
            setValoracionesAlo([...valoracionesAlo, ...items.valoracion]);

            if(items.valoracion.length === 0) {
                btn.disabled = true;
            }
        }
    };

    //
 
    return (

        <div className="container-fluid mb-5">
            
            <div className="row">
                <div className="col">

                    <button className="btn-no-style btn-activo">
                        Hechas-Alojamientos
                    </button>

                    <span className="vista-separador">/</span>          

                    <button className="btn-no-style" onClick={() => { navigate('/perfil/mis-valoraciones/usuarios') }}>
                        Hechas-Usuarios
                    </button>

                    <span className="vista-separador">/</span>

                    <button className="btn-no-style" onClick={() => { navigate('/perfil/mis-valoraciones/recibidas-alojamientos') }}>
                        Recibidas-Alojamientos
                    </button>

                    <span className="vista-separador">/</span>

                    <button className="btn-no-style" onClick={() => { navigate('/perfil/mis-valoraciones/recibidas-usuarios') }}>
                        Recibidas-Usuarios
                    </button>
                </div>
            </div>

            <hr/>

            <div className="row">
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

                                <tr key={index} className="tabla-seleccion" onClick={() => { window.location.href = '/alojamiento/ver?casa=' +x.alojamientoID }} style={{ verticalAlign: 'middle' }}>

                                    <td>
                                        <FontAwesomeIcon icon={faLocationDot} style={{ color: 'green' }} /> {x.ubicacion}
                                        <br/>
                                        <FontAwesomeIcon icon={faStar}/> {x.valoracionMedia} <span className="text-muted">({x.vecesValorado})</span>
                                    </td> 

                                    <td>  
                                        <small>    
                                            Llegada: {x.valLlegada}<br/>
                                            Veracidad: {x.valVeracidad}<br/>
                                            Comunicación: {x.valComunicacion}<br/>
                                            Ubicación: {x.valUbicacion}<br/>
                                            Limpieza: {x.valLimpieza}<br/>
                                            Calidad: {x.valCalidad}<br/>
                                        </small>  
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
        </div>
    );
}

export default ValoracionesAlojamientos;