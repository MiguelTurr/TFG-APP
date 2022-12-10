import React, { useEffect, useState} from "react";
import { useLocation } from "react-router-dom";

import { crearAlerta } from '../Toast/Toast.js';

import NoProfileImg from '../../img/no-profile-img.png';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faMessage, faHeart, faDownload, faLocationDot, faKitchenSet, faWifi, faPaw, faParking, faSwimmingPool, faWater, faAirFreshener, faThermometer, faTelevision, faStopwatch, faSmoking, faGift, faStar } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";
import ProgressBar from 'react-bootstrap/ProgressBar';

function VerAlojamiento() {

    var regFecha = { year: 'numeric', month: 'long' };

    const location = useLocation();
    const params = new URLSearchParams(location.search);

    const [alojamiento, setAlojamiento] = useState({});
    const [alojamientoImagenes, setAlojamientoImagenes] = useState([]);
    const [alojamientoUsuario, setAlojamientoUsuario] = useState({});
    const [usuarioImg, setusuarioImg] = useState(NoProfileImg);
    const [valoraciones, setValoraciones] = useState([]);

    useEffect(() => {

        const alojamientoId = params.get('casa');

        cargarAlojamiento(alojamientoId);
        cargarValoraciones(alojamientoId);
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

    //

    const copiarAlojamiento = () => {
        crearAlerta('exito', '¡Has copiado el link!');
        navigator.clipboard.writeText(window.location.href);
    };

    const addFavorito = async () => {
        /*
        if(autorizado === false) {

        }*/

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
        crearAlerta('exito', 'quiere enviar mensaje')
    };

    const verValoraciones = () => {


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
                <div className="col">
                    {alojamiento.viajeros} viajeros &#183; {alojamiento.habitaciones} habitaciones &#183; {alojamiento.camas} camas &#183; {alojamiento.aseos} baños
                
                </div>

                <div className="col" style={{ textAlign: 'right' }}>

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

                <div className="col">
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
                <div className="col">
                    <h3>
                        ¿Quién es tu hospedador?
                    </h3>

                    <div className="row mb-3">

                        <div className="col-sm-2">
                            <img src={usuarioImg} key={usuarioImg} className="img-fluid rounded-pill" alt="Imagen de perfil del usuario"></img>
                        </div>

                        <div className="col">
                            <span style={{ fontSize: '20px' }}>
                                Hospedador: {alojamientoUsuario.nombre}
                            </span>

                            <br/>

                            <small>
                                Registrado en {new Date(alojamientoUsuario.creadoEn).toLocaleDateString('es-ES', regFecha)}
                            </small>

                        </div>
                    </div>

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
                            {alojamiento.vecesValorado} reseñas [ <FontAwesomeIcon icon={faStar} /> {parseFloat(alojamiento.valoracionMedia).toFixed(2)} ]
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
                    <h3>
                        Reserva ahora
                    </h3>
                    <small>
                        {alojamiento.precio}€ por noche
                    </small>


                </div>
            </div>
        </div>
    );
}

export default VerAlojamiento;