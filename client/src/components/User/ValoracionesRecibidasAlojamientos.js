import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faLocationDot, faArrowDown } from '@fortawesome/free-solid-svg-icons';

import NoProfileImg from '../../img/no-profile-img.png';

import Button from 'react-bootstrap/Button';

var paginaRecibidasAlojamientos = 0;

const fechaOptions = { year: 'numeric', month: 'long', day: 'numeric' };

function ValoracionesRecibidasAlojamientos({ changeLogged }) {
    const navigate = useNavigate();

    //

    const [recibidasAlo, setRecibidasAlo] = useState([]);
    const [recibidaAloImg, setRecibidaAloImg] = useState([]);

    //

    useEffect(() => {
        paginaRecibidasAlojamientos = 0;
        obtenerAlojamientosRecibidas(paginaRecibidasAlojamientos);
    }, []);

    const obtenerAlojamientosRecibidas = async (columnas) => {

        const btn = document.getElementById('mas-recibidas');
        btn.disabled = true;

        const data = await fetch('/perfil/mis-valoraciones/recibidas-alo/' +columnas, { method: 'GET' });
        const items = await data.json();

        btn.disabled = false;

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'err_user') {
            changeLogged(false);

        } else if(items.respuesta === 'correcto') {
            setRecibidasAlo([...recibidasAlo, ...items.valoracion]);

            var len = items.valoracion.length;
            paginaRecibidasAlojamientos += len;

            if(len === 0) {
                btn.disabled = true;

            } else {
    
                var arrayImg = [];

                for(var i = 0; i < len; i++) {
                    
                    const perfil = await fetch('/alojamiento/imagen/hospedador/' +items.valoracion[i].usuarioID, { method: 'GET' });

                    if(perfil.status === 200) {
                        arrayImg.push(perfil.url);

                    } else {
                        arrayImg.push(NoProfileImg);
                    }
                }
                setRecibidaAloImg([...recibidaAloImg, ...arrayImg]);            
            }
        }
    };
    //
 
    return (

        <div className="container-fluid mb-5">
            
            <div className="row">
                <div className="col">

                    <button className="btn-no-style" onClick={() => { navigate('/perfil/mis-valoraciones/alojamientos') }}>
                        Hechas-Alojamientos
                    </button>

                    <span className="vista-separador">/</span>          

                    <button className="btn-no-style" onClick={() => { navigate('/perfil/mis-valoraciones/usuarios') }}>
                        Hechas-Usuarios
                    </button>

                    <span className="vista-separador">/</span>

                    <button className="btn-no-style btn-activo">
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

                                    <td className="text-center tabla-seleccion" onClick={() => { window.location.href = '/usuario/ver/' +x.usuarioID }} style={{ width: '7%' }}>
                                        <img
                                            className="img-fluid rounded-pill"
                                            key={index}
                                            src={recibidaAloImg[index]}
                                        />
                                        <br />
                                        <strong>{x.nombre}</strong>
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
        </div>
    );
}

export default ValoracionesRecibidasAlojamientos;