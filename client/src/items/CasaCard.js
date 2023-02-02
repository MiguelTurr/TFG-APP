import React from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faLocationDot, faHeart } from '@fortawesome/free-solid-svg-icons';

import Card from 'react-bootstrap/Card';

const diaEnSegundos = 1000 * 60 * 60 * 24;

function CasaCard({ alojamientos, alojamientosImg }) {

    if(alojamientos.length === 0) {
        return <h4> No se puede mostrar ningún alojamiento. </h4>;
    }

    const verValoracion = (val) => {
        const valoracion = parseFloat(val).toFixed(2);
        if(valoracion === '0.00') return ''; 
        return <><FontAwesomeIcon icon={faStar} />&nbsp;{valoracion}<br/></>
    };
    
    const esCasaNueva = (fecha) => {
        if((new Date().getTime() - new Date(fecha).getTime()) / diaEnSegundos < 3) {
            return <span className="tag-imagen">novedad</span>
        }
        return '';
    };
    
    const casaVista = (visto) => {
        if(visto === null || visto === undefined) return '';
        return <span className="tag-imagen">visto</span>
    };

    //

    return (<>
        {
            alojamientos.map((x, index) => (

                <div className="col-sm-3 mb-3" key={index}>

                    <Card className="container-casa h-100">

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
                                    {verValoracion(x.valoracionMedia)}
                                    <FontAwesomeIcon icon={faHeart} style={x.favorito === null || x.favorito === undefined ? { display: 'none' } : { color: '#c80000' } } />
                                </div>
                            </div>

                            <a href={ '/alojamiento/ver?casa=' +x.ID} class="stretched-link"></a>
                        </Card.Body>
                    </Card>
                </div>

            ))
        }
    </>);
}

export default CasaCard;