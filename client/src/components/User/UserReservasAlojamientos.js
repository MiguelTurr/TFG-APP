import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { crearAlerta } from '../Toast/Toast.js';

import ValorarVerModal from './ValorarVerModal';
import ValorarModalInquilino from './ValorarModalInquilino';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faLocationDot, faPen, faStar, faMagnifyingGlass, faBan, faCheck } from '@fortawesome/free-solid-svg-icons';

import Button from 'react-bootstrap/Button';

function UserReservasAlojamientos({ changeLogged }) {

    const navigate = useNavigate();

    //

    const [alojamientosActivos, setAlojamientosActivos] = useState([]);
    const [alojamientosInactivos, setAlojamientosInactivos] = useState(null);

    useEffect(() => {
        otenerReservasAlojamientos();
    }, []);

    const otenerReservasAlojamientos = async () => {
        const data = await fetch('/perfil/mis-reservas/alojamientos/activas', { method: 'GET' });
        const items = await data.json();

        if (items.respuesta === 'err_user') {
            changeLogged(false);

        } else if (items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if (items.respuesta === 'correcto') {
            setAlojamientosActivos(items.reservas);
        }
    };

    const obtenerAlojamientosAnteriores = async () => {
        const data = await fetch('/perfil/mis-reservas/alojamientos/antiguas', { method: 'GET' });
        const items = await data.json();

        if (items.respuesta === 'err_user') {
            changeLogged(false);

        } else if (items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if (items.respuesta === 'correcto') {
            setAlojamientosInactivos(items.reservas);
        }
    };

    //

    const [infoHuesped, setInfoHuesped] = useState(null);
    const cerrarHuesped = () => { setInfoHuesped(null) };

    const valorarInquilino = (index) => {
        setInfoHuesped({
            reservaID: alojamientosActivos[index].reservaID,
            alojamientoID: alojamientosActivos[index].alojamientoID,
            usuarioID: alojamientosActivos[index].usuarioID,
            index: index,

            // ALOJAMIENTO

            ubicacion: alojamientosActivos[index].ubicacion,
            valoracionMedia: alojamientosActivos[index].valoracionMedia,
            vecesValorado: alojamientosActivos[index].vecesValorado,

            // USUARIO

            fechaReg: alojamientosActivos[index].fechaReg,
            nombre: alojamientosActivos[index].nombre,
            residencia: alojamientosActivos[index].residencia
        });
    };

    const inquilinoValorado = (index, userValoracion) => {
        crearAlerta('exito', '¡Valoración enviada!');
        setInfoHuesped(null);

        //

        const array = [...alojamientosActivos];

        array[index].estado.puedeValorar = false;
        array[index].estado.texto = 'Valorada';
        array[index].estado.color = '#c22bff'; // MORADO

        array[index].userValoracion = userValoracion;

        setAlojamientosActivos(array);
    };

    //

    const [infoValoracion, setInfoValoracion] = useState(null);
    const cerrarValorarVer = () => { setInfoValoracion(null) };

    const verValoracionAlojamiento = (index) => {

        setInfoValoracion({
            reservaID: alojamientosInactivos[index].reservaID,
            alojamientoID: alojamientosInactivos[index].alojamientoID,
            ubicacion: alojamientosInactivos[index].ubicacion,
            valoracionMedia: alojamientosInactivos[index].valoracionMedia,
            vecesValorado: alojamientosInactivos[index].vecesValorado,

            userValoracion: alojamientosInactivos[index].userValoracion,
            hospedadorValoracion: alojamientosInactivos[index].hospedadorValoracion,
        });
    };

    //

    const alojamientoActivos = (index) => {
        window.open('/alojamiento/ver?casa=' + alojamientosActivos[index].alojamientoID, '_blank');
    };

    const alojamientoInactivos = (index) => {
        window.open('/alojamiento/ver?casa=' + alojamientosInactivos[index].alojamientoID, '_blank');
    };

    const cancelarReservaAlojamiento = async (index) => {

        if (window.confirm('¿Estás seguro?') === false) {
            return;
        }

        const data = await fetch('/perfil/mis-reservas/alojamientos/cancelar/' + alojamientosActivos[index].reservaID, { method: 'GET' });
        const items = await data.json();

        if (items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if (items.respuesta === 'correcto') {
            crearAlerta('exito', '¡Reserva cancelada!');

            const array = [...alojamientosActivos];

            array[index].estado.puedeValorar = false;
            array[index].estado.puedeModificar = false;
            array[index].estado.texto = 'Cancelado';
            array[index].estado.color = '#ff2c2c'; // ROJO

            setAlojamientosActivos(array);
        }
    };

    const confirmarReservaAlojamiento = async (index) => {

        if (window.confirm('¿Estás seguro?') === false) {
            return;
        }

        const data = await fetch('/perfil/mis-reservas/alojamientos/aceptar/' + alojamientosActivos[index].reservaID, { method: 'GET' });
        const items = await data.json();

        if (items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if (items.respuesta === 'correcto') {
            crearAlerta('exito', '¡Reserva confirmada!');

            const array = [...alojamientosActivos];

            array[index].estado.puedeValorar = false;
            array[index].estado.puedeModificar = false;
            array[index].estado.texto = 'Aceptada';
            array[index].estado.color = '#50d932'; // VERDE

            setAlojamientosActivos(array);
        }
    };

    //

    return (
        <div className="container-fluid mb-5">
            <div className="row">
                <div className="col">

                    <button className="btn-no-style" onClick={() => { navigate('/perfil/mis-reservas') }} >
                        Mis reservas
                    </button>

                    <span className="vista-separador">/</span>

                    <button className="btn-no-style btn-activo">
                        Mis alojamientos
                    </button>

                    <span className="vista-separador">/</span>

                    <button className="btn-no-style" onClick={() => { navigate('/perfil/mis-reservas/ganancias') }} >
                        Mis ganancias
                    </button>
                </div>
            </div>

            <hr />

            <div className="row">
                <h5 style={{ fontWeight: 'bold' }}>
                    Activas ({alojamientosActivos.length})
                </h5>

                <div className="col">

                    <hr />

                    <table className="table">
                        <tbody>
                            {alojamientosActivos.map((x, index) => (

                                <tr key={index} style={{ verticalAlign: 'middle' }}>
                                    <td>
                                        <span style={{ backgroundColor: x.estado.color, padding: '6px', borderRadius: '10px', fontWeight: 'bold', color: 'white' }}>
                                            {x.estado.texto}
                                        </span>
                                    </td>

                                    <td className="tabla-seleccion" onClick={() => { alojamientoActivos(index) }}>
                                        <FontAwesomeIcon icon={faLocationDot} /> {x.ubicacion}
                                        <br />
                                        <FontAwesomeIcon icon={faStar} /> {x.valoracionMedia} <span className="text-muted">({x.vecesValorado})</span>
                                    </td>

                                    <td>
                                        {x.fechas}
                                        <br />
                                        <small>
                                            {x.viajeros} personas &#183; {x.mascotas} mascotas
                                        </small>
                                        <br />
                                        <small className="text-muted">
                                            {x.dias} días x {x.precioBase}€ -&gt;
                                        </small>
                                        &nbsp;
                                        {x.costeTotal.toLocaleString("de-DE")}€
                                    </td>
                                    <td>
                                        <div className="d-grid gap-2">

                                            <Button
                                                size="sm"
                                                className="crear-botones"
                                                style={x.estado.puedeModificar ? {} : { display: 'none' }}
                                                onClick={() => { confirmarReservaAlojamiento(index) }}>
                                                <FontAwesomeIcon icon={faCheck} />&nbsp; Confirmar
                                            </Button>

                                            <Button
                                                size="sm" className="borrar-botones"
                                                style={x.estado.puedeModificar ? {} : { display: 'none' }}
                                                onClick={() => { cancelarReservaAlojamiento(index) }}>
                                                <FontAwesomeIcon icon={faBan} />&nbsp; Cancelar
                                            </Button>

                                            <Button size="sm" className="crear-botones" style={x.estado.puedeValorar ? {} : { display: 'none' }} onClick={() => { valorarInquilino(index) }}>
                                                <FontAwesomeIcon icon={faPen} />&nbsp; Valorar
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                        </tbody>
                    </table>
                </div>
            </div>

            <div className="row">
                <div>
                    <Button className="filtros-botones" size="sm" onClick={obtenerAlojamientosAnteriores} style={alojamientosInactivos === null ? {} : { display: 'none' }}>
                        <FontAwesomeIcon icon={faArrowDown} /> Mostrar anteriores
                    </Button>
                </div>

                <div style={alojamientosInactivos !== null ? {} : { display: 'none' }}>

                    <h5 style={{ fontWeight: 'bold' }}>
                        Anteriores ({alojamientosInactivos?.length})
                    </h5>

                    <div className="col">

                        <hr />

                        <table className="table" style={alojamientosInactivos?.length !== 0 ? {} : { display: 'none' }}>
                            <tbody>
                                {alojamientosInactivos?.map((x, index) => (

                                    <tr key={index} style={{ verticalAlign: 'middle' }}>
                                        <td>
                                            <span style={{ backgroundColor: x.estado.color, padding: '6px', borderRadius: '10px', fontWeight: 'bold', color: 'white' }}>
                                                {x.estado.texto}
                                            </span>
                                        </td>

                                        <td className="tabla-seleccion" onClick={() => { alojamientoInactivos(index) }}>
                                            <FontAwesomeIcon icon={faLocationDot} /> {x.ubicacion}
                                            <br />
                                            <FontAwesomeIcon icon={faStar} /> {x.valoracionMedia} <span className="text-muted">({x.vecesValorado})</span>
                                        </td>

                                        <td>
                                            {x.fechas}
                                            <br />
                                            <small>
                                                {x.viajeros} personas &#183; {x.mascotas} mascotas
                                            </small>
                                            <br />
                                            <small className="text-muted">
                                                {x.dias} días x {x.precioBase}€ -&gt;
                                            </small>
                                            &nbsp;
                                            {x.costeTotal.toLocaleString("de-DE")}€
                                        </td>
                                        <td>
                                            <div className="d-grid gap-2">

                                                <Button size="sm" className="crear-botones" style={x.estado.texto === 'Valorada' ? {} : { display: 'none' }} onClick={() => { verValoracionAlojamiento(index) }}>
                                                    <FontAwesomeIcon icon={faMagnifyingGlass} />&nbsp; Ver valoración
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            <ValorarVerModal valoraciones={infoValoracion} funcionCerrar={cerrarValorarVer} />
            <ValorarModalInquilino infoHuesped={infoHuesped} funcionCerrar={cerrarHuesped} valoracionCorrecto={inquilinoValorado} />
        </div>
    );
}

export default UserReservasAlojamientos;