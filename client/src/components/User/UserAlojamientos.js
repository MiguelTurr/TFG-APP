import React, { useEffect, useState } from 'react';

import '../../css/UserAlojamientos.css';
import userLogin from '../../js/autorizado.js';

import CrearAlojamiento from './CrearAlojamiento.js';
import EditarAlojamiento from './EditarAlojamiento.js';
import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusSquare, faArrowRight, faLocationDot, faStar } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";

function UserAlojamientos() {

    const { setAutorizado } = userLogin();

    var crearOptions = { year: 'numeric', month: 'short', day: 'numeric' };

    //

    const [userAlojamientos, setUserAlojamientos] = useState([]);
    const [vista, setVista] = useState('principal');

    const obtenerAlojamientos = async () => {
        const data = await fetch('/perfil/mis-alojamientos', {
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

    //

    const [editAlojamiento, setEditalojamiento] = useState(null);

    const editarAlojamiento = (e, key) => {
        setVista('editar');
        setEditalojamiento(userAlojamientos[key].ID)
    };

    //

    const crearAlojamiento = () => {
        setVista('crear');
    };

    const addNuevoAlojamiento = (info) => {
        setUserAlojamientos([info, ...userAlojamientos]);
    };

    return(
        <div className="container-fluid">

            <div style={ vista === 'principal' ? {} : {display: 'none'}}>

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
                                <tr className="tabla-seleccion" onClick={e => { editarAlojamiento(e, index) }} key={index} style={{ verticalAlign:'middle'}}>
                                    <td>
                                        <p>
                                            <FontAwesomeIcon icon={faLocationDot} style={{ color: 'green' }} /> {x.ubicacion}
                                            <br/>
                                            
                                            <span style={x.precioAnterior !== null ? {} : { display: 'none' }}>
                                                <del className="text-muted">{x.precioAnterior}€</del>&nbsp;
                                            </span>
                                            <small>{x.precio}€ por noche</small>
                                        </p>
                                    </td>

                                    <td>
                                        { new Date(x.creadoEn).toLocaleDateString('es-ES', crearOptions) }
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

            <CrearAlojamiento show={vista} vistaAlojamientos={setVista} nuevoAlojamiento={addNuevoAlojamiento}/>
            <EditarAlojamiento show={vista} vistaAlojamientos={setVista} alojamientoId={editAlojamiento} />
        </div>
    )
}

export default UserAlojamientos;