import React, { useEffect, useState} from "react";
import { useLocation } from "react-router-dom";

import "react-modern-calendar-datepicker/lib/DatePicker.css";
import { Calendar, utils } from "react-modern-calendar-datepicker";

import ValoracionesModal from './ValoracionesModal';
import LoginModal from '../Sesion/LoginModal';

import { crearAlerta } from '../Toast/Toast.js';
import userLogin from '../../js/autorizado';

import NoProfileImg from '../../img/no-profile-img.png';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faHouse, faMinus, faPlus, faAward, faMessage, faHeart, faDownload, faLocationDot, faKitchenSet, faWifi, faPaw, faParking, faSwimmingPool, faWater, faAirFreshener, faThermometer, faTelevision, faStopwatch, faSmoking, faGift, faStar } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";
import ProgressBar from 'react-bootstrap/ProgressBar';

function VerAlojamiento() {

    const { autorizado, setAutorizado } = userLogin();

    //

    var regFecha = { year: 'numeric', month: 'long' };

    const location = useLocation();
    const params = new URLSearchParams(location.search);

    const [alojamiento, setAlojamiento] = useState({});
    const [alojamientoImagenes, setAlojamientoImagenes] = useState([]);
    const [alojamientoUsuario, setAlojamientoUsuario] = useState({});
    const [usuarioImg, setusuarioImg] = useState(NoProfileImg);
    const [valoraciones, setValoraciones] = useState([]);
    const [diasReservados, setDiasReservados] = useState([]);

    useEffect(() => {

        const alojamientoId = params.get('casa');

        cargarAlojamiento(alojamientoId);
        cargarValoraciones(alojamientoId);
        cargarDiasReservados(alojamientoId);
    }, []);

    const cargarAlojamiento = async (id) => {
        const data = await fetch('/alojamiento/ver/' +id, { method: 'GET' });
        const items = await data.json();

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'err_datos') {
            window.location.href = '/';

        } else if(items.respuesta === 'correcto') {
            setAlojamiento(items.alojamiento[0]);
            cargarAlojamientoImagenes(items.alojamiento[0].imgCantidad, items.alojamiento[0].ID);
            cargarHospedador(items.alojamiento[0].usuarioID);
            cargarImagenHospedador(items.alojamiento[0].usuarioID);
        }   
    };

    const cargarAlojamientoImagenes = async (cantidad, id) => {

        var arrayImg = [];

        for(var i = 0; i < cantidad; i++) {

            const imagen = await fetch('/alojamiento/imagen/' +id+ '-' +i, { 
                method: 'GET',
        
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if(imagen.status === 200) {
                arrayImg.push(imagen.url);
            }
        }
        setAlojamientoImagenes(arrayImg);
    };

    const cargarHospedador = async (userId) => {

        const data = await fetch('/alojamiento/hospedador/' +userId, { 
            method: 'GET',
    
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();

        if(items.respuesta === 'err_db') {

        } else if(items.respuesta === 'err_datos') {

        } else if(items.respuesta === 'correcto') {
            setAlojamientoUsuario(items.hospedador);
        }
    };

    const cargarImagenHospedador = async (userId) => {

        const imagen = await fetch('/alojamiento/hospedador/foto/' +userId, { method: 'GET' });

        if(imagen.status === 200) {
            setusuarioImg(imagen.url);
        }
    };

    const cargarValoraciones = async (alojamientoId) => {

        const data = await fetch('/alojamiento/valoraciones/' +alojamientoId, { 
            method: 'GET',
    
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();

        if(items.respuesta === 'err_db') {

        } else if(items.respuesta === 'correcto') {
            setValoraciones(items.valoraciones);
        }
    };

    const cargarDiasReservados = async (alojamientoId) => {

        const data = await fetch('/alojamiento/reservas/dias/' +alojamientoId, { 
            method: 'GET',
    
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();

        if(items.respuesta === 'err_db') {

        } else if(items.respuesta === 'correcto') {
            setDiasReservados(items.reservados);
        }
    };

    //

    const copiarAlojamiento = () => {
        crearAlerta('exito', '¡Has copiado el link!');
        navigator.clipboard.writeText(window.location.href);
    };

    var [loginModal, setShowLogin] = useState(false);
    const cerrarLogin = () => setShowLogin(false);

    const addFavorito = async () => {

        if(autorizado === false) {
            return setShowLogin(true);
        }

        var opcion = 'remove-favorito';

        if(alojamiento.favorito === null) {
            opcion = 'add-favorito';
        }

        const data = await fetch('/alojamiento/' +opcion+ '/' +alojamiento.ID, {
            method: 'GET',
        
            headers: {
                'Content-Type': 'application/json'
            },

        });

        const items = await data.json();

        if(items.respuesta === 'err_user') {
            crearAlerta('error', '¡Ha ocurrido un error con el usuario!');

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {

            if(items.fav === false) {
                crearAlerta('exito', '¡Eliminado de favoritos!');
                setAlojamiento({ ...alojamiento, favorito: null});

            } else {
                crearAlerta('exito', '¡Añadido a favoritos!');
                setAlojamiento({ ...alojamiento, favorito: true});
            }
        }
    };

    const irPerfilHospedador = () => {
        window.location.href = '/usuario/ver/' +alojamientoUsuario.ID;
    };

    const enviarMensaje = () => {

        if(autorizado === false) {
            return setShowLogin(true);
        }
        window.location.href = '/perfil/mis-chats?user=' +alojamientoUsuario.ID+ '&nombre=' +alojamientoUsuario.nombre;
    };

    var [valoracionesModal, setShowValoraciones] = useState(false);
    const cerrarValoraciones = () => setShowValoraciones(false);

    const verValoraciones = () => {
        setShowValoraciones(true);
    };

    //

    const [selectedDayRange, setSelectedDayRange] = useState({
        from: null,
        to: null,
    });

    const [reservaInfo, setReservaInfo] = useState({
        huespedes: 1,
        mascotas: 0,
        noches: 1,
    });

    const reservarAlojamiento = () => {

        if(autorizado === false) {
            return setShowLogin(true);
        }

        var url = '/alojamiento/reservar/';
        url += alojamiento.ID+ '?personas=' +reservaInfo.huespedes;
        url += '&mascotas=' +reservaInfo.mascotas;
        url += '&entrada=' +reservaInfo.fechaEntrada;
        url += '&entrada=' +reservaInfo.fechaSalida;

        console.log(selectedDayRange.from);
        console.log(selectedDayRange.to);

        //window.location.href = url;
    };

    const botonesSumaResta = (e) => {
        var [opcion, operacion] = e.currentTarget.id.split('-');

        var valorActual = reservaInfo[opcion];

        if (operacion === 'resta') valorActual--;
        else valorActual++;

        setReservaInfo({ ...reservaInfo, [opcion]: valorActual, });
    };

    //
    
    return (
        <div className="container-fluid mt-4 mb-5" style={{ paddingLeft: '30px', paddingRight: '30px'}}>

            <div className="row">

                <div className="col">
                    <h4 style={{ fontWeight: 'bold' }}>
                        {alojamiento.titulo}
                    </h4>
                </div>          
            </div>

            <div className="row">  
                <div className={window.innerWidth < 600 ? "mb-2" : "col"}>
                    {alojamiento.viajeros} viajeros &#183; {alojamiento.habitaciones} habitaciones &#183; {alojamiento.camas} camas &#183; {alojamiento.aseos} baños
                
                </div>

                <div className="col" style={ window.innerWidth < 600 ? {} : { textAlign: 'right' }}>

                    <Button className="filtros-botones" size="sm" onClick={copiarAlojamiento}>
                        <FontAwesomeIcon icon={faDownload} /> Compartir
                    </Button>
                    &nbsp; &nbsp;
                    <Button className="filtros-botones" size="sm" onClick={addFavorito}>
                        <FontAwesomeIcon icon={faHeart} style={ alojamiento.favorito === null ? {} : { color: 'red' }}/> Favorito
                    </Button>
                </div>
            </div>

            <div className="row mb-3">
                <div className="col">
                    <FontAwesomeIcon icon={faLocationDot} /> <strong>{alojamiento.ubicacion}</strong>
                </div>
            </div>

            <div className="row">

                {
                    alojamientoImagenes.map((x, index) => (

                        <div className="col mb-3" key={index}>
                            <img 
                                height="250px"
                                src={x}>
                            </img>
                        </div>
                    ))
                }
            </div>

            <hr/>

            <div className="row">
                <div className="col">
                    <h3>
                        Descripción
                    </h3>
                    <div dangerouslySetInnerHTML={{__html: alojamiento.descripcion}} />
                </div>
            </div>

            <hr/>

            <div className="row">

                <div className={window.innerWidth < 600 ? "mb-2" : "col"}>
                    <h3>
                        ¿Qué hay en la casa?
                    </h3>
                    <div className="row">
                        <div className="col">

                            <ul className="lista-sin-numeros">
                                {
                                    alojamiento.cocina !== 0 && 
                                    <li style={{ padding: '7px', fontSize: '20px' }}>
                                        <FontAwesomeIcon icon={faKitchenSet} /> Cocina
                                    </li>
                                }
                                {
                                    alojamiento.wifi !== 0 && 
                                    <li style={{ padding: '7px', fontSize: '20px' }}>
                                        <FontAwesomeIcon icon={faWifi} /> Wifi
                                    </li>
                                }
                                {
                                    alojamiento.animales !== 0 && 
                                    <li style={{ padding: '7px', fontSize: '20px' }}>
                                        <FontAwesomeIcon icon={faPaw} /> Pueden mascotas
                                    </li>
                                }
                                {
                                    alojamiento.aparcamiento !== 0 && 
                                    <li style={{ padding: '7px', fontSize: '20px' }}>
                                        <FontAwesomeIcon icon={faParking} /> Aparcamiento
                                    </li>
                                }
                                {
                                    alojamiento.piscina !== 0 && 
                                    <li style={{ padding: '7px', fontSize: '20px' }}>
                                        <FontAwesomeIcon icon={faSwimmingPool} /> Piscina
                                    </li>
                                }
                            </ul>
                        </div>
                        <div className="col">
                            <ul className="lista-sin-numeros">
                                {
                                    alojamiento.lavadora !== 0 && 
                                    <li style={{ padding: '7px', fontSize: '20px' }}>
                                        <FontAwesomeIcon icon={faWater} /> Lavadora
                                    </li>
                                }
                                {
                                    alojamiento.aire !== 0 && 
                                    <li style={{ padding: '7px', fontSize: '20px' }}>
                                        <FontAwesomeIcon icon={faAirFreshener} /> Aire acondicionado
                                    </li>
                                }
                                {
                                    alojamiento.calefaccion !== 0 && 
                                    <li style={{ padding: '7px', fontSize: '20px' }}>
                                        <FontAwesomeIcon icon={faThermometer} /> Calefacción
                                    </li>
                                }
                                {
                                    alojamiento.television !== 0 && 
                                    <li style={{ padding: '7px', fontSize: '20px' }}>
                                        <FontAwesomeIcon icon={faTelevision} /> Televisión
                                    </li>
                                }
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="col text-center">
                    <h3>
                        Normas
                    </h3>
                    <ul className="lista-sin-numeros">
                        {
                            alojamiento.horaEntrada !== null && 
                            <li style={{ padding: '7px', fontSize: '20px' }}>
                                <FontAwesomeIcon icon={faStopwatch} /> Hora entrada: {alojamiento.horaEntrada}
                            </li>
                        }
                        {
                            alojamiento.horaSalida !== null && 
                            <li style={{ padding: '7px', fontSize: '20px' }}>
                                <FontAwesomeIcon icon={faStopwatch} /> Hora salida: {alojamiento.horaSalida}
                            </li>
                        }
                        {
                            alojamiento.puedeFumar !== 0 && 
                            <li style={{ padding: '7px', fontSize: '20px' }}>
                                <FontAwesomeIcon icon={faSmoking} /> Se puede fumar
                            </li>
                        }
                        {
                            alojamiento.puedeFiestas !== 0 && 
                            <li style={{ padding: '7px', fontSize: '20px' }}>
                                <FontAwesomeIcon icon={faGift} /> Se pueden hacer fiestas
                            </li>
                        }
                    </ul>
                </div>
            </div>

            <hr/>

            <div className="row">
                <div className={window.innerWidth < 600 ? "mb-2" : "col"}>
                    <h3>
                        ¿Quién es tu hospedador?
                    </h3>

                    <div className="row mb-3">

                        <div className="col-sm-2">
                            <img src={usuarioImg} key={usuarioImg} className="img-fluid rounded-pill" alt="Imagen de perfil del usuario"></img>
                        </div>

                        <div className={window.innerWidth < 600 ? "col text-center" : "col"}>
                            <span style={{ fontSize: '20px' }}>
                                Hospedador: {alojamientoUsuario.nombre}
                            </span>

                            <br/>

                            <small>
                                Registrado en {new Date(alojamientoUsuario.creadoEn).toLocaleDateString('es-ES', regFecha)}
                            </small>

                        </div>
                    </div>

                    <hr style={window.innerWidth < 600 ? {} : {display: 'none'}}/>

                    <div className="mt-3">
                        <Button className="filtros-botones" size="sm" onClick={irPerfilHospedador}>
                            <FontAwesomeIcon icon={faUser} /> Ir al perfil
                        </Button>

                        &nbsp;&nbsp;

                        <Button className="filtros-botones" size="sm" onClick={enviarMensaje}>
                            <FontAwesomeIcon icon={faMessage} /> Enviar mensaje
                        </Button>
                    </div>

                </div>
                
                {alojamiento.vecesValorado === 0 &&

                    <div className="col">
                        <h3>
                            No hay ninguna valoración.
                        </h3>
                    </div>
                }

                {alojamiento.vecesValorado !== 0 &&
                    <div className="col">
                        <h3>
                            <FontAwesomeIcon icon={faStar} /> {parseFloat(alojamiento.valoracionMedia).toFixed(2)} <span className="text-muted">({alojamiento.vecesValorado})</span>
                        </h3>

                        <ul className="lista-sin-numeros">
                            <li>
                                <div className="row">
                                    <div className="col">
                                        Llegada
                                    </div>

                                    <div className="col">
                                        <ProgressBar now={valoraciones.llegada} max="5" />
                                    </div>

                                    <div className="col">
                                        {valoraciones.llegada}
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div className="row">
                                    <div className="col">
                                        Veracidad
                                    </div>

                                    <div className="col">
                                        <ProgressBar now={valoraciones.veracidad} max="5" />
                                    </div>

                                    <div className="col">
                                        {valoraciones.veracidad}
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div className="row">
                                    <div className="col">
                                        Comunicación
                                    </div>

                                    <div className="col">
                                        <ProgressBar now={valoraciones.comunicacion} max="5" />
                                    </div>

                                    <div className="col">
                                        {valoraciones.comunicacion}
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div className="row">
                                    <div className="col">
                                        Ubicación
                                    </div>

                                    <div className="col">
                                        <ProgressBar now={valoraciones.ubicacion} max="5" />
                                    </div>

                                    <div className="col">
                                        {valoraciones.ubicacion}
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div className="row">
                                    <div className="col">
                                        Limpieza
                                    </div>

                                    <div className="col">
                                        <ProgressBar now={valoraciones.limpieza} max="5" />
                                    </div>

                                    <div className="col">
                                        {valoraciones.limpieza}
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div className="row">
                                    <div className="col">
                                        Calidad
                                    </div>

                                    <div className="col">
                                        <ProgressBar now={valoraciones.calidad} max="5" />
                                    </div>

                                    <div className="col">
                                        {valoraciones.calidad}
                                    </div>
                                </div>
                            </li>
                        </ul>

                        <div className="d-grid gap-2">
                            <Button className="filtros-botones" size="sm" onClick={verValoraciones}>
                                <FontAwesomeIcon icon={faStar} /> Mostrar comentarios
                            </Button>
                        </div>

                    </div>
                }
                
            </div>

            <hr/>

            <div className="row">
                <div className="col">

                    <h5>
                        ¿Interesado en el alojamiento?
                    </h5>

                    <span style={{ fontWeight: 'bold' }}>

                        {alojamiento.precio}€ por noche
                        <br />
                        <FontAwesomeIcon icon={faAward} /> Descuento de {alojamiento.descuento}%

                    </span>

                    <h3>
                        <Button className="reservar-botones mt-2" onClick={reservarAlojamiento}>
                            <FontAwesomeIcon icon={faHouse} /> Reserva desde {reservaInfo.huespedes * alojamiento.precio * reservaInfo.noches}€
                        </Button>
                    </h3>
                </div>
                <div className="col">

                    <h5>
                        ¿Qué fechas quieres viajar?
                    </h5>

                    <br/>

                    <Calendar
                        minimumDate={utils().getToday()}
                        value={selectedDayRange}
                        onChange={setSelectedDayRange}
                        calendarClassName="responsive-calendar"
                        disabledDays={diasReservados}
                    />

                </div>
                <div className="col">

                    <h5>
                        ¿Quiénes van a viajar?
                    </h5>

                    <div className="row mt-4">

                        <div className="col">
                            Viajeros
                        </div>
                        <div className="col">
                            <Button id="huespedes-resta" disabled={reservaInfo.huespedes <= 1} className="rounded-pill btn-plus-minus" size="sm" onClick={botonesSumaResta}>
                                <FontAwesomeIcon icon={faMinus} style={{ color: 'black' }} />
                            </Button>
                        </div>
                        <div className="col">
                            <h5>
                                {reservaInfo.huespedes}
                            </h5>
                        </div>
                        <div className="col">
                            <Button id="huespedes-suma" disabled={reservaInfo.huespedes >= alojamiento.viajeros} className="rounded-pill btn-plus-minus" size="sm" onClick={botonesSumaResta}>
                                <FontAwesomeIcon icon={faPlus} style={{ color: 'black' }} />
                            </Button>
                        </div>
                    </div>

                    <div className="row mt-3" style={ alojamiento.animales === true ? {} : { display: 'none' }}>
                        <div className="col">
                            Mascotas
                        </div>
                        <div className="col">
                            <Button id="mascota-resta" disabled={reservaInfo.mascotas <= 1} className="rounded-pill btn-plus-minus" size="sm" onClick={botonesSumaResta}>
                                <FontAwesomeIcon icon={faMinus} style={{ color: 'black' }} />
                            </Button>
                        </div>
                        <div className="col">
                            <h5>
                                {reservaInfo.mascotas}
                            </h5>
                        </div>
                        <div className="col">
                            <Button id="mascota-suma" className="rounded-pill btn-plus-minus" size="sm" onClick={botonesSumaResta}>
                                <FontAwesomeIcon icon={faPlus} style={{ color: 'black' }} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            

            <LoginModal mostrar={loginModal} funcionCerrar={cerrarLogin} />
            <ValoracionesModal mostrar={valoracionesModal} funcionCerrar={cerrarValoraciones} />
        </div>
    );
}

export default VerAlojamiento;