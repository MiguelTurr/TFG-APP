import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBan, faCheckDouble, faArrowDown, faScrewdriverWrench, faUnlock, faArrowRight, faClose, faMessage } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';


var totalUsuarios = [];
const conexionOptions = { year: 'numeric', month: 'short', day: 'numeric' };
const totalPagina = 3;

const fechaHoy = new Date();

function Adminusuarios({ changeLogged }) {

    const navigate = useNavigate();

    //

    const [userList, setUserList] = useState([]);
    const [paginacion, setPaginacion] = useState(0);
    const [maxPagina, setMaxPagina] = useState(0);
    const buscarMensaje = useRef('');

    useEffect(() => {
        obtenerUsuarios();
    }, []);

    const obtenerUsuarios = async () => {

        const data = await fetch('/admin/usuarios', { method: 'GET' });
        const items = await data.json();

        if(items.respuesta === 'err_user') {
            changeLogged(false);

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'err_rol') {
            window.localStorage.setItem('isAdmin', 0);
            window.location.href = '/';

        } else if(items.respuesta === 'correcta') {
            totalUsuarios = items.usuarios;
            setDefaultElements();
        }
    };

    const comprobarConexion = (fecha) => {

        if(fecha === null) return 'Desconocida';

        const convert = new Date(fecha);
        const horasDiferencia = (fechaHoy.getTime() - convert.getTime()) / 1000 * 60 * 60;

        if(horasDiferencia < 10) {
            return 'Reciente';

        } else if(fechaHoy.getMonth() === convert.getMonth() && fechaHoy.getDate() === convert.getDate()) {
            return 'Hoy';
        }

        return convert.toLocaleDateString('es-ES', conexionOptions);
    };

    const comprobarEstado = (estado) => {

        const estado_color = {
            'Sin verificar': '#476cff',
            Activa: '#50d932',
            Bloqueada: '#ff2c2c',
            Inactiva: '#c8c8c8',
            Desactivada: '#c8c8c8',
        };

        return estado_color[estado];
    };

    const mostrarOpciones = (estado, rol, index) => {

        if(estado === 'Sin verificar') {
            return (
                <>
                    <OverlayTrigger placement='left' overlay={ <Tooltip>Verificar cuenta</Tooltip> }>
                        <FontAwesomeIcon className="admin-icon" icon={faCheckDouble} style={{ color: 'green' }} onClick={() => modificarDato('verificar', index) }/>
                    </OverlayTrigger> 
                    &nbsp;
                    <OverlayTrigger placement='left' overlay={ <Tooltip>Bloquear cuenta</Tooltip> }>
                        <FontAwesomeIcon className="admin-icon" icon={faBan} style={{ color: 'red' }} onClick={() => modificarDato('ban', index) }/>
                    </OverlayTrigger>
                </>
            );
 
        } else if(estado === 'Activa') {

            if(rol === 'Admin') {
                return (
                    <>
                        <OverlayTrigger placement='left' overlay={ <Tooltip>Quitar rol</Tooltip> }>
                            <FontAwesomeIcon className="admin-icon" icon={faArrowDown} style={{ color: 'purple' }} onClick={() => modificarDato('quitar_admin', index) }/>
                        </OverlayTrigger>
                        &nbsp;
                        <OverlayTrigger placement='left' overlay={ <Tooltip>Enviar mensaje</Tooltip> }>
                            <FontAwesomeIcon className="admin-icon" icon={faMessage} style={{ color: 'violet' }} onClick={() => enviarMensaje(index) }/>
                        </OverlayTrigger>
                    </>
                );
            }

            return (
                <>
                    <OverlayTrigger placement='left' overlay={ <Tooltip>Bloquear cuenta</Tooltip> }>
                        <FontAwesomeIcon className="admin-icon" icon={faBan} style={{ color: 'red' }} onClick={() => modificarDato('ban', index) }/>
                    </OverlayTrigger>
                    &nbsp;
                    <OverlayTrigger placement='left' overlay={ <Tooltip>Dar admin</Tooltip> }>
                        <FontAwesomeIcon className="admin-icon" icon={faScrewdriverWrench} style={{ color: 'blue' }} onClick={() => modificarDato('dar_admin', index) }/>
                    </OverlayTrigger>
                    &nbsp;
                    <OverlayTrigger placement='left' overlay={ <Tooltip>Enviar mensaje</Tooltip> }>
                        <FontAwesomeIcon className="admin-icon" icon={faMessage} style={{ color: 'violet' }} onClick={() => enviarMensaje(index) }/>
                    </OverlayTrigger>
                </>
            );
 
        } else if(estado === 'Bloqueada') {
            return (
                <OverlayTrigger placement='left' overlay={ <Tooltip>Desbloquear cuenta</Tooltip> }>
                    <FontAwesomeIcon className="admin-icon" icon={faUnlock} style={{ color: 'orange' }} onClick={() => modificarDato('desban', index) }/>
                </OverlayTrigger>
            );
        } 
    };

    const modificarDato = async (tipo, index) => {

        const data = await fetch('/admin/usuarios/editar', { 
            method: 'POST',

            body: JSON.stringify({
                opcion: tipo,
                userId: userList[index].ID,
            }),

            headers: {
                'Content-Type': 'application/json'
            }
        });

        const items = await data.json();

        if(items.respuesta === 'err_user') {
            changeLogged(false);

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'err_rol') {
            window.localStorage.setItem('isAdmin', 0);
            window.location.href = '/';

        } else if(items.respuesta === 'err_super') {
            crearAlerta('error', '¡No puedes hacer esto!');

        } else if(items.respuesta === 'correcta') {
            const array = [...userList];

            if(tipo === 'verificar' || tipo === 'desban') {
                array[index].estado = 'Activa';
        
            } else if(tipo === 'ban') {
                array[index].estado = 'Bloqueada';
        
            } else if(tipo === 'dar_admin') {
                array[index].rol = 'Admin';

            } else if(tipo === 'quitar_admin') {
                array[index].rol = 'Usuario';
            }

            setUserList(array);
            crearAlerta('exito', '¡Usuario editado!');
        }
    };

    const enviarMensaje = (index) => {
        window.open('/perfil/mis-chats/' +userList[index].ID, '_blank');
    };

    const restarPagina = () => {

        const primeraPagina = (paginacion - 1) * totalPagina;
        const ultimaPagina = primeraPagina + totalPagina;

        setPaginacion(paginacion - 1);
        setUserList(totalUsuarios.slice(primeraPagina, ultimaPagina));
    }; 

    const sumarPagina = () => {

        const primeraPagina = (paginacion + 1) * totalPagina;
        const ultimaPagina = primeraPagina + totalPagina;

        setPaginacion(paginacion + 1);
        setUserList(totalUsuarios.slice(primeraPagina, ultimaPagina));
    }; 

    //

    const buscarUsuario = (e) => {

        if(e.target.value === '') return setDefaultElements();

        var buscarArray = totalUsuarios.filter((element) => element.nombre.toLowerCase().includes(e.target.value.toLowerCase()) === true);

        setUserList(buscarArray.slice(0, totalPagina));
        setPaginacion(0);

        var paginas = Math.floor(buscarArray.length / totalPagina);
        if(buscarArray.length % totalPagina === 0) {
            paginas --;
        }
        setMaxPagina(paginas);
    };

    const borrarBusqueda = () => {
        buscarMensaje.current.value = '';
        setDefaultElements();
    };

    const setDefaultElements = () => {

        setUserList(totalUsuarios.slice(0, totalPagina));
        setPaginacion(0);

        var paginas = Math.floor(totalUsuarios.length / totalPagina);
        if(totalUsuarios.length % totalPagina === 0) {
            paginas --;
        }
        setMaxPagina(paginas);
    };

    //

    return (
        <div className="container-fluid">
            <h4 style={{ fontWeight: 'bold' }}>
                ADMINISTRACIÓN &gt; USUARIOS
            </h4>

            <hr />

            <div className="row">
                <div className="col">

                    <Button className="filtros-botones" size="sm" onClick={() => { navigate('/admin'); }}>
                        <FontAwesomeIcon icon={faArrowLeft} /> Volver
                    </Button>

                    <span className={window.innerWidth < 600 ? "elements-user-mobile" : "elements-user"}>
                        <Button className="borrar-botones" onClick={borrarBusqueda} style={ buscarMensaje.current.value === '' ? { display: 'none' } : {} }>
                            <FontAwesomeIcon icon={faClose} />
                        </Button>

                        &nbsp;

                        <input className="buscar-user-input" type="text" placeholder="Busca aquí el usuario!" ref={buscarMensaje} onChange={buscarUsuario} />
                    </span>

                    <hr/>

                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>
                                        ID
                                    </th>
                                    <th>
                                        Estado
                                    </th>
                                    <th>
                                        Nombre
                                    </th>
                                    <th>
                                        Email
                                    </th>
                                    <th>
                                        Conexión
                                    </th>
                                    <th>
                                        Rol
                                    </th>
                                    <th>
                                        Opciones
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {
                                    userList.map((e, index) => (
                                        <tr key={index}>
                                            <td>
                                                {e.ID}
                                            </td>
                                            <td>
                                                <span className="estado-cuenta" style={{backgroundColor: comprobarEstado(e.estado) }}>
                                                    {e.estado}
                                                </span>
                                            </td>
                                            <td>
                                                {e.nombre}
                                            </td>
                                            <td>
                                                {e.email}
                                            </td>
                                            <td>
                                                {comprobarConexion(e.ultimaConexion)}
                                            </td>
                                            <td>
                                                {e.rol}
                                            </td>
                                            <td>
                                                { mostrarOpciones(e.estado, e.rol, index) }
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>

                    <div className="col" style={maxPagina > 0 ? {} : { display: 'none' }}>

                        <Button className="filtros-botones" size="sm" disabled={paginacion === 0} onClick={restarPagina}>
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </Button>

                        &nbsp;

                        <span style={{ fontWeight: 'bold' }}>
                            {paginacion} / {maxPagina}
                        </span>

                        &nbsp;

                        <Button className="filtros-botones" size="sm" disabled={paginacion === maxPagina} onClick={sumarPagina}>
                            <FontAwesomeIcon icon={faArrowRight} />
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Adminusuarios;