import React, { useEffect, useState } from 'react';

import '../../css/UserAlojamientos.css';

import CrearAlojamiento from './CrearAlojamiento.js';
import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusSquare, faArrowRight, faLocationDot, faStar } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";

function UserAlojamientos() {

    var crearOptions = { year: 'numeric', month: 'long', day: 'numeric' };

    //

    const [userAlojamientos, setUserAlojamientos] = useState([]);
    const [vistaCrear, setVistaCrear] = useState(false);

    const obtenerAlojamientos = async () => {
        const data = await fetch('/perfil/misalojamientos', {
            method: 'GET',
            
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();

        if(items.respuesta === 'err_user') {
            crearAlerta('error', '¡Ha ocurrido un error con el usuario!');

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {
            setUserAlojamientos(items.alojamientos);
        }
    };

    useEffect(() => {
        obtenerAlojamientos();
    }, []);

    const verAlojamiento = (e, key) => {
        console.log(key);
    };

    const crearAlojamiento = () => {
        setVistaCrear(true);
    };

    return(
        <div className="container-fluid">

            {vistaCrear === false && <>
                <div className="row">

                    <div className="col">

                        <Button className="crear-botones" size="sm" onClick={crearAlojamiento}>
                            <FontAwesomeIcon icon={faPlusSquare} /> Crear nuevo
                        </Button>
                    </div>

                </div>

                <hr/>

                <table className="table">

                    <tbody>

                        {
                            userAlojamientos.map((x, index) => (
                                <tr className="tabla-seleccion" onClick={e => { verAlojamiento(e, index) }} key={index}>
                                    <td>
                                        <p>
                                            <FontAwesomeIcon icon={faLocationDot} /> {x.lugar}
                                            <br/>
                                            {x.precio}€ por noche
                                        </p>
                                    </td>

                                    <td style={{ verticalAlign:'middle'}}>
                                        { new Date(x.creadoEn).toLocaleDateString('es-ES', crearOptions) }
                                    </td>

                                    <td style={{ verticalAlign:'middle'}}>
                                        <FontAwesomeIcon icon={faStar} /> {x.valoraciones}
                                    </td>

                                    <td className="arrow-style">
                                        <FontAwesomeIcon icon={faArrowRight} />
                                    </td>
                                </tr>
                            ))
                        }

                    </tbody>
                </table>
            </>}
            <CrearAlojamiento show={vistaCrear} vistaAlojamientos={setVistaCrear}/>
        </div>
    )
}

export default UserAlojamientos;