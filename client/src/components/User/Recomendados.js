import React from 'react';

import { useEffect, useState } from 'react';

import ToolTipRec from './ToolTipRec';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faLocationDot, faHeart, faHandSparkles } from '@fortawesome/free-solid-svg-icons';

import Card from 'react-bootstrap/Card';

function Recomendaciones() {

    const [alojamientos, setAlojamientos] = useState([]);
    const [imgAlojamientos, setImgAlojamientos] = useState([]);

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
        }
    };

    //

    const verAlojamiento = (index) => {
        window.location.href = '/alojamiento/ver?casa=' +alojamientos[index].ID;
    };

    return (
        <div className="container-fluid">

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
                                            <FontAwesomeIcon icon={faHeart} />
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

            </div>
        </div>
    )
}

export default Recomendaciones;