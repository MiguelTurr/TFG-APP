import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { crearAlerta } from '../Toast/Toast.js';

import { getGeocode, getLatLng } from 'use-places-autocomplete';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faLocationDot, faHeart } from '@fortawesome/free-solid-svg-icons';

import Card from 'react-bootstrap/Card';

const diaEnSegundos = 1000 * 60 * 60 * 24;

function Buscar() {

    const location = useLocation();
    const params = new URLSearchParams(location.search);

    const [alojamientos, setAlojamientos] = useState([]);
    const [encontrados, setEncontrados] = useState(0);
    const [alojamientosImg, setAlojamientosImg] = useState([]);

    useEffect(() => {
        obtenerAlojamientos();
    }, [location]);

    const obtenerAlojamientos = async () => {

        const direccion = params.get('place');
        if(direccion === null) {
            return crearAlerta('error', '¡Dirección incorrecta!');
        }

        const direccion_resultados = await getGeocode({ address: direccion });

        const { lat, lng } = getLatLng(direccion_resultados[0]);
        const lenAddress = direccion_resultados[0].address_components.length;
    
        var localidad = undefined, provincia = undefined, comunidad = undefined, pais = undefined;

        for(var i = 0; i < lenAddress; i++) {

            const tipo = direccion_resultados[0].address_components[i].types[0];

            if(tipo === 'country') {
                pais = direccion_resultados[0].address_components[i].long_name;

            } else if(tipo === 'administrative_area_level_1') {
                comunidad = direccion_resultados[0].address_components[i].long_name;

            } else if(tipo === 'administrative_area_level_2') {
                provincia = direccion_resultados[0].address_components[i].long_name;

            } else if(tipo === 'locality') {
                localidad = direccion_resultados[0].address_components[i].long_name;

            } else if(localidad === undefined && tipo === 'administrative_area_level_3') {
                localidad = direccion_resultados[0].address_components[i].long_name;
            }
        }

        //

        const data = await fetch('/buscar', {
            method: 'POST',

            body: JSON.stringify({
                ordenar: params.get('ordenar'),
                place: direccion,
                lat: lat,
                lng: lng,
                localidad: localidad,
                provincia: provincia,
                comunidad: comunidad,
                pais: pais,

                filtros: {
                    precio_min: params.get('precio_min'),
                    precio_max: params.get('precio_max'),

                    viajeros: params.get('viajeros'),
                    habitaciones: params.get('habitaciones'),
                    camas: params.get('camas'),
                    aseos: params.get('aseos'),

                    valoracion: params.get('valoracion'),
                    visto: params.get('visto'),
                }
            }),

            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {
            setAlojamientos(items.busqueda);

            var len = items.busqueda.length;
            var arrayImg = [];

            for(var i = 0; i < len; i++) {

                const imagen = await fetch('/alojamiento/imagen/' +items.busqueda[i].ID+ '-0', { 
                    method: 'GET',
            
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                if(imagen.status === 200) {
                    arrayImg.push(imagen.url);
                }
            }
            setEncontrados(len);
            setAlojamientosImg(arrayImg);
        }
    };

    //

    const verAlojamiento = (index) => {
        window.location.href = '/alojamiento/ver?casa=' +alojamientos[index].ID;
    };

    //

    const esCasaNueva = (fecha) => {
        if((new Date().getTime() - new Date(fecha).getTime()) / diaEnSegundos < 3) {
            return <span className="tag-imagen">novedad</span>
        }
        return '';
    };

    const casaVista = (visto) => {
        if(visto === null) return '';
        return <span className="tag-imagen">visto</span>
    };

    //

    return (
        <div className="container-fluid">
            <div className="row">

                <h4 style={{ fontWeight: 'bold' }}>
                   <FontAwesomeIcon icon={faLocationDot} style={{ color: 'green'}} /> {params.get('place')}
                </h4>

                <small style={{ fontWeight: 'bold' }} className="text-muted mb-2">
                    {encontrados} alojamientos encontrados.
                </small>

                <hr />

                {
                    alojamientos.map((x, index) => (

                        <div className="col-sm-3 mb-3" key={index}>

                            <Card className="container-casa h-100" onClick={() => { verAlojamiento(index) }}>

                                <div>

                                    <img
                                        className="card-img-top"
                                        height="250px"
                                        src={alojamientosImg[index]}/>

                                    <div className="nueva-casa">
                                        {esCasaNueva(x.creadoEn)}
                                        {casaVista(x.visto)}
                                    </div>  
                                </div>

                                <Card.Body className="card-body info-casa">

                                    <div className="row">

                                        <div className="col">

                                            <p style={{ fontSize: '14px'}}>
                                                <FontAwesomeIcon icon={faLocationDot} style={{ color: 'green'}} />&nbsp;<strong>{x.ubicacion}</strong>
                                                <br/>
                                                <strong>{x.precio}€</strong> <small>precio/noche</small>
                                            </p>
                                        </div>

                                        <div className="col derecha-casa">
                                            <FontAwesomeIcon icon={faStar} />&nbsp;{parseFloat(x.valoracionMedia).toFixed(2)}
                                            <br/>
                                            <FontAwesomeIcon icon={faHeart} style={x.favorito === null || x.favorito === undefined ? { display: 'none' } : { color: '#c80000' } } />
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>

                    ))
                }
            </div>
        </div>
    );
}

export default Buscar;