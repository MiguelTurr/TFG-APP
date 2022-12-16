import React, { useState, useEffect } from "react";

import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrashCan, faHouse, faLocationDot, faArrowRight, faXmark, faPenToSquare } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/esm/Form";

const tituloCaracteres = 70;
const descripcionCaracteres = 2500;

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
    };

    if (alojamientoId === null) {
        return <></>;
    }

    const eliminarAlojamiento = async () => {

        if(cambiarDatos.eliminar === '') {
            return crearAlerta('error', '¡Debes colocar tu contraseña');
        }

        if(window.confirm('¿Estás seguro?') === false) {
            return;
        }

        const data = await fetch('/perfil/mis-alojamientos/borrar', { 
            method: 'POST',

            body: JSON.stringify({
                password: cambiarDatos.eliminar,
                alojamientoID: alojamiento.ID,
                imgTotal: alojamiento.imgCantidad,
            }),

            headers: {
                'Content-Type': 'application/json'
            },
        });
        const items = await data.json();

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {
            crearAlerta('exito', '¡Alojamiento eliminado!');
            setTimeout(() => { console.log('Correcto'); }, 1000);
        }
    };

    const modificarDato = (tipoId) => {
        var objeto = {};

        objeto.dato = tipoId;
        objeto.modificado = false;

        if(tipoId === 'titulo') {
            objeto[tipoId] = alojamiento.titulo;

        } else if(tipoId === 'descripcion') {
            objeto[tipoId] = alojamiento.descripcion;

        } else if(tipoId === 'coste') {

        } else if(tipoId === 'servicios') {

        } else if(tipoId === 'eliminar') {
            objeto[tipoId] = '';
        }

        setCambiarDatos(objeto);
    };

    const controlDato = (e, tipo) => {

        const elementId = e.target.id.split('-')[1];
        const elementValue = (tipo === undefined) ? e.target.value : e.target.checked;

        setCambiarDatos({ ...cambiarDatos, [elementId]: elementValue, modificado: true });
    };

    //
    
    const cancelarEditar = () => {
        setCambiarDatos(null);
    };

    const enviarDatoModificado = (e) => {
        e.preventDefault();

        //

        if(cambiarDatos.dato === 'eliminar') {
            return eliminarAlojamiento();
        }

    };

    const eliminarFoto = () => {

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

            <Button className="borrar-botones" size="sm" onClick={() => { modificarDato('eliminar'); }}>
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

                            <tr className={cambiarDatos?.dato === 'titulo' ? 'tabla-activa' : "tabla-seleccion"} onClick={() => { modificarDato('titulo'); }}>
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

                            <tr className={cambiarDatos?.dato === 'descripcion' ? 'tabla-activa' : "tabla-seleccion"} onClick={() => { modificarDato('descripcion'); }}>
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

                            <tr className={cambiarDatos?.dato === 'coste' ? 'tabla-activa' : "tabla-seleccion"} onClick={() => { modificarDato('coste'); }}>
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

                            <tr className={cambiarDatos?.dato === 'servicios' ? 'tabla-activa' : "tabla-seleccion"} onClick={() => { modificarDato('servicios'); }}>
                                <td>
                                    Servicios:
                                    <br/>
                                    <small>{alojamiento.servicios}</small>
                                </td>
                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>

                            <tr className={cambiarDatos?.dato === 'imagenes' ? 'tabla-activa' : "tabla-seleccion"} onClick={() => { modificarDato('imagenes'); }}>
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

                    <div style={cambiarDatos !== null ? {} : { display: 'none' }}>

                        <h4 className="text-center" style={{ fontWeight: 'bold' }}>
                            <FontAwesomeIcon icon={faXmark} style={{ float: 'left', marginTop: '5px', cursor: 'pointer' }} onClick={cancelarEditar}/> 
                            
                            MODIFICAR: {cambiarDatos?.dato?.toUpperCase()}
                        </h4>

                        <hr />

                        <Form onSubmit={enviarDatoModificado}>

                            <Form.Group className="mb-3" style={cambiarDatos?.dato === 'titulo' ? {} : { display: 'none' }} >
                                <Form.Label>
                                    <small className="text-muted">Quedan {tituloCaracteres - cambiarDatos?.titulo?.length} caracteres</small>
                                </Form.Label>
                                <Form.Control type="text" placeholder="Nuevo título" id="mod-titulo" value={cambiarDatos?.titulo} onChange={controlDato}/>
                            </Form.Group>

                            <Form.Group className="mb-3" style={cambiarDatos?.dato === 'descripcion' ? {} : { display: 'none' }} >
                                <Form.Label>
                                    <small className="text-muted">Quedan {descripcionCaracteres - cambiarDatos?.descripcion?.length} caracteres</small>
                                </Form.Label>
                                <Form.Control as="textarea" rows="8" placeholder="Nueva descripción" id="mod-descripcion" value={cambiarDatos?.descripcion} onChange={controlDato} />
                            </Form.Group>

                            <Form.Group className="mb-3" style={cambiarDatos?.dato === 'eliminar' ? {} : { display: 'none' }} >
                                <Form.Control type="password" placeholder="Contraseña" id="mod-eliminar" value={cambiarDatos?.eliminar} onChange={controlDato}/>
                            </Form.Group>

                            <Form.Group className="mb-3" style={ cambiarDatos?.modificado === true ? {} : { display: 'none' }}>
                                <Button type="submit" className="filtros-botones" size="sm" id="mod-btn">
                                    &nbsp;&nbsp;&nbsp;<FontAwesomeIcon icon={faPenToSquare} /> Modificar&nbsp;&nbsp;&nbsp;
                                </Button>
                            </Form.Group>
                        </Form>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default EditarAlojamiento;