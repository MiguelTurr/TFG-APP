import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRepeat, faBan } from '@fortawesome/free-solid-svg-icons';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const defaultFiltros = {
    precio_min: 10,
    precio_max: 2000,

    viajeros: 0,
    habitaciones: 0,
    camas: 0,
    aseos: 0,
    valoracion: 0,

    visto: false,
}

const FiltrosModal = ({ mostrar, funcionCerrar }) => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);

    const history = useNavigate();

    //

    const [nuevosFiltros, setNuevosFiltros] = useState({
        precio_min: params.get('precio_min') === null ? defaultFiltros.precio_min : params.get('precio_min'),
        precio_max: params.get('precio_max') === null ? defaultFiltros.precio_max : params.get('precio_max'),
    
        viajeros: params.get('viajeros') === null ? defaultFiltros.viajeros : parseInt(params.get('viajeros')),
        habitaciones: params.get('habitaciones') === null ? defaultFiltros.habitaciones : parseInt(params.get('habitaciones')),
        camas: params.get('camas') === null ? defaultFiltros.camas : parseInt(params.get('camas')),
        aseos: params.get('aseos') === null ? defaultFiltros.aseos : parseInt(params.get('aseos')),

        valoracion: params.get('valoracion') === null ? defaultFiltros.valoracion : parseInt(params.get('valoracion')),

        visto: params.get('visto') === null ? defaultFiltros.visto : parseInt(params.get('visto')),
    });

    useEffect(() => {
        alojamientosAprox();
    }, [nuevosFiltros])

    //

    const [alojamientos, setAlojamientos] = useState(0);

    //

    const controlCambios = (e) => {

        const element = e.target.id;
        const elementValue = e.target.value;

        if (element === 'precio_min') {
            if (elementValue < 0 || parseInt(elementValue) + 20 > nuevosFiltros.precio_max) {
                return;
            }
        }

        setNuevosFiltros({ ...nuevosFiltros, [element]: elementValue, });
    };

    const controlAlojamiento = (e) => {
        const element = e.target.id;
        const [ boton, index ] = element.split('-');

        setNuevosFiltros({ ...nuevosFiltros, [boton]: parseInt(index), });
    };

    const controlCheck = (e) => {
        const element = e.target.id;

        setNuevosFiltros({ ...nuevosFiltros, [element]: e.target.checked, });
    };

    //

    const cambiarFiltros = () => {

        var urlFinal = '';

        if (location.pathname === '/') {
            urlFinal = '/home?ordenar=fecha-desc';

        } else if (location.pathname === '/home') {
            urlFinal = '/home?ordenar=' + params.get('ordenar');

        } else {
            urlFinal = '/alojamiento/buscar';
            urlFinal += '?place=' + params.get('place');
            urlFinal += '&ordenar=' + params.get('ordenar');
        }

        //

        urlFinal += '&precio_min=' + nuevosFiltros.precio_min;
        urlFinal += '&precio_max=' + nuevosFiltros.precio_max;

        if(nuevosFiltros.viajeros > 0) {
            urlFinal += '&viajeros=' + nuevosFiltros.viajeros;
        }

        if(nuevosFiltros.habitaciones > 0) {
            urlFinal += '&habitaciones=' + nuevosFiltros.habitaciones;
        }

        if(nuevosFiltros.camas > 0) {
            urlFinal += '&camas=' + nuevosFiltros.camas;
        }

        if(nuevosFiltros.aseos > 0) {
            urlFinal += '&aseos=' + nuevosFiltros.aseos;
        }

        if(nuevosFiltros.valoracion > 0) {
            urlFinal += '&valoracion=' + nuevosFiltros.valoracion;
        }

        if(nuevosFiltros.visto !== false) {
            urlFinal += '&visto=' + nuevosFiltros.visto;
        }

        //

        history(urlFinal);
        funcionCerrar();
    };

    const borrarFiltros = () => {
        const url = window.location.href;

        history(url.substring('http://localhost:3000/'.length, url.search('&precio_min')));
        funcionCerrar();

        setNuevosFiltros(defaultFiltros);
    };

    //

    const alojamientosAprox = async () => {
        const data = await fetch('/filtrar/resultado', {
            method: 'POST',

            body: JSON.stringify({

                filtros: {
                    precio_min: nuevosFiltros.precio_min,
                    precio_max: nuevosFiltros.precio_max,

                    viajeros: nuevosFiltros.viajeros,
                    habitaciones: nuevosFiltros.habitaciones,
                    camas: nuevosFiltros.camas,
                    aseos: nuevosFiltros.aseos,

                    valoracion: nuevosFiltros.valoracion,
                }
            }),

            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();

        if (items.respuesta === 'correcto') {
            setAlojamientos(items.cantidad);
        }
    };

    //

    return (
        <Modal fullscreen={true} show={mostrar} onHide={funcionCerrar}>

            <Modal.Header closeButton>
                <Modal.Title>Filtros avanzados</Modal.Title>
            </Modal.Header>

            <Modal.Body>

                <Form>
                    <div className="container-fluid" style={{ overflowX: 'auto' }}>
                        <div className="row">

                            <h4 style={{ fontWeight: 'bold' }}>
                                Rango de precios
                            </h4>

                            <div className="col">

                                <Form.Group className="mb-3">

                                    <Form.Label htmlFor="titulo">
                                        <small>
                                            Precio mínimo
                                        </small>
                                    </Form.Label>

                                    <table className="table">
                                        <tbody>
                                            <tr style={{ verticalAlign: 'middle', borderBottom: 'transparent' }}>

                                                <td style={{ width: '50%' }}>
                                                    <Form.Range id="precio_min" min="10" max={parseInt(nuevosFiltros.precio_max) - 20} value={nuevosFiltros.precio_min} onChange={controlCambios} />
                                                </td>
                                                <td>
                                                    <h4 className="text-center">{nuevosFiltros.precio_min} €</h4>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                </Form.Group>

                            </div>
                            <div className="col">

                                <Form.Group className="mb-3">

                                    <Form.Label htmlFor="titulo">
                                        <small>
                                            Precio máximo
                                        </small>
                                    </Form.Label>

                                    <table className="table">
                                        <tbody>
                                            <tr style={{ verticalAlign: 'middle', borderBottom: 'transparent' }}>

                                                <td style={{ width: '50%' }}>
                                                    <Form.Range id="precio_max" min={parseInt(nuevosFiltros.precio_min) + 20} max={2000} value={nuevosFiltros.precio_max} onChange={controlCambios} />
                                                </td>
                                                <td>
                                                    <h4 className="text-center">{nuevosFiltros.precio_max} €</h4>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                </Form.Group>
                            </div>
                        </div>

                        <hr />

                        <div className="row">

                            <h4 style={{ fontWeight: 'bold' }}>
                                Tipo de alojamiento
                            </h4>

                            <div className="col">

                                <Form.Group className="mb-3">

                                    <Form.Label htmlFor="titulo">
                                        <small>
                                            Viajeros
                                        </small>
                                    </Form.Label>

                                    <br />

                                    <Button id="viajeros-0" className={nuevosFiltros.viajeros === 0 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        Todos
                                    </Button>

                                    <Button id="viajeros-1" className={nuevosFiltros.viajeros === 1 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        1
                                    </Button>

                                    <Button id="viajeros-2" className={nuevosFiltros.viajeros === 2 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        2
                                    </Button>

                                    <Button id="viajeros-3" className={nuevosFiltros.viajeros === 3 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        3
                                    </Button>

                                    <Button id="viajeros-4" className={nuevosFiltros.viajeros === 4 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        4
                                    </Button>

                                    <Button id="viajeros-5" className={nuevosFiltros.viajeros === 5 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        5+
                                    </Button>

                                </Form.Group>

                                <Form.Group className="mb-3">

                                    <Form.Label htmlFor="titulo">
                                        <small>
                                            Habitaciones
                                        </small>
                                    </Form.Label>
                                    
                                    <br />

                                    <Button id="habitaciones-0" className={nuevosFiltros.habitaciones === 0 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        Todos
                                    </Button>

                                    <Button id="habitaciones-1" className={nuevosFiltros.habitaciones === 1 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        1
                                    </Button>

                                    <Button id="habitaciones-2" className={nuevosFiltros.habitaciones === 2 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        2
                                    </Button>

                                    <Button id="habitaciones-3" className={nuevosFiltros.habitaciones === 3 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        3
                                    </Button>

                                    <Button id="habitaciones-4" className={nuevosFiltros.habitaciones === 4 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        4
                                    </Button>

                                    <Button id="habitaciones-5" className={nuevosFiltros.habitaciones === 5 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        5+
                                    </Button>
                                </Form.Group>

                                <Form.Group className="mb-3">

                                    <Form.Label htmlFor="titulo">
                                        <small>
                                            Camas
                                        </small>
                                    </Form.Label>
                                    
                                    <br />

                                    <Button id="camas-0" className={nuevosFiltros.camas === 0 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        Todos
                                    </Button>

                                    <Button id="camas-1" className={nuevosFiltros.camas === 1 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        1
                                    </Button>

                                    <Button id="camas-2" className={nuevosFiltros.camas === 2 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        2
                                    </Button>

                                    <Button id="camas-3" className={nuevosFiltros.camas === 3 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        3
                                    </Button>

                                    <Button id="camas-4" className={nuevosFiltros.camas === 4 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        4
                                    </Button>

                                    <Button id="camas-5" className={nuevosFiltros.camas === 5 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        5+
                                    </Button>
                                </Form.Group>

                                <Form.Group className="mb-3">

                                    <Form.Label htmlFor="titulo">
                                        <small>
                                            Baños
                                        </small>
                                    </Form.Label>
                                    
                                    <br />

                                    <Button id="aseos-0" className={nuevosFiltros.aseos === 0 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        Todos
                                    </Button>

                                    <Button id="aseos-1" className={nuevosFiltros.aseos === 1 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        1
                                    </Button>

                                    <Button id="aseos-2" className={nuevosFiltros.aseos === 2 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        2
                                    </Button>

                                    <Button id="aseos-3" className={nuevosFiltros.aseos === 3 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        3
                                    </Button>

                                    <Button id="aseos-4" className={nuevosFiltros.aseos === 4 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        4
                                    </Button>

                                    <Button id="aseos-5" className={nuevosFiltros.aseos === 5 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        5+
                                    </Button>
                                </Form.Group>
                            </div>
                        </div>

                        <hr />

                        <div className="row">

                            <h4 style={{ fontWeight: 'bold' }}>
                                Valoración
                            </h4>

                            <div className="col">
                             
                                <Form.Group className="mb-3">       
                                    <br />

                                    <Button id="valoracion-0" className={nuevosFiltros.valoracion === 0 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        Todos
                                    </Button>

                                    <Button id="valoracion-1" className={nuevosFiltros.valoracion === 1 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        &gt;1
                                    </Button>

                                    <Button id="valoracion-2" className={nuevosFiltros.valoracion === 2 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        &gt;2
                                    </Button>

                                    <Button id="valoracion-3" className={nuevosFiltros.valoracion === 3 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        &gt;3
                                    </Button>

                                    <Button id="valoracion-4" className={nuevosFiltros.valoracion === 4 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        &gt;4
                                    </Button>

                                    <Button id="valoracion-5" className={nuevosFiltros.valoracion === 5 ? "btn-filtros-activo" : "btn-filtros"} onClick={controlAlojamiento}>
                                        5
                                    </Button>
                                
                                </Form.Group> 
                            </div>
                        </div>

                        <hr />

                        <div className="row">

                            <h4 style={{ fontWeight: 'bold' }}>
                                Visto ya
                            </h4>

                            <div className="col">
                             
                                <Form.Group className="mb-3">       
                                    <br />
                                    <Form.Check 
                                        type="switch"
                                        id="visto"
                                        defaultChecked={nuevosFiltros.visto}
                                        onClick={controlCheck}
                                        label="Eliminar ya vistos"
                                    />
                                </Form.Group> 
                            </div>
                        </div>
                    </div>

                </Form>

            </Modal.Body>

            <Modal.Footer>

                <Button className="borrar-botones me-auto" size="sm" onClick={borrarFiltros}>
                    <FontAwesomeIcon icon={faBan} /> Borrar filtros
                </Button>

                <Button className="filtros-botones" size="sm" onClick={cambiarFiltros}>
                    <FontAwesomeIcon icon={faRepeat} /> Mostrar {alojamientos} alojamientos
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default FiltrosModal;
