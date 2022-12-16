import React, { useState, useEffect } from "react";

import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrashCan, faHouse, faLocationDot, faArrowRight } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";

function EditarAlojamiento({ show, vistaAlojamientos, alojamientoId }) {

    var crearOptions = { year: 'numeric', month: 'long', day: 'numeric' };

    //

    const [alojamientoImg, setAlojamientoImg] = useState([]);
    const [alojamiento, setAlojamiento] = useState({});

    const [cambiarDatos, setCambiarDatos] = useState(null);

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

        console.log(cambiarDatos === null);
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

    const modificarDato = (tipoId) => {
        var objeto = {};

        if(tipoId === 'titulo') {
            objeto.dato = 'título';

        } else if(tipoId === 'descripcion') {
            objeto.dato = 'descripción';

        } else if(tipoId === 'coste') {
            objeto.dato = 'coste';

        } else if(tipoId === 'servicios') {
            objeto.dato = 'servicios';

        } else if(tipoId === 'imagenes') {
            objeto.dato = 'imágenes';
        }

        setCambiarDatos(objeto);
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

            <Button className="borrar-botones" size="sm" onClick={eliminarAlojamiento}>
                <FontAwesomeIcon icon={faTrashCan} /> Eliminar
            </Button>

            <Button className="filtros-botones" size="sm" style={{ float: 'right' }} onClick={verAlojamiento}>
                <FontAwesomeIcon icon={faHouse} /> Ir al alojamiento
            </Button>

            <hr />

            <div className="row">

                <div className="col" style={window.innerWidth < 600 && cambiarDatos !== null ? { display: 'none' }  : {  } }>

                    <table className="table">
                        <tbody>
                            <tr>
                                <td>
                                    Ubicación:
                                    <br/>
                                    <small><FontAwesomeIcon icon={faLocationDot} style={{ color: 'green' }} /> {alojamiento?.ubicacion}</small>
                                </td>
                                <td> </td>
                            </tr>

                            <tr>
                                <td>
                                    Fecha creación:
                                    <br/>
                                    <small>{ new Date(alojamiento.creadoEn).toLocaleDateString('es-ES', crearOptions) }</small>
                                </td>
                                <td> </td>
                            </tr>

                            <tr className="tabla-seleccion" onClick={() => { modificarDato('titulo' ); }}>
                                <td>
                                    Título:
                                    <br/>
                                    <small>
                                        { alojamiento.titulo?.substring(0, 40) }<span style={ alojamiento.titulo?.length > 40 ? {} : { display: 'none' }}>...</span>
                                    </small>
                                </td>
                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>

                            <tr className="tabla-seleccion" onClick={() => { modificarDato('descripcion' ); }}>
                                <td>
                                    Descripción:
                                    <br/>
                                    <small>
                                        { alojamiento.descripcion?.substring(0, 40) }<span style={ alojamiento.descripcion?.length > 40 ? {} : { display: 'none' }}>...</span>
                                    </small>
                                </td>
                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>

                            <tr className="tabla-seleccion" onClick={() => { modificarDato('coste' ); }}>
                                <td>
                                    Coste:
                                    <br/>
                                    <small>
                                        { alojamiento.precio }€ por noche <span className="text-muted">(sin descuento)</span>
                                    </small>
                                </td>
                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>

                            <tr className="tabla-seleccion" onClick={() => { modificarDato('servicios' ); }}>
                                <td>
                                    Servicios:
                                    <br/>
                                    <small>{alojamiento.servicios}</small>
                                </td>
                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>

                            <tr className="tabla-seleccion" onClick={() => { modificarDato('imagenes' ); }}>
                                <td>
                                    Imágenes:
                                    <br/>
                                    <small>{alojamiento.imgCantidad}</small>
                                </td>
                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="col" style={window.innerWidth < 600 && cambiarDatos === null ? { display: 'none' }  :  {  } }>

                    <h4>
                        {cambiarDatos?.dato.toUpperCase()}
                    </h4>

                </div>

            </div>
        </div>
    );
}

export default EditarAlojamiento;