import React,{ useEffect, useState } from "react";

import ValorarModal from './ValorarModal';
import ValorarVerModal from './ValorarVerModal';
import ValorarModalInquilino from './ValorarModalInquilino';

import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faLocationDot, faPen, faStar, faMagnifyingGlass, faBan, faCheck, faMessage, faCalendar, faDownload } from '@fortawesome/free-solid-svg-icons';

import Button from 'react-bootstrap/Button';

var totalGanancias = [];
const cantidadColumnas = 5;

function UserReservas({ changeLogged }) {

    const [reservasActivas, setReservasActivas] = useState([]);
    const [reservasInactivas, setReservasinActivas] = useState(null);

    const [alojamientosActivos, setAlojamientosActivos] = useState([]);
    const [alojamientosInactivos, setAlojamientosInactivos] = useState(null);

    const [ganancias, setGanancias] = useState({});
    const [gananciasInfo, setGananciasInfo] = useState([]);

    //

    useEffect(() => {
        obtenerReservasUsuario();
        otenerReservasAlojamientos();
        obtenerGanancias();
    }, []);

    const obtenerReservasUsuario = async () => {
        const data = await fetch('/perfil/mis-reservas/activas', { method: 'GET' });
        const items = await data.json();

        if(items.respuesta === 'err_user') {
            changeLogged(false);

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {
            setReservasActivas(items.reservas);
        }
    };

    const otenerReservasAlojamientos = async () => {
        const data = await fetch('/perfil/mis-reservas/alojamientos/activas', { method: 'GET' });
        const items = await data.json();

        if(items.respuesta === 'err_user') {
            changeLogged(false);

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {
            setAlojamientosActivos(items.reservas);
        }
    };

    const obtenerGanancias = async (mes) => {
        const data = await fetch('/perfil/mis-ganancias/' +mes, { method: 'GET' });
        const items = await data.json();

        if(items.respuesta === 'err_user') {
            changeLogged(false);

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {
            setGanancias(items.mesInfo);

            setGananciasInfo(items.reservasInfo.splice(0, cantidadColumnas));
            totalGanancias = items.reservasInfo;
        }
    };

    const obtenerReservasAnteriores = async () => {
        const data = await fetch('/perfil/mis-reservas/antiguas', { method: 'GET' });
        const items = await data.json();

        if(items.respuesta === 'err_user') {
            changeLogged(false);

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {
            setReservasinActivas(items.reservas);
        }
    };

    const obtenerAlojamientosAnteriores = async () => {
        const data = await fetch('/perfil/mis-reservas/alojamientos/antiguas', { method: 'GET' });
        const items = await data.json();

        if(items.respuesta === 'err_user') {
            changeLogged(false);

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {
            setAlojamientosInactivos(items.reservas);
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

    const enviarMensaje = (index) => {
        window.location.href = '/perfil/mis-chats?user=' +reservasActivas[index].propietarioID+ '&nombre=' +reservasActivas[index].propietarioNombre;
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

    const verValoracionAlojamiento = (index) => {

        setInfoValoracion({
            reservaID:  alojamientosInactivos[index].reservaID,
            alojamientoID: alojamientosInactivos[index].alojamientoID,
            ubicacion: alojamientosInactivos[index].ubicacion,
            valoracionMedia: alojamientosInactivos[index].valoracionMedia,
            vecesValorado: alojamientosInactivos[index].vecesValorado,

            userValoracion: alojamientosInactivos[index].userValoracion,
            hospedadorValoracion: alojamientosInactivos[index].hospedadorValoracion,
        });
    };

    //

    const reservaActiva = (index) => {
        window.open('/alojamiento/ver?casa=' +reservasActivas[index].alojamientoID, '_blank');
    };

    const reservaInactiva = (index) => {
        window.open('/alojamiento/ver?casa=' +reservasInactivas[index].alojamientoID, '_blank');
    };

    const alojamientoActivos = (index) => {
        window.open('/alojamiento/ver?casa=' +alojamientosActivos[index].alojamientoID, '_blank');
    };

    const alojamientoInactivos = (index) => {
        window.open('/alojamiento/ver?casa=' +alojamientosInactivos[index].alojamientoID, '_blank');
    };

    //

    const cancelarReservaAlojamiento = async (index) => {

        if(window.confirm('¿Estás seguro?') === false) {
            return;
        }

        const data = await fetch('/perfil/mis-reservas/alojamientos/cancelar/' +alojamientosActivos[index].reservaID, {  method: 'GET' });
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

        if(window.confirm('¿Estás seguro?') === false) {
            return;
        }

        const data = await fetch('/perfil/mis-reservas/alojamientos/aceptar/' +alojamientosActivos[index].reservaID, {  method: 'GET' });
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

    const obtenerMesAnterior = () => {
        obtenerGanancias(ganancias.mesAnteriorNumero+ '-' +ganancias.yearAnteriorNumero);
    }

    const obtenerMesSiguiente = () => {
        obtenerGanancias(ganancias.mesSiguienteNumero+ '-' +ganancias.yearSiguienteNumero);
    }

    const descargarFactura = async (tipo) => {

        var totalArray = gananciasInfo.concat(totalGanancias);

        const desactivarBtn = document.getElementById('descargar-btn');
        desactivarBtn.disabled = true;

        const data = await fetch('/perfil/mis-ganancias/descargar/' +tipo, 
        { 
            method: 'POST',

            body: JSON.stringify({
                mesNombre: ganancias.mes,
                mesYear: ganancias.year,

                primerDia: ganancias.primerDia,
                ultimoDia: ganancias.ultimoDia,

                reservas: totalArray,

                totalGanancias: ganancias.totalGanancias,

                //

                clienteNombre: ganancias.clienteNombre,
                clienteResidencia: ganancias.clienteResidencia,
            }),

            headers: {
                'Content-Type': 'application/json'
            },
        });

        if(data.status === 200) {
            const items = await data.blob();

            var a = document.createElement("a");
            a.href = window.URL.createObjectURL(items);
            a.download = ganancias?.mes+ '-' +ganancias?.year+ '.' +tipo;
            a.click();
        }

        desactivarBtn.disabled = false;
    };

    const mostrarMasGanancias = () => {
        setGananciasInfo([...gananciasInfo, ...totalGanancias]);
        totalGanancias = [];
    };

    const mostrarMenosGanancias = () => {
        setGananciasInfo(gananciasInfo.splice(0, cantidadColumnas));
        totalGanancias = gananciasInfo;
    };

    //

    return (
        <div className="container-fluid mb-5">
            <div className="row">
                <div className="col">

                    <button className={reservasVista === 'reservas' ? "btn-no-style btn-activo" : "btn-no-style"} onClick={() => { cambiarVista('reservas') }} id="btn-visitante">
                        Mis reservas
                    </button>

                    <span className="vista-separador">/</span>

                    <button className={reservasVista === 'alojamientos' ? "btn-no-style btn-activo" : "btn-no-style"} onClick={() => { cambiarVista('alojamientos') }} id="btn-hospedador">
                        Mis alojamientos
                    </button>

                    <span className="vista-separador">/</span>

                    <button className={reservasVista === 'ganancias' ? "btn-no-style btn-activo" : "btn-no-style"} onClick={() => { cambiarVista('ganancias') }} >
                        Mis ganancias
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

                                        <td className="tabla-seleccion" onClick={() => { reservaActiva(index) }}>
                                            <FontAwesomeIcon icon={faLocationDot} /> {x.ubicacion}
                                            <br/>
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

                                                <Button size="sm" className="filtros-botones" style={x.estado.puedeEnviarMensaje ? {} : { display: 'none'}} onClick={() => { enviarMensaje(index) }}>
                                                    <FontAwesomeIcon icon={faMessage} />&nbsp; Enviar mensaje
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

                    <div style={ reservasInactivas !== null ? {} : { display: 'none' } }>

                        <h5 style={{ fontWeight: 'bold' }}>
                            Anteriores ({reservasInactivas?.length})
                        </h5>

                        <div className="col">

                            <hr/>           

                            <table className="table" style={ reservasInactivas?.length !== 0 ? {} : { display: 'none' } }>
                                <tbody>
                                    {reservasInactivas?.map((x, index) => (

                                        <tr key={index} style={{ verticalAlign: 'middle' }}>
                                            <td>
                                                <span style={{backgroundColor: x.estado.color, padding: '6px', borderRadius: '10px', fontWeight: 'bold', color: 'white' }}>
                                                    {x.estado.texto}
                                                </span>
                                            </td>

                                            <td className="tabla-seleccion" onClick={() => { reservaInactiva(index) }}>
                                                <FontAwesomeIcon icon={faLocationDot} /> {x.ubicacion}
                                                <br/>
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
                        <Button className="filtros-botones" size="sm" onClick={obtenerAlojamientosAnteriores} style={ alojamientosInactivos === null ? {} : { display: 'none' }}>
                            <FontAwesomeIcon icon={faArrowDown} /> Mostrar anteriores
                        </Button>
                    </div>

                    <div style={ alojamientosInactivos !== null ? {} : { display: 'none' } }>

                        <h5 style={{ fontWeight: 'bold' }}>
                            Anteriores ({alojamientosInactivos?.length})
                        </h5>

                        <div className="col">

                            <hr/>           

                            <table className="table" style={ alojamientosInactivos?.length !== 0 ? {} : { display: 'none' } }>
                                <tbody>
                                    {alojamientosInactivos?.map((x, index) => (

                                        <tr key={index} style={{ verticalAlign: 'middle' }}>
                                            <td>
                                                <span style={{backgroundColor: x.estado.color, padding: '6px', borderRadius: '10px', fontWeight: 'bold', color: 'white' }}>
                                                    {x.estado.texto}
                                                </span>
                                            </td>

                                            <td className="tabla-seleccion" onClick={() => { alojamientoInactivos(index) }}>
                                                <FontAwesomeIcon icon={faLocationDot} /> {x.ubicacion}
                                                <br/>
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

                                                    <Button size="sm" className="crear-botones" style={x.estado.texto === 'Valorada' ? {} : { display: 'none'}} onClick={() => { verValoracionAlojamiento(index) }}>
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

            <div style={ reservasVista === 'ganancias' ? {} : { display: 'none' } }>

                <h4 style={{ fontWeight: 'bold' }}> 
                    {ganancias?.mes} DE {ganancias?.year}
                </h4>

                <small className="text-muted">
                    {ganancias?.primerDia} - {ganancias?.ultimoDia}
                </small>

                <span style={{ float: 'right', display: ganancias?.reservas === 0 ? 'none' : '' }}>
                    <Button className="crear-botones" size="sm" onClick={() => { descargarFactura('csv'); }} id="descargar-btn">
                        <FontAwesomeIcon icon={faDownload} /> Descargar .csv
                    </Button>

                    &nbsp;

                    <Button className="borrar-botones" size="sm" onClick={() => { descargarFactura('pdf'); }} id="descargar-btn">
                        <FontAwesomeIcon icon={faDownload} /> Descargar .pdf
                    </Button>
                </span>

                <hr />

                <div className="row" style={ ganancias?.reservas === 0 ? { } : { display: 'none' }}>
                    <div className="col">
                        <h4>
                            No hay datos sobre este mes.
                        </h4>

                        <hr/>
                    </div>
                </div>

                <div className="row" style={ ganancias?.reservas > 0 ? { } : { display: 'none' }}>
                    <div className="col">

                        <table className="table">
                            <tbody>
                                <tr>
                                    <td>
                                        ID:
                                    </td>
                                    <td>
                                        {ganancias?.clienteID}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Cliente:
                                    </td>
                                    <td>
                                        {ganancias?.clienteNombre}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Reservas:
                                    </td>
                                    <td>
                                        {ganancias?.reservas}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                    </div>
                    <div className={window.innerWidth < 600 ? '' : "col"}>

                        <table className="table">
                            <thead>
                                <tr>
                                    <td>
                                        ID
                                    </td>
                                    <td>
                                        Info
                                    </td>
                                    <td>
                                        Coste
                                    </td>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    gananciasInfo?.map((x, index) => (
                                        <tr key={index}>
                                            <td>
                                                {x.ID}
                                            </td>
                                            <td>
                                                <small className="text-muted">
                                                    {x.dias} noches x {x.precioBase}€
                                                </small>
                                            </td>
                                            <td>
                                                {x.costeTotal.toLocaleString("de-DE")}€
                                            </td>
                                        </tr>
                                    ))
                                }

                                <tr style={totalGanancias.length !== 0 ? {} : { display: 'none' }}>
                                    <td>...</td>
                                    <td>...</td>
                                    <td>...</td>
                                </tr>

                                <tr style={{ fontWeight: 'bold' }}>
                                    <td>
                                        Total:
                                    </td>
                                    <td>
                                    </td>
                                    <td>
                                        {ganancias?.totalGanancias?.toLocaleString("de-DE")}€
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                                
                        <div className="text-center">
                            <Button className="filtros-botones text-center" size="sm" onClick={mostrarMasGanancias} style={totalGanancias.length !== 0 ? {} : { display: 'none' }}>
                                <FontAwesomeIcon icon={faArrowDown} /> Mostrar todo
                            </Button>

                            <Button className="filtros-botones text-center" size="sm" onClick={mostrarMenosGanancias} style={totalGanancias.length === 0 && gananciasInfo?.length > cantidadColumnas ? {} : { display: 'none' }}>
                                <FontAwesomeIcon icon={faArrowUp} /> Mostrar menos
                            </Button>
                        </div>
                    </div>
                </div>

                <Button className="filtros-botones" size="sm" onClick={obtenerMesAnterior}>
                    <FontAwesomeIcon icon={faCalendar} /> {ganancias?.mesAnterior} DE {ganancias?.yearAnteriorNumero}
                </Button>

                &nbsp;&nbsp;

                <Button className="crear-botones" size="sm" style={ ganancias?.mesSiguiente !== '' ? {} : { display: 'none' }} onClick={obtenerMesSiguiente}>
                    <FontAwesomeIcon icon={faCalendar} /> {ganancias?.mesSiguiente} DE {ganancias?.yearSiguienteNumero}
                </Button>

            </div>

            <ValorarModal infoAlojamiento={infoAlojamiento} funcionCerrar={cerrarValorar} valoracionCorrecto={valoracionCorrecto} />
            <ValorarVerModal valoraciones={infoValoracion} funcionCerrar={cerrarValorarVer} />
            <ValorarModalInquilino infoHuesped={infoHuesped} funcionCerrar={cerrarHuesped} valoracionCorrecto={inquilinoValorado}/>
        </div>
    );
}

export default UserReservas;