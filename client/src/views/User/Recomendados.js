import React from 'react';

import { useEffect, useState } from 'react';

import { crearAlerta } from '../Toast/Toast.js';
import CasaCard from '../../components/CasaCard';
import ToolTipRec from './ToolTipRec';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandSparkles, faHeart } from '@fortawesome/free-solid-svg-icons';

import Button from 'react-bootstrap/Button';

function Recomendaciones({ changeLogged }) {

    const [alojamientos, setAlojamientos] = useState([]);
    const [imgAlojamientos, setImgAlojamientos] = useState([]);

    const [nuevasExperiencias, setNuevasExperiencias] = useState([]);
    const [imgNuevas, setImgNuevas] = useState([]);

    useEffect(() => {
        obtenerRecomendados();
    }, []);

    const obtenerRecomendados = async () => {
        const data = await fetch('/perfil/recomendados', { method: 'GET' });
        const items = await data.json();

        if(items.respuesta === 'err_user') {
            changeLogged(false);

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {


            setAlojamientos(items.recomendados);
            setNuevasExperiencias(items.experiencias);

            const len = items.recomendados.length;
            var arrayImg = [];

            for(var i = 0; i < len; i++) {
                arrayImg.push(await cargarImagen(items.recomendados[i].ID));
            }
            setImgAlojamientos(arrayImg);

            //

            const exp = items.experiencias.length;
            var expImg = [];

            for(var w = 0; w < exp; w++) {
                expImg.push(await cargarImagen(items.experiencias[w].ID));
            }
            setImgNuevas(expImg);
        }
    };

    const cargarImagen = async (id) => {
        
        const imagen = await fetch('/alojamiento/imagen/' +id+ '-0', { 
            method: 'GET',
    
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if(imagen.status === 200) {
            return imagen.url;
        }
    };

    //

    return (
        <div className="container-fluid mb-5">

            <h4 style={{ fontWeight: 'bold' }}>

                <ToolTipRec> </ToolTipRec>

                &nbsp;
                RECOMENDADOS

                <Button className="filtros-botones" size="sm" href='/perfil/favoritos' style={{ float: 'right' }}>
                    <FontAwesomeIcon icon={faHeart} /> Favoritos
                </Button>
            </h4>

            <hr />

            <div className="row">
                <CasaCard alojamientos={alojamientos} alojamientosImg={imgAlojamientos} />
            </div>

            <hr />

            <h4 style={{ fontWeight: 'bold' }}>
                <FontAwesomeIcon icon={faHandSparkles}/> NUEVAS EXPERIENCIAS
            </h4>

            <hr />
            
            <div className="row">
                <CasaCard alojamientos={nuevasExperiencias} alojamientosImg={imgNuevas} />
            </div>
        </div>
    )
}

export default Recomendaciones;