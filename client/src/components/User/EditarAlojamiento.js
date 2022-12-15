import React, { useState, useEffect } from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrashCan, faHouse } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";

function EditarAlojamiento({ show, vistaAlojamientos, alojamientoId }) {

    const [alojamientoImg, setAlojamientoImg] = useState([]);
    const [alojamientoInfo, setAlojamientoInfo] = useState();

    useEffect(() => {
        obtenerInfoAlojamiento();
    }, [alojamientoId]);

    const obtenerInfoAlojamiento = async () => {
        if (alojamientoId === null) {
            return;
        }

        /*const data = await fetch();
        const items = await data.json();

        if(items.respuesta === 'correcto') {

        }*/
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
                    Descuento
                </div>

            </div>
        </div>
    );
}

export default EditarAlojamiento;