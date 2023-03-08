import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { crearAlerta } from '../Toast/Toast.js';
import CasaCard from '../../components/CasaCard';

import { getGeocode, getLatLng } from 'use-places-autocomplete';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';

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

                <CasaCard alojamientos={alojamientos} alojamientosImg={alojamientosImg} />

            </div>
        </div>
    );
}

export default Buscar;