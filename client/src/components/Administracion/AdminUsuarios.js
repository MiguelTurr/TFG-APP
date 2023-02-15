import React, { useState, useEffect, useRef } from "react";

import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBan, faCheckDouble, faArrowDown, faScrewdriverWrench, faUnlock, faArrowRight, faClose } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";

var totalUsuarios = [];
const conexionOptions = { year: 'numeric', month: 'short', day: 'numeric' };
const totalPagina = 3;

function Adminusuarios({ show, cambiarVista }) {

    const [userList, setUserList] = useState([]);
    const [paginacion, setPaginacion] = useState(0);
    const [maxPagina, setMaxPagina] = useState(0);
    const buscarMensaje = useRef('');

    useEffect(() => {
        obtenerUsuarios();
    }, [show]);

    const obtenerUsuarios = async () => {
        if(show !== 'usuarios') return;

        const data = await fetch('/admin/usuarios', { method: 'GET' });
        const items = await data.json();

        /*if(items.respuesta === 'err_user') {
            changeLogged(false);

        } else */

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'err_rol') {
            window.localStorage.setItem('isAdmin', 0);
            window.location.href = '/';

        } else if(items.respuesta === 'correcta') {
            totalUsuarios = items.usuarios;
            setDefaultElements();
        }
    };

    if(show !== 'usuarios') return(<> </>);

    const fechaHoy = new Date();

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

        if(estado === 0) {
        
           return (
                <span className="estado-cuenta" style={{backgroundColor: '#476cff' }}>
                    Sin verificar
                </span>
           );

        } else if(estado === 1) {
        
            return (
                <span className="estado-cuenta" style={{backgroundColor: '#50d932' }}>
                    Activa
                </span>
            );

        } else if(estado === 2) {
        
            return (
                <span className="estado-cuenta" style={{backgroundColor: '#ff2c2c' }}>
                    Baneada
                </span>
            );

        } else if(estado === -1) {
        
            return (
                <span className="estado-cuenta" style={{backgroundColor: '#c8c8c8' }}>
                    Desactivada
                </span>
            );
        }
    };

    const mostrarOpciones = (estado, rol, index) => {

        if(rol === 1) return <FontAwesomeIcon className="admin-icon" icon={faArrowDown} style={{ color: 'purple' }} onClick={() => modificarDato('quitar_admin', index) }/>;

        if(estado === 0) {
            return (
                <>
                    <FontAwesomeIcon className="admin-icon" icon={faCheckDouble} style={{ color: 'green' }} onClick={() => modificarDato('verificar', index) }/>
                    &nbsp;
                    <FontAwesomeIcon className="admin-icon" icon={faBan} style={{ color: 'red' }} onClick={() => modificarDato('ban', index) }/>
                </>
            );
 
        } else if(estado === 1) {
            return (
                <>
                    <FontAwesomeIcon className="admin-icon" icon={faBan} style={{ color: 'red' }} onClick={() => modificarDato('ban', index) }/>
                    &nbsp;
                    <FontAwesomeIcon className="admin-icon" icon={faScrewdriverWrench} style={{ color: 'blue' }} onClick={() => modificarDato('dar_admin', index) }/>
                </>
            );
 
        } else if(estado === 2) {
            return <FontAwesomeIcon className="admin-icon" icon={faUnlock} style={{ color: 'orange' }}  onClick={() => modificarDato('desban', index) }/>;
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

        /*if(items.respuesta === 'err_user') {
            changeLogged(false);

        } else */

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'err_rol') {
            window.localStorage.setItem('isAdmin', 0);
            window.location.href = '/';

        } else if(items.respuesta === 'err_super') {
            crearAlerta('error', '¡No puedes hacer esto!');

        } else if(items.respuesta === 'correcta') {
            const array = [...userList];

            if(tipo === 'verificar') {
                array[index].activo = 1;
        
            } else if(tipo === 'ban') {
                array[index].activo = 2;
        
            } else if(tipo === 'desban') {
                array[index].activo = 1;
        
            } else if(tipo === 'dar_admin') {
                array[index].rol = 1;

            } else if(tipo === 'quitar_admin') {
                array[index].rol = 0;
            }

            setUserList(array);
            crearAlerta('exito', '¡Usuario editado!');
        }
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
        <div className="row">
            <div className="col">

                <Button className="filtros-botones" size="sm" onClick={() => { cambiarVista('general') }}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Volver
                </Button>

                <span className={window.innerWidth < 600 ? "elements-user-mobile" : "elements-user"}>
                    <Button className="borrar-botones" onClick={borrarBusqueda}>
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
                                            {comprobarEstado(e.activo)}
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
                                            { e.rol === 0 ? 'Usuario' : 'Admin' }
                                        </td>
                                        <td>
                                            { mostrarOpciones(e.activo, e.rol, index) }
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
    );
}

export default Adminusuarios;