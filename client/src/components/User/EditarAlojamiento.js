import React, { useState, useEffect } from "react";

import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrashCan, faHouse, faLocationDot, faArrowRight, faXmark, faPenToSquare, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/esm/Form";
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

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

        const data = await fetch('/perfil/mis-alojamientos/' + alojamientoId, { method: 'GET' });
        const items = await data.json();

        if (items.respuesta === 'err_user') {
            crearAlerta('error', '¡Ha ocurrido un error con el usuario!');

        } else if (items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if (items.respuesta === 'correcto') {
            setAlojamiento(items.alojamiento);
        }
    };

    if (alojamientoId === null) {
        return <></>;
    }

    const eliminarAlojamiento = async () => {

        if (cambiarDatos.eliminar === '') {
            return crearAlerta('error', '¡Debes colocar tu contraseña');
        }

        if (window.confirm('¿Estás seguro?') === false) {
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

        if (items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if (items.respuesta === 'correcto') {
            crearAlerta('exito', '¡Alojamiento eliminado!');
            setTimeout(() => { console.log('Correcto'); }, 1000);
        }
    };

    const modificarDato = async (tipoId) => {

        if(cambiarDatos?.dato === tipoId) {
            return;
        }

        var objeto = {};

        objeto.dato = tipoId;
        objeto.modificado = false;

        if (tipoId === 'titulo') {
            objeto[tipoId] = alojamiento.titulo;

        } else if (tipoId === 'descripcion') {
            objeto[tipoId] = alojamiento.descripcion;

        } else if (tipoId === 'coste') {
            objeto[tipoId] = alojamiento.precio;

        } else if (tipoId === 'alojamiento') {

            objeto.cocina = alojamiento.cocina === 1 ? true : false;
            objeto.wifi = alojamiento.wifi === 1 ? true : false;
            objeto.mascotas = alojamiento.mascotas === 1 ? true : false;
            objeto.aparcamiento = alojamiento.aparcamiento === 1 ? true : false;
            objeto.piscina = alojamiento.piscina === 1 ? true : false;
            objeto.lavadora = alojamiento.lavadora === 1 ? true : false;
            objeto.aire = alojamiento.aire === 1 ? true : false;
            objeto.calefaccion = alojamiento.calefaccion === 1 ? true : false;
            objeto.television = alojamiento.television === 1 ? true : false;

            objeto.viajeros = alojamiento.viajeros;
            objeto.habitaciones = alojamiento.habitaciones;
            objeto.camas = alojamiento.camas;
            objeto.aseos = alojamiento.aseos;

            objeto.puedeFumar = alojamiento.puedeFumar;
            objeto.puedeFiestas = alojamiento.puedeFiestas;

        } else if (tipoId === 'eliminar') {
            objeto[tipoId] = '';

        } else if(tipoId === 'imagenes') {

            var arrayImg = [];

            for(var i = 0; i < alojamiento.imgCantidad; i++) {

                const imagen = await fetch('/alojamiento/imagen/' +alojamiento.ID+ '-' +i, { 
                    method: 'GET',
            
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
    
                if(imagen.status === 200) {
                    arrayImg.push(imagen.url);
                }
            }
            setAlojamientoImg(arrayImg);

            objeto.nuevasImagenes = 0;

        }

        setCambiarDatos(objeto);
    };

    const controlDato = (e, tipo) => {

        const elementId = e.target.id;
        const elementValue = (tipo === undefined) ? e.target.value : e.target.checked;

        setCambiarDatos({ ...cambiarDatos, [elementId]: elementValue, modificado: true });
    };

    const botonesSumaResta = (e) => {
        var [opcion, operacion] = e.currentTarget.id.split('-');

        var valorActual = cambiarDatos[opcion];

        if (operacion === 'resta') valorActual--;
        else valorActual++;

        setCambiarDatos({ ...cambiarDatos, [opcion]: valorActual, modificado: true });
    };

    //

    const volverEditar = () => {
        setCambiarDatos(null);
        vistaAlojamientos('principal');
    };

    const cancelarEditar = () => {
        setCambiarDatos(null);
    };

    const enviarDatoModificado = async (e) => {
        e.preventDefault();

        //

        if (cambiarDatos.dato === 'eliminar') {
            return eliminarAlojamiento();
        }

        //

        const btnModificar = document.getElementById('mod-btn');
        btnModificar.disabled = true;

        const formData = new FormData();
        formData.append('alojamientoID', alojamiento.ID);
        formData.append('tipo', cambiarDatos.dato);
        
        if(cambiarDatos.dato === 'alojamiento') {
            formData.append('viajeros', cambiarDatos.viajeros);
            formData.append('habitaciones', cambiarDatos.habitaciones);
            formData.append('camas', cambiarDatos.camas);
            formData.append('aseos', cambiarDatos.aseos);

            formData.append('cocina', cambiarDatos.cocina);
            formData.append('wifi', cambiarDatos.wifi);
            formData.append('mascotas', cambiarDatos.mascotas);
            formData.append('piscina', cambiarDatos.piscina);
            formData.append('lavadora', cambiarDatos.lavadora);
            formData.append('aire', cambiarDatos.aire);
            formData.append('calefaccion', cambiarDatos.calefaccion);
            formData.append('television', cambiarDatos.television);

            formData.append('puedeFumar', cambiarDatos.puedeFumar);
            formData.append('puedeFiestas', cambiarDatos.puedeFiestas);

        } else if(cambiarDatos.dato === 'titulo') {
            formData.append('editado', cambiarDatos.titulo);

        } else if(cambiarDatos.dato === 'descripcion') {
            formData.append('editado', cambiarDatos.descripcion);

        } else if(cambiarDatos.dato === 'coste') {
            formData.append('precio', cambiarDatos.coste);
            formData.append('precioAnterior', alojamiento.precio);
            formData.append('ubicacion', alojamiento.ubicacion);
            formData.append('titulo', alojamiento.titulo);

        } else if(cambiarDatos.dato === 'imagenes') {

        }

        const data = await fetch('/perfil/mis-alojamientos/editar/', {
            method: 'POST',
            body: formData
        });

        const items = await data.json();
        btnModificar.disabled = false;

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {
            crearAlerta('exito', '¡Dato modificado!');

            //setCambiarDatos(null);
        }
    };

    const eliminarFoto = () => {

    };

    //

    const verAlojamiento = () => {
        window.open('/alojamiento/ver?casa=' + alojamientoId, '_blank');
    };

    //

    return (

        <div className="container-fluid mb-5" style={show === 'editar' ? {} : { display: 'none' }}>

            <Button className="filtros-botones" size="sm" onClick={volverEditar}>
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

                <div className="col" style={window.innerWidth < 600 && cambiarDatos !== null ? { display: 'none' } : {}}>

                    <table className="table">
                        <tbody>
                            <tr>
                                <td>
                                    Ubicación:
                                    <br />
                                    <small><FontAwesomeIcon icon={faLocationDot} style={{ color: 'green' }} /> {alojamiento?.ubicacion}</small>
                                </td>
                                <td> </td>
                            </tr>

                            <tr>
                                <td>
                                    Fecha creación:
                                    <br />
                                    <small>{new Date(alojamiento.creadoEn).toLocaleDateString('es-ES', crearOptions)}</small>
                                </td>
                                <td> </td>
                            </tr>

                            <tr className={cambiarDatos?.dato === 'titulo' ? 'tabla-activa' : "tabla-seleccion"} onClick={() => { modificarDato('titulo'); }}>
                                <td>
                                    Título:
                                    <br />
                                    <small>
                                        {alojamiento.titulo?.substring(0, 40)}<span style={alojamiento.titulo?.length > 40 ? {} : { display: 'none' }}>...</span>
                                    </small>
                                </td>
                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>

                            <tr className={cambiarDatos?.dato === 'descripcion' ? 'tabla-activa' : "tabla-seleccion"} onClick={() => { modificarDato('descripcion'); }}>
                                <td>
                                    Descripción:
                                    <br />
                                    <small>
                                        {alojamiento.descripcion?.substring(0, 40)}<span style={alojamiento.descripcion?.length > 40 ? {} : { display: 'none' }}>...</span>
                                    </small>
                                </td>
                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>

                            <tr className={cambiarDatos?.dato === 'coste' ? 'tabla-activa' : "tabla-seleccion"} onClick={() => { modificarDato('coste'); }}>
                                <td>
                                    Coste:
                                    <br />
                                    <small>
                                        <span style={alojamiento.precioAnterior !== null ? {} : { display: 'none' }}>
                                            <del className="text-muted">{alojamiento.precioAnterior}€</del>&nbsp;
                                        </span>
                                        {alojamiento.precio}€ por noche
                                    </small>
                                </td>
                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>

                            <tr className={cambiarDatos?.dato === 'alojamiento' ? 'tabla-activa' : "tabla-seleccion"} onClick={() => { modificarDato('alojamiento'); }}>
                                <td>
                                    Alojamiento:
                                    <br />
                                    <small>
                                        {alojamiento.viajeros} viajeros &#183; {alojamiento.habitaciones} habitaciones &#183; {alojamiento.camas} camas &#183; {alojamiento.aseos} baños
                                    </small>
                                    <br />
                                    <small>{alojamiento.strServicios}</small>
                                </td>
                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>

                            <tr className={cambiarDatos?.dato === 'imagenes' ? 'tabla-activa' : "tabla-seleccion"} onClick={() => { modificarDato('imagenes'); }}>
                                <td>
                                    Imágenes:
                                    <br />
                                    <small>{alojamiento.imgCantidad}</small>
                                </td>
                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="col" style={window.innerWidth < 600 && cambiarDatos === null ? { display: 'none' } : {}}>

                    <div style={cambiarDatos !== null ? {} : { display: 'none' }}>

                        <h4 className="text-center" style={{ fontWeight: 'bold' }}>
                            <FontAwesomeIcon icon={faXmark} style={{ float: 'left', marginTop: '5px', cursor: 'pointer' }} onClick={cancelarEditar} />

                            MODIFICAR: {cambiarDatos?.dato?.toUpperCase()}
                        </h4>

                        <hr />

                        <Form onSubmit={enviarDatoModificado}>

                            <Form.Group className="mb-3" style={cambiarDatos?.dato === 'titulo' ? {} : { display: 'none' }} >
                                <Form.Label>
                                    <small className="text-muted">Quedan {tituloCaracteres - cambiarDatos?.titulo?.length} caracteres</small>
                                </Form.Label>
                                <Form.Control type="text" placeholder="Nuevo título" id="titulo" value={cambiarDatos?.titulo} onChange={controlDato} />
                            </Form.Group>

                            <Form.Group className="mb-3" style={cambiarDatos?.dato === 'descripcion' ? {} : { display: 'none' }} >
                                <Form.Label>
                                    <small className="text-muted">Quedan {descripcionCaracteres - cambiarDatos?.descripcion?.length} caracteres</small>
                                </Form.Label>
                                <Form.Control as="textarea" rows="8" placeholder="Nueva descripción" id="descripcion" value={cambiarDatos?.descripcion} onChange={controlDato} />
                            </Form.Group>

                            <Form.Group className="mb-3" style={cambiarDatos?.dato === 'alojamiento' ? {} : { display: 'none' }} >

                                
                            <Form.Label className="mb-3">
                                    <small className="text-muted">Cambia los elementos de tu casa.</small>
                                </Form.Label>

                                <Row className="mb-3">
                                    <Col xs={4}>
                                        <Form.Label>Viajeros</Form.Label>
                                    </Col>
                                    <Col>
                                        <Button id="viajeros-resta" disabled={cambiarDatos?.viajeros <= 1} className="rounded-pill btn-plus-minus" size="sm" onClick={botonesSumaResta}>
                                            <FontAwesomeIcon icon={faMinus} style={{ color: 'black' }} />
                                        </Button>
                                    </Col>
                                    <Col className="text-center">
                                        <h5>
                                            {cambiarDatos?.viajeros}
                                        </h5>
                                    </Col>
                                    <Col style={{ textAlign: 'right' }}>
                                        <Button id="viajeros-suma" className="rounded-pill btn-plus-minus" size="sm" onClick={botonesSumaResta}>
                                            <FontAwesomeIcon icon={faPlus} style={{ color: 'black' }} />
                                        </Button>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col xs={4}>
                                        <Form.Label>Habitaciones</Form.Label>
                                    </Col>
                                    <Col>
                                        <Button id="habitaciones-resta" disabled={cambiarDatos?.habitaciones <= 1} className="rounded-pill btn-plus-minus" size="sm" onClick={botonesSumaResta}>
                                            <FontAwesomeIcon icon={faMinus} style={{ color: 'black' }} />
                                        </Button>
                                    </Col>
                                    <Col className="text-center">
                                        <h5>
                                            {cambiarDatos?.habitaciones}
                                        </h5>
                                    </Col>
                                    <Col style={{ textAlign: 'right' }}>
                                        <Button id="habitaciones-suma" className="rounded-pill btn-plus-minus" size="sm" onClick={botonesSumaResta}>
                                            <FontAwesomeIcon icon={faPlus} style={{ color: 'black' }} />
                                        </Button>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col xs={4}>
                                        <Form.Label>Camas</Form.Label>
                                    </Col>
                                    <Col>
                                        <Button id="camas-resta" disabled={cambiarDatos?.camas <= 1} className="rounded-pill btn-plus-minus" size="sm" onClick={botonesSumaResta}>
                                            <FontAwesomeIcon icon={faMinus} style={{ color: 'black' }} />
                                        </Button>
                                    </Col>
                                    <Col className="text-center">
                                        <h5>
                                            {cambiarDatos?.camas}
                                        </h5>
                                    </Col>
                                    <Col style={{ textAlign: 'right' }}>
                                        <Button id="camas-suma" className="rounded-pill btn-plus-minus" size="sm" onClick={botonesSumaResta}>
                                            <FontAwesomeIcon icon={faPlus} style={{ color: 'black' }} />
                                        </Button>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col xs={4}>
                                        <Form.Label htmlFor="viajeros">Aseos</Form.Label>
                                    </Col>
                                    <Col>
                                        <Button id="aseos-resta" disabled={cambiarDatos?.aseos <= 1} className="rounded-pill btn-plus-minus" size="sm" onClick={botonesSumaResta}>
                                            <FontAwesomeIcon icon={faMinus} style={{ color: 'black' }} />
                                        </Button>
                                    </Col>
                                    <Col className="text-center">
                                        <h5>
                                            {cambiarDatos?.aseos}
                                        </h5>
                                    </Col>
                                    <Col style={{ textAlign: 'right' }}>
                                        <Button id="aseos-suma" className="rounded-pill btn-plus-minus" size="sm" onClick={botonesSumaResta}>
                                            <FontAwesomeIcon icon={faPlus} style={{ color: 'black' }} />
                                        </Button>
                                    </Col>
                                </Row>

                                <Form.Label>
                                    <small className="text-muted">Selecciona los servicios del alojamiento.</small>
                                </Form.Label>

                                <div className="mb-2">
                                    <Form.Check
                                        inline
                                        id="cocina"
                                        label="Cocina"
                                        name="group2"
                                        type='checkbox'
                                        defaultChecked={cambiarDatos?.cocina}
                                        value={cambiarDatos?.cocina}
                                        onClick={(e) => { controlDato(e, 'checkbox'); }}
                                    />
                                    <Form.Check
                                        inline
                                        id="wifi"
                                        label="Wifi"
                                        name="group2"
                                        type='checkbox'
                                        defaultChecked={cambiarDatos?.wifi}
                                        value={cambiarDatos?.wifi}
                                        onClick={(e) => { controlDato(e, 'checkbox'); }}
                                    />
                                    <Form.Check
                                        inline
                                        id="mascotas"
                                        label="Mascotas"
                                        name="group2"
                                        type='checkbox'
                                        defaultChecked={cambiarDatos?.mascotas}
                                        value={cambiarDatos?.mascotas}
                                        onClick={(e) => { controlDato(e, 'checkbox'); }}
                                    />
                                    <Form.Check
                                        inline
                                        id="aparcamiento"
                                        label="Aparcamiento"
                                        name="group2"
                                        type='checkbox'
                                        defaultChecked={cambiarDatos?.aparcamiento}
                                        value={cambiarDatos?.aparcamiento}
                                        onClick={(e) => { controlDato(e, 'checkbox'); }}
                                    />
                                    <Form.Check
                                        inline
                                        id="piscina"
                                        label="Piscina"
                                        name="group2"
                                        type='checkbox'
                                        defaultChecked={cambiarDatos?.piscina}
                                        value={cambiarDatos?.piscina}
                                        onClick={(e) => { controlDato(e, 'checkbox'); }}
                                    />
                                    <Form.Check
                                        inline
                                        id="lavadora"
                                        label="Lavadora"
                                        name="group2"
                                        type='checkbox'
                                        defaultChecked={cambiarDatos?.lavadora}
                                        value={cambiarDatos?.lavadora}
                                        onClick={(e) => { controlDato(e, 'checkbox'); }}
                                    />
                                    <Form.Check
                                        inline
                                        id="aire"
                                        label="Aire acondicionado"
                                        name="group2"
                                        type='checkbox'
                                        defaultChecked={cambiarDatos?.aire}
                                        value={cambiarDatos?.aire}
                                        onClick={(e) => { controlDato(e, 'checkbox'); }}
                                    />
                                    <Form.Check
                                        inline
                                        id="calefaccion"
                                        label="Calefacción"
                                        name="group2"
                                        type='checkbox'
                                        defaultChecked={cambiarDatos?.calefaccion}
                                        value={cambiarDatos?.calefaccion}
                                        onClick={(e) => { controlDato(e, 'checkbox'); }}
                                    />
                                    <Form.Check
                                        inline
                                        id="television"
                                        label="Televisión"
                                        name="group2"
                                        type='checkbox'
                                        defaultChecked={cambiarDatos?.television}
                                        value={cambiarDatos?.television}
                                        onClick={(e) => { controlDato(e, 'checkbox'); }}
                                    />
                                </div>

                                <Form.Label>
                                    <small className="text-muted">Selecciona las normas del alojamiento.</small>
                                </Form.Label>

                                <div key='checkbox' className="mb-3">
                                    <Form.Check
                                        inline
                                        id="puedeFiestas"
                                        label="Se pueden hacer fiestas"
                                        name="group1"
                                        defaultChecked={cambiarDatos?.puedeFumar}
                                        type='checkbox'
                                        value={cambiarDatos?.puedeFiestas}
                                        onClick={(e) => { controlDato(e, 'checkbox'); }}
                                    />
                                    <Form.Check
                                        inline
                                        id="puedeFumar"
                                        label="Se puede fumar"
                                        name="group1"
                                        defaultChecked={cambiarDatos?.puedeFumar}
                                        type='checkbox'
                                        value={cambiarDatos?.puedeFumar}
                                        onClick={(e) => { controlDato(e, 'checkbox'); }}
                                    />
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-3" style={cambiarDatos?.dato === 'coste' ? {} : { display: 'none' }} >
                                <Form.Label>
                                    <small className="text-muted">Selecciona el nuevo precio.</small>
                                </Form.Label>

                                <table className="table">
                                    <tbody>
                                        <tr style={{ verticalAlign: 'middle', borderBottom: 'transparent' }}>

                                            <td style={{ width: '70%' }}>
                                                <Form.Range id="coste" min="10" max="2000" value={cambiarDatos?.coste} onChange={controlDato} />
                                            </td>
                                            <td>
                                                <h4 className="text-center">{cambiarDatos?.coste} €</h4>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </Form.Group>

                            <Form.Group className="mb-3" style={cambiarDatos?.dato === 'eliminar' ? {} : { display: 'none' }} >
                                <Form.Label>
                                    <small className="text-muted">Escribe tu contraseña para confirmar.</small>
                                </Form.Label>
                                <Form.Control type="password" placeholder="Contraseña" id="eliminar" value={cambiarDatos?.eliminar} onChange={controlDato} />
                            </Form.Group>

                            <Form.Group className="mb-3" style={cambiarDatos?.dato === 'imagenes' ? {} : { display: 'none' }} >
                                <Form.Label>
                                    <small className="text-muted">Pulsa en alguna de las imágenes para eliminarlas.</small>
                                </Form.Label>
                                <Row>
                                    {
                                        alojamientoImg.map((x, index) => (
                                            <Col key={index}>
                                                    <img
                                                        className="img-fluid preview-img"
                                                        src={x}
                                                        alt="Imágenes del alojamiento"
                                                        onClick={eliminarFoto}/>
                                            </Col>
                                        ))
                                    }
                                </Row>

                                <hr/>

                                <Form.Label>
                                    <small className="text-muted">Imágenes: {alojamientoImg.length} de 10</small>
                                </Form.Label>

                                <Form.Control
                                    type="file"
                                    id="imagenes"
                                    size="sm"
                                    accept="image/*"
                                    multiple />

                                <Form.Text className="text-muted">
                                    Formatos aceptados ( .png / .jpg )
                                </Form.Text>

                            </Form.Group>

                            

                            <Form.Group className="mb-3" style={cambiarDatos?.modificado === true ? {} : { display: 'none' }}>
                                <Button type="submit" className="filtros-botones" size="sm" id="mod-btn">
                                    &nbsp;&nbsp;&nbsp;<FontAwesomeIcon icon={faPenToSquare} /> Modificar&nbsp;&nbsp;&nbsp;
                                </Button>
                            </Form.Group>
                        </Form>

                    </div>

                </div>

            </div>
        </div >
    );
}

export default EditarAlojamiento;