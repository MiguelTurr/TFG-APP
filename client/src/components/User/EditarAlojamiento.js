import React, { useState, useEffect } from "react";

import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrashCan, faHouse, faLocationDot } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";

function EditarAlojamiento({ show, vistaAlojamientos, alojamientoId }) {

    var crearOptions = { year: 'numeric', month: 'long', day: 'numeric' };

    //

    const [alojamientoImg, setAlojamientoImg] = useState([]);
    const [alojamiento, setAlojamiento] = useState({});

    useEffect(() => {
        obtenerInfoAlojamiento();
    }, [alojamientoId]);

    const obtenerInfoAlojamiento = async () => {
        if (alojamientoId === null) {
            return;
        }

        const data = await fetch('/perfil/mis-alojamientos/' +alojamientoId, { method: 'GET' });
        const items = await data.json();

        if(items.respuesta === 'err_user') {
            crearAlerta('error', '¡Ha ocurrido un error con el usuario!');

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {
            setAlojamiento(items.alojamiento);
        }
    };

    if (alojamientoId === null) {
        return <></>;
    }

    const eliminarAlojamiento = () => {

        if(window.confirm('¿Estás seguro?') === false) {
            return;
        }

        console.log('Eliminar');
    };

    //

    const verAlojamiento = () => {
        window.open('/alojamiento/ver?casa=' + alojamientoId, '_blank');
    };

    return (

        <div className="container-fluid mb-5" style={show === 'editar' ? {} : { display: 'none' }}>

            <Button className="filtros-botones" size="sm" onClick={() => { vistaAlojamientos('principal') }}>
                <FontAwesomeIcon icon={faArrowLeft} /> Volver
            </Button>
            &nbsp;&nbsp;

            <Button className="borrar-botones" size="sm" onClick={() => { eliminarAlojamiento() }}>
                <FontAwesomeIcon icon={faTrashCan} /> Eliminar
            </Button>

            <Button className="filtros-botones" size="sm" style={{ float: 'right' }} onClick={verAlojamiento}>
                <FontAwesomeIcon icon={faHouse} /> Ir al alojamiento
            </Button>

            <hr />

            <div className="row">

                <div className="col">
                    <table className="table">
                        <tbody>
                            <tr>
                                <td>
                                    Ubicación:
                                    <br/>
                                    <FontAwesomeIcon icon={faLocationDot} style={{ color: 'green' }} /> {alojamiento?.ubicacion}
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    Fecha creación:
                                    <br/>
                                    { new Date(alojamiento.creadoEn).toLocaleDateString('es-ES', crearOptions) }
                                </td>
                            </tr>

                            <tr>

                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}

export default EditarAlojamiento;