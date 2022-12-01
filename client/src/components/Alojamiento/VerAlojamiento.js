import React, { useEffect, useState} from "react";
import { useLocation } from "react-router-dom";

import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faDownload, faLocationDot, faKitchenSet, faWifi, faPaw, faParking, faSwimmingPool, faWater, faAirFreshener, faThermometer, faTelevision, faStopwatch, faSmoking, faGift, faStar } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";
import ProgressBar from 'react-bootstrap/ProgressBar';

function VerAlojamiento() {

    const location = useLocation();
    const params = new URLSearchParams(location.search);

    const [alojamiento, setAlojamiento] = useState({});
    const [alojamientoImagenes, setAlojamientoImagenes] = useState([]);
    const [alojamientoUsuario, setAlojamientoUsuario] = useState({});
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

        } else if(items.respuesta === 'correcto') {
            setAlojamiento(items.alojamiento[0]);
            cargarAlojamientoImagenes(items.alojamiento[0].imgCantidad, items.alojamiento[0].ID);
            cargarHospedador(items.alojamiento[0].usuarioID);
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

        } else if(items.respuesta === 'correcto') {
            setAlojamientoUsuario(items.hospedador);
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

                    <Button size="sm" onClick={copiarAlojamiento}>
                        <FontAwesomeIcon icon={faDownload} /> Compartir
                    </Button>
                    &nbsp; &nbsp;
                    <Button size="sm" onClick={addFavorito}>
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

                    {alojamientoUsuario.nombre} {alojamientoUsuario.apellidos}
                    <br/>
                    Registrado en {alojamientoUsuario.creadoEn}
                </div>
                <div className="col">
                    <h3>
                        <FontAwesomeIcon icon={faStar} /> {valoraciones.valMedia} - {valoraciones.valComentarios} reseñas
                    </h3>
                    
                    <ul className="lista-sin-numeros">
                        <li>
                            <div className="row">
                                <div className="col">
                                    Llegada
                                </div> 

                                <div className="col">
                                    <ProgressBar now={valoraciones.valLlegada} max="5"/>
                                </div>

                                <div className="col">
                                    {valoraciones.valLlegada}
                                </div> 
                            </div>
                        </li>
                        <li>
                            <div className="row">
                                <div className="col">
                                    Veracidad
                                </div> 

                                <div className="col">
                                    <ProgressBar now={valoraciones.valVeracidad} max="5"/>
                                </div>

                                <div className="col">
                                    {valoraciones.valVeracidad}
                                </div> 
                            </div>
                        </li>
                        <li>
                            <div className="row">
                                <div className="col">
                                    Comunicación
                                </div> 

                                <div className="col">
                                    <ProgressBar now={valoraciones.valComunicacion} max="5"/>
                                </div>

                                <div className="col">
                                    {valoraciones.valComunicacion}
                                </div> 
                            </div>
                        </li>
                        <li>
                            <div className="row">
                                <div className="col">
                                    Ubicación
                                </div> 

                                <div className="col">
                                    <ProgressBar now={valoraciones.valUbicacion} max="5"/>
                                </div>

                                <div className="col">
                                    {valoraciones.valUbicacion}
                                </div> 
                            </div>
                        </li>
                        <li>
                            <div className="row">
                                <div className="col">
                                    Limpieza
                                </div> 

                                <div className="col">
                                    <ProgressBar now={valoraciones.valLimpieza} max="5"/>
                                </div>

                                <div className="col">
                                    {valoraciones.valLimpieza}
                                </div> 
                            </div>
                        </li>
                        <li>
                            <div className="row">
                                <div className="col">
                                    Calidad
                                </div> 

                                <div className="col">
                                    <ProgressBar now={valoraciones.valCalidad} max="5"/>
                                </div>

                                <div className="col">
                                    {valoraciones.valCalidad}
                                </div> 
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <hr/>

            <div className="row">
                <div className="col">
                    <h3>
                        Reserva ahora
                    </h3>
                </div>
            </div>
        </div>
    );
}

export default VerAlojamiento;