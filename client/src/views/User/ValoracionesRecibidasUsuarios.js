import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';

import NoProfileImg from '../../img/no-profile-img.png';

import Button from 'react-bootstrap/Button';

var paginaRecibidasUsuarios = 0;

const fechaOptions = { year: 'numeric', month: 'long', day: 'numeric' };

function ValoracionesRecibidasAlojamientos({ changeLogged }) {
    const navigate = useNavigate();

    //

    const [recibidasUser, setRecibidasUser] = useState([]);
    const [recibidaUserImg, setRecibidaUserImg] = useState([]);

    //

    useEffect(() => {
        paginaRecibidasUsuarios = 0;
        obtenerUsuariosRecibidas(paginaRecibidasUsuarios);
    }, []);


    const obtenerUsuariosRecibidas = async (columnas) => {

        const btn = document.getElementById('mas-recibidas-2');
        btn.disabled = true;

        const data = await fetch('/perfil/mis-valoraciones/recibidas-user/' + columnas, { method: 'GET' });
        const items = await data.json();

        btn.disabled = false;

        if (items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if (items.respuesta === 'err_user') {
            changeLogged(false);

        } else if (items.respuesta === 'correcto') {
            setRecibidasUser([...recibidasUser, ...items.valoracion]);

            var len = items.valoracion.length;
            paginaRecibidasUsuarios += len;

            if (len === 0) {
                btn.disabled = true;

            } else {

                var arrayImg = [];

                for (var i = 0; i < len; i++) {

                    const perfil = await fetch('/alojamiento/imagen/hospedador/' + items.valoracion[i].usuarioID, { method: 'GET' });

                    if (perfil.status === 200) {
                        arrayImg.push(perfil.url);

                    } else {
                        arrayImg.push(NoProfileImg);
                    }
                }
                setRecibidaUserImg([...recibidaUserImg, ...arrayImg]);
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

                    <button className="btn-no-style" onClick={() => { navigate('/perfil/mis-valoraciones/recibidas-alojamientos') }}>
                        Recibidas-Alojamientos
                    </button>

                    <span className="vista-separador">/</span>

                    <button className="btn-no-style btn-activo">
                        Recibidas-Usuarios
                    </button>
                </div>
            </div>

            <hr />

            <div className="row">
                <div className="col">
                    <h4 style={{ fontWeight: 'bold' }}>
                        Valoraciones ({recibidasUser.length})
                    </h4>

                    <hr />

                    <h5 style={recibidasUser.length === 0 ? {} : { display: 'none' }}>
                        No te han valorado ningún usuario.
                    </h5>

                    <table className="table">
                        <tbody>
                            {
                                recibidasUser.map((x, index) => (

                                    <tr key={index} style={{ verticalAlign: 'middle' }} className="tabla-seleccion" onClick={() => { window.location.href = '/usuario/ver/' + x.usuarioID }}>

                                        <td>
                                            <span style={{ backgroundColor: '#476cff', padding: '6px', borderRadius: '10px', fontWeight: 'bold', color: 'white', display: x.sinLeer === 0 ? '' : 'none' }}>
                                                Nueva
                                            </span>

                                            <span style={{ backgroundColor: '#ff962c', padding: '6px', borderRadius: '10px', fontWeight: 'bold', color: 'white', display: x.sinLeer !== 0 ? '' : 'none' }}>
                                                Vista
                                            </span>

                                            &nbsp;&nbsp;

                                            <span style={{ backgroundColor: x.tipo === 'Positiva' ? '#50d932' : '#ff2c2c', padding: '6px', borderRadius: '10px', fontWeight: 'bold', color: 'white' }}>
                                                {x.tipo}
                                            </span>
                                        </td>

                                        <td className="text-center" style={{ width: '7%' }}>
                                            <img
                                                className="img-fluid rounded-pill"
                                                key={index}
                                                src={recibidaUserImg[index]}
                                            />
                                            <br />
                                            <strong>{x.nombre}</strong>
                                        </td>

                                        <td>
                                            {new Date(x.creadoEn).toLocaleDateString('es-ES', fechaOptions)}<br />
                                            <strong>{x.mensaje}</strong>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>

                    <div className="text-center" style={recibidasUser.length > 0 ? {} : { display: 'none' }}>
                        <Button className="filtros-botones" onClick={() => { obtenerUsuariosRecibidas(paginaRecibidasUsuarios) }} id="mas-recibidas-2">
                            <FontAwesomeIcon icon={faArrowDown} /> Mostrar más
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ValoracionesRecibidasAlojamientos;