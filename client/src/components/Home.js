import React from 'react';
import '../css/Home.css';

import { useLocation } from "react-router-dom";
import { useEffect, useState } from 'react';

import { crearAlerta } from './Toast/Toast.js';
import BotonTop from './Navegacion/BotonTop';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faLocationDot, faHeart, faArrowDown } from '@fortawesome/free-solid-svg-icons';

import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

var contadorEstado = 0;

function Home() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);

    useEffect(() => {
        fetchItems(params.get("ordenar"), 0);
    }, [location.search]);

    const [alojamientos, setAlojamientos] = useState([]);
    const [imgAlojamientos, setImgAlojamientos] = useState([]);

    const fetchItems = async (orden, contador) => {

        const disableBtn = document.getElementById('mostrar-mas');
        disableBtn.disabled = true;

        const data = await fetch('/home', { 
            method: 'POST',

            body: JSON.stringify({
                ordenar: orden,
                contador: contador,

                filtros: {
                    precio_min: params.get('precio_min'),
                    precio_max: params.get('precio_max'),

                    viajeros: params.get('viajeros'),
                    habitaciones: params.get('habitaciones'),
                    camas: params.get('camas'),
                    aseos: params.get('aseos'),

                    valoracion: params.get('valoracion'),
                }
            }),
            
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();
        disableBtn.disabled = false;

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {

            var len = items.alojamientos.length;

            if(len > 0) {
                
                if(contador === 0) {
                    setAlojamientos(items.alojamientos);

                } else {
                    setAlojamientos([...alojamientos, ...items.alojamientos]);
                }

                contadorEstado = contador;
                
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
                if(contador === 0) {
                    setImgAlojamientos(arrayImg);

                } else {
                    setImgAlojamientos([...imgAlojamientos, ...arrayImg]);
                }

            } else {
                if(contador === 0) {
                    setAlojamientos([]);
                } 
                disableBtn.disabled = true;
            }
        }
    }

    const verAlojamiento = (e, index) => {
        window.location.href = '/alojamiento/ver?casa=' +alojamientos[index].ID;
    };

    //

    const mostrarMas = () => {
        fetchItems(params.get("ordenar"), contadorEstado + 1);
    };

    return(
        <div className="container-fluid">

            <div className="row">

                <h4 style={ alojamientos.length === 0 ? {} : { display: 'none' }}>
                    No se puede mostrar ningún alojamiento.
                </h4>

                {
                    alojamientos.map((x, index) => (

                        <div className="col-sm-3 mb-3" key={index}>

                            <Card className="container-casa h-100" onClick={e => { verAlojamiento(e, index) }}>

                                <div>
                                    <img
                                    className="card-img-top"
                                    height="250px"
                                    src={imgAlojamientos[index]}/>

                                    <div className="nueva-casa" style={ (new Date().getTime() - new Date(x.creadoEn).getTime()) / (1000 * 60 * 60 * 24) < 3 ? { } : { display: 'none' } }>
                                        NUEVA
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

                                        <div className={window.innerWidth < 600 ? "col derecha-casa" : "col-sm-4 derecha-casa"}>
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

                <hr/>

                <div className="text-center">
                    <Button className="filtros-botones" id="mostrar-mas" onClick={mostrarMas}>
                        <FontAwesomeIcon icon={faArrowDown} /> Mostrar más
                    </Button>
                </div>
            </div>
            <BotonTop />
        </div>
    );
}

export default Home;