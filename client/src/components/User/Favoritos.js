import React, { useEffect, useState }  from 'react';

import { crearAlerta } from '../Toast/Toast.js';
import CasaCard from '../../items/CasaCard';
import ToolTipFav from './ToolTipFav.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComputer, faBan } from '@fortawesome/free-solid-svg-icons';

import Button from 'react-bootstrap/Button';

function Favoritos({ changeLogged }) {

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

        } else if(items.respuesta === 'err_user') {
            changeLogged(false);

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

    //

    const eliminarTodos = async () => {

        if(window.confirm('¿Estás seguro?') === false) {
            return;
        }

        const data = await fetch('/perfil/favoritos/borrar-todos', { method: 'GET' });
        const items = await data.json();

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'err_user') {
            changeLogged(false);

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
                <CasaCard alojamientos={alojamientos} alojamientosImg={imgAlojamientos} />
            </div>
        </div>
    )
}

export default Favoritos;