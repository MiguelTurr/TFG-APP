import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';

import NoProfileImg from '../../img/no-profile-img.png';

import Button from 'react-bootstrap/Button';

var paginaHechasUsuarios = 0;

const fechaOptions = { year: 'numeric', month: 'long', day: 'numeric' };

function ValoracionesUsuarios({ changeLogged }) {

    const navigate = useNavigate();

    //

    const [valoracionesUser, setValoracionesUser] = useState([]);
    const [sendUserImg, setSendUserImg] = useState([]);

    useEffect(() => {
        paginaHechasUsuarios = 0;
        obtenerUsuariosHechas(paginaHechasUsuarios);
    }, []);

    const obtenerUsuariosHechas = async (columnas) => {

        const btn = document.getElementById('mas-hechas-2');
        btn.disabled = true;

        const data = await fetch('/perfil/mis-valoraciones/hechas-user/' +columnas, { method: 'GET' });
        const items = await data.json();

        btn.disabled = false;

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'err_user') {
            changeLogged(false);

        } else if(items.respuesta === 'correcto') {
            setValoracionesUser([...valoracionesUser, ...items.valoracion]);

            const len = items.valoracion.length;
            
            if(len === 0) {
                btn.disabled = true;

            } else {

                var arrayImg = [];

                for(var i = 0; i < len; i++) {
                    
                    const perfil = await fetch('/alojamiento/imagen/hospedador/' +items.valoracion[i].userValoradoID, { method: 'GET' });

                    if(perfil.status === 200) {
                        arrayImg.push(perfil.url);

                    } else {
                        arrayImg.push(NoProfileImg);
                    }
                }
                setSendUserImg([...sendUserImg, ...arrayImg]);
            }
        }
    };

    //
    return (

        <div className="container-fluid mb-5">
            
            <div className="row">
                <div className="col">

                    <button className="btn-no-style" onClick={() => { navigate('/perfil/mis-valoraciones/alojamientos'); }}>
                        Hechas-Alojamientos
                    </button>

                    <span className="vista-separador">/</span>          

                    <button className="btn-no-style btn-activo">
                        Hechas-Usuarios
                    </button>

                    <span className="vista-separador">/</span>

                    <button className="btn-no-style" onClick={() => { navigate('/perfil/mis-valoraciones/recibidas-alojamientos'); }}>
                        Recibidas-Alojamientos
                    </button>

                    <span className="vista-separador">/</span>

                    <button className="btn-no-style" onClick={() => { navigate('/perfil/mis-valoraciones/recibidas-usuarios'); }}>
                        Recibidas-Usuarios
                    </button>
                </div>
            </div>

            <hr/>

            <div className="row">
                <div className="col">
                    <h4 style={{ fontWeight: 'bold'}}>
                        Valoraciones ({valoracionesUser.length})
                    </h4>

                    <hr/>

                    <h5 style={ valoracionesUser.length === 0 ? {} : { display: 'none' }}>
                        No has valorado ningún usuario.
                    </h5>

                    <div className="table-responsive">
                        <table className="table">   
                            <tbody>
                            {
                                valoracionesUser.map((x, index) => (

                                    <tr key={index} className="tabla-seleccion" onClick={() => { window.location.href = '/usuario/ver/' +x.userValoradoID }} style={{ verticalAlign: 'middle' }}>

                                        <td> 
                                            <span style={{backgroundColor: x.tipo === 'Positiva' ? '#50d932' : '#ff2c2c', padding: '6px', borderRadius: '10px', fontWeight: 'bold', color: 'white' }}>
                                                {x.tipo}
                                            </span>
                                        </td> 

                                        <td className="text-center">
                                            <img
                                                className="rounded-pill"
                                                width="50%"
                                                key={index}
                                                src={sendUserImg[index]}
                                            />
                                            <br/>
                                            <strong>{x.nombre}</strong>
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
                    </div>

                    <div className="text-center" style={ valoracionesUser.length > 0 ? {} : { display: 'none' }}>
                        <Button className="filtros-botones" onClick={() => { obtenerUsuariosHechas(++paginaHechasUsuarios) }} id="mas-hechas-2">
                            <FontAwesomeIcon icon={faArrowDown} /> Mostrar más
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ValoracionesUsuarios;