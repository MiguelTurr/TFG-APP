import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusSquare, faArrowRight, faLocationDot, faStar } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";

const crearOptions = { year: 'numeric', month: 'short', day: 'numeric' };

function UserAlojamientos({ changeLogged }) {

    const navigate = useNavigate();

    //

    const [userAlojamientos, setUserAlojamientos] = useState([]);

    const obtenerAlojamientos = async () => {
        const data = await fetch('/perfil/mis-alojamientos', {
            method: 'GET',
            
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();

        if(items.respuesta === 'err_user') {
            changeLogged(false);

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');


        } else if(items.respuesta === 'correcto') {
            setUserAlojamientos(items.alojamientos);
        }
    };

    useEffect(() => {
        obtenerAlojamientos();
    }, []);

    //

    const editarAlojamiento = (Id) => {
        navigate("/perfil/mis-alojamientos/editar/" +Id);
    };

    //

    const crearAlojamiento = () => {
        navigate("/perfil/mis-alojamientos/crear");
    };

    return(
        <div className="container-fluid">
            <div className="row">

                <div className="col">

                    <Button className="crear-botones" size="sm" onClick={crearAlojamiento}>
                        <FontAwesomeIcon icon={faPlusSquare} /> Crear nuevo
                    </Button>
                </div>

            </div>

            <hr />

            {userAlojamientos.length === 0 && <h5>
                No tienes ningún alojamiento creado.
            </h5>}

            <table className="table">

                <tbody>

                    {
                        userAlojamientos.map((x, index) => (
                            <tr className="tabla-seleccion" onClick={() => editarAlojamiento(x.ID)} key={index} style={{ verticalAlign: 'middle' }}>
                                <td>
                                    <p>
                                        <FontAwesomeIcon icon={faLocationDot} style={{ color: 'green' }} /> {x.ubicacion}
                                        <br />

                                        <span style={x.precioAnterior !== null ? {} : { display: 'none' }}>
                                            <del className="text-muted">{x.precioAnterior}€</del>&nbsp;
                                        </span>
                                        <small>{x.precio}€ por noche</small>
                                    </p>
                                </td>

                                <td>
                                    {new Date(x.creadoEn).toLocaleDateString('es-ES', crearOptions)}
                                </td>

                                <td>
                                    {x.visitas} visitas
                                </td>

                                <td>
                                    <FontAwesomeIcon icon={faStar} /> {parseFloat(x.valoracionMedia).toFixed(2)} <span className="text-muted">({x.vecesValorado})</span>
                                </td>

                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>
                        ))
                    }

                </tbody>
            </table>
        </div>
    )
}

export default UserAlojamientos;