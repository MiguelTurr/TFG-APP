import React,{ useEffect, useState } from "react";

import ValorarModal from './ValorarModal';
import ValorarVerModal from './ValorarVerModal';
import { crearAlerta } from '../Toast/Toast.js';
//import userLogin from '../../js/autorizado';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faLocationDot, faPen, faHouse, faStar, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

import Button from 'react-bootstrap/Button';

function UserReservas() {

    var fechaOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };

    const [reservasActivas, setReservasActivas] = useState([]);
    const [reservasInactivas, setReservasinActivas] = useState(null);

    //const [alojamientosReservas, setAlojamientosReservas] = useState([]);

    //

    useEffect(() => {
        obtenerReservasUsuario();
    }, []);

    const obtenerReservasUsuario = async () => {
        const data = await fetch('/perfil/mis-reservas/activas', { method: 'GET' });
        const items = await data.json();

        if(items.respuesta === 'err_user') {

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {
            setReservasActivas(items.reservas);
        }
    };

    const obtenerReservasAnteriores = async () => {
        const data = await fetch('/perfil/mis-reservas/antiguas', { method: 'GET' });
        const items = await data.json();

        if(items.respuesta === 'err_user') {

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {
            setReservasinActivas(items.reservas);
        }
    };

    //

    const [reservasVista, setReservasVista] = useState('reservas');

    const cambiarVista = (vsitaId) => {
        setReservasVista(vsitaId);
    };

    //

    const [infoAlojamiento, setInfoAlojamiento] = useState(null);
    const cerrarValorar = () => { setInfoAlojamiento(null) };

    const valorarReserva = (index) => {
        setInfoAlojamiento({
            reservaID:  reservasActivas[index].reservaID,
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

        var array = reservasActivas;

        array[index].estado.puedeValorar = false;
        array[index].estado.texto = 'Valorada';
        array[index].estado.color = '#c22bff'; // MORADO

        array[index].userValoracion = userValoracion;

        setReservasActivas(array);
    };

    //

    const [infoValoracion, setInfoValoracion] = useState(null);
    const cerrarValorarVer = () => { setInfoValoracion(null) };

    const verValoracion = (index) => {

        setInfoValoracion({
            reservaID:  reservasInactivas[index].reservaID,
            alojamientoID: reservasInactivas[index].alojamientoID,
            ubicacion: reservasInactivas[index].ubicacion,
            valoracionMedia: reservasInactivas[index].valoracionMedia,
            vecesValorado: reservasInactivas[index].vecesValorado,

            userValoracion: reservasInactivas[index].userValoracion,
            hospedadorValoracion: reservasInactivas[index].hospedadorValoracion,
        });
    };

    //

    const verAlojamiento = (index) => {
        window.open('/alojamiento/ver?casa=' +reservasActivas[index].alojamientoID, '_blank');
    };

    const verAlojamientoAntiguo = (index) => {
        window.open('/alojamiento/ver?casa=' +reservasInactivas[index].alojamientoID, '_blank');
    };

    return (
        <div className="container-fluid mb-5">
            <div className="row">
                <div className="col">

                    <button className={reservasVista === 'reservas' ? "btn-no-style btn-activo" : "btn-no-style"} onClick={() => { cambiarVista('reservas') }} id="btn-visitante">
                        Reservas
                    </button>

                    <span className="vista-separador">/</span>

                    <button className={reservasVista === 'alojamientos' ? "btn-no-style btn-activo" : "btn-no-style"} onClick={() => { cambiarVista('alojamientos') }} id="btn-hospedador">
                        Alojamientos
                    </button>
                </div>
            </div>

            <hr/>

            <div style={ reservasVista === 'reservas' ? {} : { display: 'none' } }>
                
                <div className="row">

                    <h5 style={{ fontWeight: 'bold' }}>
                        Activas ({reservasActivas.length})
                    </h5>

                    <div className="col">

                        <hr/>           

                        <table className="table">
                            <tbody>
                                {reservasActivas.map((x, index) => (

                                    <tr key={index} style={{ verticalAlign: 'middle' }}>
                                        <td>
                                            <span style={{backgroundColor: x.estado.color, padding: '6px', borderRadius: '10px', fontWeight: 'bold', color: 'white' }}>
                                                {x.estado.texto}
                                            </span>
                                        </td>
                                        <td>
                                            <FontAwesomeIcon icon={faLocationDot} /> {x.ubicacion}
                                            <br/>
                                            <FontAwesomeIcon icon={faStar} /> {x.valoracionMedia} <span className="text-muted">({x.vecesValorado})</span>
                                        </td>
                                        <td>
                                                {x.costeTotal}€
                                                <br/>
                                                {new Date(x.fechaEntrada).toLocaleDateString('es-ES', fechaOptions)} - {new Date(x.fechaSalida).toLocaleDateString('es-ES', fechaOptions)}
                                                <br/>
                                                <div>
                                                    <small className="text-muted">
                                                        {x.dias} días
                                                    </small>
                                                </div>
                                        </td>
                                        <td>
                                            <div className="d-grid gap-2">

                                                <Button size="sm" className="filtros-botones" onClick={() => { verAlojamiento(index) }}>
                                                    <FontAwesomeIcon icon={faHouse} />&nbsp; Ver alojamiento
                                                </Button>

                                                <Button size="sm" className="crear-botones" style={x.estado.puedeValorar ? {} : { display: 'none'}} onClick={() => { valorarReserva(index) }}>
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
                        <Button className="filtros-botones" size="sm" onClick={obtenerReservasAnteriores} style={ reservasInactivas === null ? {} : { display: 'none' }}>
                            <FontAwesomeIcon icon={faArrowDown} /> Mostrar anteriores
                        </Button>
                    </div>

                    <div style={ reservasInactivas !== null && reservasInactivas?.length !== 0 ? {} : { display: 'none' } }>

                        <h5 style={{ fontWeight: 'bold' }}>
                            Anteriores ({reservasInactivas?.length})
                        </h5>

                        <div className="col">

                            <hr/>           

                            <table className="table">
                                <tbody>
                                    {reservasInactivas?.map((x, index) => (

                                        <tr key={index} style={{ verticalAlign: 'middle' }}>
                                            <td>
                                                <span style={{backgroundColor: x.estado.color, padding: '6px', borderRadius: '10px', fontWeight: 'bold', color: 'white' }}>
                                                    {x.estado.texto}
                                                </span>
                                            </td>
                                            <td>
                                                <FontAwesomeIcon icon={faLocationDot} /> {x.ubicacion}
                                                <br/>
                                                <FontAwesomeIcon icon={faStar} /> {x.valoracionMedia} <span className="text-muted">({x.vecesValorado})</span>
                                            </td>
                                            <td>
                                                    {x.costeTotal}€
                                                    <br/>
                                                    {new Date(x.fechaEntrada).toLocaleDateString('es-ES', fechaOptions)} - {new Date(x.fechaSalida).toLocaleDateString('es-ES', fechaOptions)}
                                                    <br/>
                                                    <div>
                                                        <small className="text-muted">
                                                            {x.dias} días
                                                        </small>
                                                    </div>
                                            </td>
                                            <td>
                                                <div className="d-grid gap-2">

                                                    <Button size="sm" className="filtros-botones" onClick={() => { verAlojamientoAntiguo(index) }}>
                                                        <FontAwesomeIcon icon={faHouse} />&nbsp; Ver alojamiento
                                                    </Button>

                                                    <Button size="sm" className="crear-botones" style={x.estado.texto === 'Valorada' ? {} : { display: 'none'}} onClick={() => { verValoracion(index) }}>
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
            </div>

            <div style={ reservasVista === 'alojamientos' ? {} : { display: 'none' } }>
                
                <div className="row">
                    <h5 style={{ fontWeight: 'bold' }}>
                        Activas ({reservasActivas.length})
                    </h5>

                    <div className="col">

                    </div>
                </div>
            </div>

            <ValorarModal infoAlojamiento={infoAlojamiento} funcionCerrar={cerrarValorar} valoracionCorrecto={valoracionCorrecto} />
            <ValorarVerModal valoraciones={infoValoracion} funcionCerrar={cerrarValorarVer} />
        </div>
    );
}

export default UserReservas;