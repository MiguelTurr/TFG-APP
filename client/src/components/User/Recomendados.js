import React from 'react';

import { useEffect, useState } from 'react';

import ToolTipRec from './ToolTipRec';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faLocationDot, faHandSparkles } from '@fortawesome/free-solid-svg-icons';

import Card from 'react-bootstrap/Card';

function Recomendaciones() {

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

        } else if(items.respuesta === 'err_db') {

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

            for(var i = 0; i < exp; i++) {
                expImg.push(await cargarImagen(items.experiencias[i].ID));
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

    const verAlojamiento = (index) => {
        window.location.href = '/alojamiento/ver?casa=' +alojamientos[index].ID;
    };

    return (
        <div className="container-fluid mb-5">

            <div className="row">

                <h4 style={{ fontWeight: 'bold' }}>

                    <ToolTipRec> </ToolTipRec>

                    &nbsp;
                    RECOMENDADOS
                </h4>

                <hr />

                {
                    alojamientos.map((x, index) => (

                        <div className="col-sm-3 mb-3" key={index}>

                            <Card className="container-casa h-100" onClick={() => { verAlojamiento(index) }}>

                                 <img
                                    className="card-img-top"
                                    height="250px"
                                    src={imgAlojamientos[index]}
                                    alt="Imagen del alojamiento"/>

                                <Card.Body className="card-body info-casa">

                                    <div className="row">

                                        <div className="col">

                                            <p>
                                                <FontAwesomeIcon icon={faLocationDot} style={{ color: 'green'}} />&nbsp;<strong>{x.ubicacion}</strong>
                                                <br/>
                                                <strong>{x.precio}€</strong> por noche
                                            </p>
                                        </div>

                                        <div className="col derecha-casa">
                                            <FontAwesomeIcon icon={faStar} />&nbsp;{parseFloat(x.valoracionMedia).toFixed(2)}
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>

                    ))
                }

                <hr />

                <h4 style={{ fontWeight: 'bold' }}>
                    <FontAwesomeIcon icon={faHandSparkles}/> NUEVAS EXPERIENCIAS
                </h4>

                <hr />

                {
                    nuevasExperiencias.map((x, index) => (

                        <div className="col-sm-3 mb-3" key={index}>

                            <Card className="container-casa h-100" onClick={() => { verAlojamiento(index) }}>

                                 <img
                                    className="card-img-top"
                                    height="250px"
                                    src={imgNuevas[index]}
                                    alt="Imagen del alojamiento"/>

                                <Card.Body className="card-body info-casa">

                                    <div className="row">

                                        <div className="col">

                                            <p>
                                                <FontAwesomeIcon icon={faLocationDot} style={{ color: 'green'}} />&nbsp;<strong>{x.ubicacion}</strong>
                                                <br/>
                                                <strong>{x.precio}€</strong> por noche
                                            </p>
                                        </div>

                                        <div className="col derecha-casa">
                                            <FontAwesomeIcon icon={faStar} />&nbsp;{parseFloat(x.valoracionMedia).toFixed(2)}
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>

                    ))
                }

            </div>
        </div>
    )
}

export default Recomendaciones;