import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ValorarModal from './ValorarModal';
import ValorarVerModal from './ValorarVerModal';

import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faLocationDot, faPen, faStar, faMagnifyingGlass, faMessage } from '@fortawesome/free-solid-svg-icons';

import Button from 'react-bootstrap/Button';

function UserReservas({ changeLogged }) {

    const navigate = useNavigate();

    //

    const [reservasActivas, setReservasActivas] = useState([]);
    const [reservasInactivas, setReservasinActivas] = useState(null);

    //

    useEffect(() => {
        obtenerReservasUsuario();
    }, []);

    const obtenerReservasUsuario = async () => {
        const data = await fetch('/perfil/mis-reservas/activas', { method: 'GET' });
        const items = await data.json();

        if (items.respuesta === 'err_user') {
            changeLogged(false);

        } else if (items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if (items.respuesta === 'correcto') {
            setReservasActivas(items.reservas);
        }
    };

    const obtenerReservasAnteriores = async () => {
        const data = await fetch('/perfil/mis-reservas/antiguas', { method: 'GET' });
        const items = await data.json();

        if (items.respuesta === 'err_user') {
            changeLogged(false);

        } else if (items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if (items.respuesta === 'correcto') {
            setReservasinActivas(items.reservas);
        }
    };

    //

    const [infoAlojamiento, setInfoAlojamiento] = useState(null);
    const cerrarValorar = () => { setInfoAlojamiento(null) };

    const valorarReserva = (index) => {
        setInfoAlojamiento({
            reservaID: reservasActivas[index].reservaID,
            alojamientoID: reservasActivas[index].alojamientoID,
            index: index,
            ubicacion: reservasActivas[index].ubicacion,
            valoracionMedia: reservasActivas[index].valoracionMedia,
            vecesValorado: reservasActivas[index].vecesValorado,
        });
    };

    const valoracionCorrecto = (index, userValoracion) => {
        crearAlerta('exito', '¡Valoración enviada!');
        setInfoAlojamiento(null);

        //

        const array = [...reservasActivas];

        array[index].estado.puedeValorar = false;
        array[index].estado.texto = 'Valorada';
        array[index].estado.color = '#c22bff'; // MORADO

        array[index].userValoracion = userValoracion;

        setReservasActivas(array);
    };

    //

    const enviarMensaje = (index) => {
        window.location.href = '/perfil/mis-chats?user=' + reservasActivas[index].propietarioID + '&nombre=' + reservasActivas[index].propietarioNombre;
    };

    //

    const [infoValoracion, setInfoValoracion] = useState(null);
    const cerrarValorarVer = () => { setInfoValoracion(null) };

    const verValoracion = (index) => {

        setInfoValoracion({
            reservaID: reservasInactivas[index].reservaID,
            alojamientoID: reservasInactivas[index].alojamientoID,
            ubicacion: reservasInactivas[index].ubicacion,
            valoracionMedia: reservasInactivas[index].valoracionMedia,
            vecesValorado: reservasInactivas[index].vecesValorado,

            userValoracion: reservasInactivas[index].userValoracion,
            hospedadorValoracion: reservasInactivas[index].hospedadorValoracion,
        });
    };

    //

    const reservaActiva = (index) => {
        window.open('/alojamiento/ver?casa=' + reservasActivas[index].alojamientoID, '_blank');
    };

    const reservaInactiva = (index) => {
        window.open('/alojamiento/ver?casa=' + reservasInactivas[index].alojamientoID, '_blank');
    };

    //

    return (
        <div className="container-fluid mb-5">
            <div className="row">
                <div className="col">

                    <button className="btn-no-style btn-activo" >
                        Mis reservas
                    </button>

                    <span className="vista-separador">/</span>

                    <button className="btn-no-style" onClick={() => { navigate('/perfil/mis-reservas/alojamientos'); }}>
                        Mis alojamientos
                    </button>

                    <span className="vista-separador">/</span>

                    <button className="btn-no-style" onClick={() => { navigate('/perfil/mis-reservas/ganancias'); }} >
                        Mis ganancias
                    </button>
                </div>
            </div>

            <hr />

            <div className="row">

                <h5 style={{ fontWeight: 'bold' }}>
                    Activas ({reservasActivas.length})
                </h5>

                <div className="col">

                    <hr />

                    <table className="table">
                        <tbody>
                            {reservasActivas.map((x, index) => (

                                <tr key={index} style={{ verticalAlign: 'middle' }}>
                                    <td>
                                        <span style={{ backgroundColor: x.estado.color, padding: '6px', borderRadius: '10px', fontWeight: 'bold', color: 'white' }}>
                                            {x.estado.texto}
                                        </span>
                                    </td>

                                    <td className="tabla-seleccion" onClick={() => { reservaActiva(index) }}>
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

                                            <Button size="sm" className="filtros-botones" style={x.estado.puedeEnviarMensaje ? {} : { display: 'none' }} onClick={() => { enviarMensaje(index) }}>
                                                <FontAwesomeIcon icon={faMessage} />&nbsp; Enviar mensaje
                                            </Button>

                                            <Button size="sm" className="crear-botones" style={x.estado.puedeValorar ? {} : { display: 'none' }} onClick={() => { valorarReserva(index) }}>
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
                    <Button className="filtros-botones" size="sm" onClick={obtenerReservasAnteriores} style={reservasInactivas === null ? {} : { display: 'none' }}>
                        <FontAwesomeIcon icon={faArrowDown} /> Mostrar anteriores
                    </Button>
                </div>

                <div style={reservasInactivas !== null ? {} : { display: 'none' }}>

                    <h5 style={{ fontWeight: 'bold' }}>
                        Anteriores ({reservasInactivas?.length})
                    </h5>

                    <div className="col">

                        <hr />

                        <table className="table" style={reservasInactivas?.length !== 0 ? {} : { display: 'none' }}>
                            <tbody>
                                {reservasInactivas?.map((x, index) => (

                                    <tr key={index} style={{ verticalAlign: 'middle' }}>
                                        <td>
                                            <span style={{ backgroundColor: x.estado.color, padding: '6px', borderRadius: '10px', fontWeight: 'bold', color: 'white' }}>
                                                {x.estado.texto}
                                            </span>
                                        </td>

                                        <td className="tabla-seleccion" onClick={() => { reservaInactiva(index) }}>
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

                                                <Button size="sm" className="crear-botones" style={x.estado.texto === 'Valorada' ? {} : { display: 'none' }} onClick={() => { verValoracion(index) }}>
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

            <ValorarModal infoAlojamiento={infoAlojamiento} funcionCerrar={cerrarValorar} valoracionCorrecto={valoracionCorrecto} />
            <ValorarVerModal valoraciones={infoValoracion} funcionCerrar={cerrarValorarVer} />
        </div>
    );
}

export default UserReservas;