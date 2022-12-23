import React, { useEffect, useState }  from 'react';

import { crearAlerta } from '../Toast/Toast.js';
import ToolTipFav from './ToolTipFav.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faLocationDot, faHeart, faComputer, faBan } from '@fortawesome/free-solid-svg-icons';

import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

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
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

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

    const eliminarTodos = async () => {

        if(window.confirm('¿Estás seguro?') === false) {
            return;
        }

        const data = await fetch('/perfil/favoritos/borrar-todos', { method: 'GET' });
        const items = await data.json();

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {
            crearAlerta('error', '¡Eliminados todos!');

            setAlojamientos([]);
            setImgAlojamientos([]);
        }
    };

    //

    return ( 
        <div className="container-fluid mb-5">
            <h4 style={{ fontWeight: 'bold' }}>

                <ToolTipFav> </ToolTipFav>

                &nbsp;
                TUS FAVORITOS

                <span style={{ float: 'right' }}>

                <Button className="filtros-botones" size="sm" href="/perfil/recomendados">
                    <FontAwesomeIcon icon={faComputer} /> Recomendados
                </Button>

                &nbsp;

                <Button className="borrar-botones" size="sm" onClick={eliminarTodos} style={ alojamientos.length !== 0 ? {} : { display: 'none' } }>
                    <FontAwesomeIcon icon={faBan} /> Eliminar todos
                </Button>
                </span>
            </h4>

            <hr/>

            <div className="row">

                <h4 style={alojamientos.length === 0 ? {} : { display: 'none' } }>
                    No has añadido ningún alojamiento a favoritos.
                </h4>

                {
                    alojamientos.map((x, index) => (

                        <div className="col-sm-3 mb-3" key={index}>

                            <Card className="container-casa h-100" onClick={e => { verAlojamiento(e, index) }}>

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
                                            <br/>
                                            <FontAwesomeIcon icon={faHeart} style={{ color: '#c80000' }} />
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