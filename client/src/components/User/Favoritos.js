import React from 'react';

import { useEffect, useState } from 'react';

import ToolTipFav from './ToolTipFav.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faLocationDot, faHeart } from '@fortawesome/free-solid-svg-icons';

import Card from 'react-bootstrap/Card';

function Favoritos() {

    const [alojamientos, setAlojamientos] = useState([]);
    const [imgAlojamientos, setImgAlojamientos] = useState([]);

    useEffect(() => {
        obtenerFavoritos();
    }, []);
    
    const obtenerFavoritos = async () => {

        const data = await fetch('/perfil/favoritos', { method: 'GET' });
        const items = await data.json();

        if(items.respuesta === 'err_db') {

        } else if(items.respuesta === 'correcto') {
            setAlojamientos(items.alojamientos);

            var len = items.alojamientos.length;
            var arrayImg = [];

            for(var i = 0; i < len; i++) {

                const imagen = await fetch('/alojamiento/imagen/' +items.alojamientos[i].ID+ '-0', { 
                    method: 'GET',
            
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                if(imagen.status === 200) {
                    arrayImg.push(imagen.url);
                }
            }
            setImgAlojamientos(arrayImg);
        }
    };

    const verAlojamiento = (e, index) => {
        window.location.href = '/alojamiento/ver?casa=' +alojamientos[index].ID;
    };

    //

    return ( 
        <div className="container-fluid mb-5">

            <div className="row">

                <h4 style={{ fontWeight: 'bold' }}>

                    <ToolTipFav> </ToolTipFav>

                    &nbsp;
                    TUS FAVORITOS
                </h4>

                <hr/>

                {
                    alojamientos.map((x, index) => (

                        <div className="col-sm-3 mb-3" key={index}>

                            <Card className="container-casa h-100" onClick={e => { verAlojamiento(e, index) }}>

                                 <img
                                    className="card-img-top"
                                    height="250px"
                                    src={imgAlojamientos[index]}/>

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
                                            <br/>
                                            <FontAwesomeIcon icon={faHeart} style={{ color: 'red' }} />
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

export default Favoritos;