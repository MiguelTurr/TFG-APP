import React, { useEffect, useState } from 'react';

import '../../css/UserAlojamientos.css';
import userLogin from '../../js/autorizado.js';

import CrearAlojamiento from './CrearAlojamiento.js';
import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusSquare, faArrowRight, faLocationDot, faStar } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";

function UserAlojamientos() {

    const { setAutorizado } = userLogin();

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
            setAutorizado(false);

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {
            setUserAlojamientos(items.alojamientos);
        }
    };

    useEffect(() => {
        obtenerAlojamientos();
    }, []);

    const editarAlojamiento = (e, key) => {
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

                {userAlojamientos.length === 0 && <h5>
                    No tienes ningún alojamiento creado.
                </h5>}

                <table className="table">

                    <tbody>

                        {
                            userAlojamientos.map((x, index) => (
                                <tr className="tabla-seleccion" onClick={e => { editarAlojamiento(e, index) }} key={index}>
                                    <td>
                                        <p>
                                            <FontAwesomeIcon icon={faLocationDot} /> {x.ubicacion}
                                            <br/>
                                            <small>{x.precio}€ por noche</small>
                                        </p>
                                    </td>

                                    <td style={{ verticalAlign:'middle'}}>
                                        { new Date(x.creadoEn).toLocaleDateString('es-ES', crearOptions) }
                                    </td>

                                    <td>
                                        {x.visitas} visitas
                                        <br/>
                                        {x.vecesValorado} valoraciones
                                    </td>

                                    <td style={{ verticalAlign:'middle'}}>
                                        <FontAwesomeIcon icon={faStar} /> {parseFloat(x.valoracionMedia).toFixed(2)}
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