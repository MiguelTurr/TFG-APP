import React, { useState } from "react";

import { crearAlerta } from '../Toast/Toast.js';
//import { esNumero } from '../../resources/regex.js';

import BuscarLugar from "../Maps/buscarLugar.js";
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faArrowLeft, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const center = {
    lat: -3.745,
    lng: -38.523
  };
  

function CrearAlojamiento({ show, vistaAlojamientos }) {

    const [map, setMap] = React.useState(null)

    const onLoad = React.useCallback(function callback(map) {
        // This is just an example of getting and using the map instance!!! don't just blindly copy!
        const bounds = new window.google.maps.LatLngBounds(center);
        map.fitBounds(bounds);

        setMap(map)
    }, [])

    //

    const [form, setForm] = useState({
        titulo: '',
        descripcion: '',
        precio: 10,

        viajeros: 1,
        habitaciones: 1,
        camas: 1,
        aseos: 1,

        horaEntrada: undefined,
        horaSalida: undefined,

        puedeFiestas: false,
        puedeFumar: false,

        cocina: false,
        wifi: false,
        mascotas: false,
        aparcamiento: false,
        piscina: false,
        lavadora: false,
        aire: false,
        calefaccion: false,
        television: false,

        imgTotal: 0,
    });

    const [ubicacion, setUbicacion] = useState({ direccion: '', lat: 0.0, lng: 0.0 });

    const [formErrors, setformErrors] = useState({});
    const [imagenPreview, setImagenPreview] = useState([]);

    const cambiosForm = (event, tipo = undefined) => {

        const elementId = event.target.id;
        const elementValue = (tipo === undefined) ? event.target.value : event.target.checked;

        setForm({ ...form, [elementId]: elementValue, });

        if (!!formErrors[elementId]) {
            setformErrors({ ...formErrors, [elementId]: null });
        }
    };

    const botonesSumaResta = (e) => {
        var [opcion, operacion] = e.currentTarget.id.split('-');

        var valorActual = form[opcion];

        if (operacion === 'resta') valorActual--;
        else valorActual++;

        setForm({ ...form, [opcion]: valorActual, });
    };

    const addImagenes = (e) => {

        const len = e.target.files.length;

        if (len > 5) {
            return crearAlerta('error', '¡El máximo son 5 imágenes!')
        }

        setForm({ ...form, imgTotal: len });

        var array = [];
        for (var i = 0; i < len; i++) {
            array.push(URL.createObjectURL(e.target.files[i]));
        }
        setImagenPreview(array);

        if (!!formErrors.imagenes) {
            setformErrors({ ...formErrors, imagenes: null });
        }
    };

    const removeImagen = (e, index) => {

        const inputImagenes = document.getElementById('imagenes');

        var fileActual = inputImagenes.files;
        var fileBuffer = new DataTransfer()

        for (let i = 0; i < fileActual.length; i++) {
            if (index !== i) {
                fileBuffer.items.add(fileActual[i]);
            }
        }

        inputImagenes.files = fileBuffer.files;

        //

        setForm({ ...form, imgTotal: form.imgTotal - 1 });

        imagenPreview.splice(index, 1)
        setImagenPreview(imagenPreview);
    };

    const erroresForm = () => {
        const erroresEncontrados = {};

        if (!form.titulo || form.titulo === '') erroresEncontrados.titulo = '¡Debe tener un título!';
        else if (form.titulo > 70) erroresEncontrados.titulo = '¡El título es demasiado largo!';

        if (!form.descripcion || form.descripcion === '') erroresEncontrados.descripcion = '¡Debe tener una descripción!';
        else if (form.descripcion > 800) erroresEncontrados.descripcion = '¡La descripción es demasiada larga!';

        //if (!form.ubicacion || form.ubicacion === '') erroresEncontrados.ubicacion = '¡Debes poner una ubicación!';

        const inputImagenes = document.getElementById('imagenes');
        const len = inputImagenes.files.length;

        if (len === 0) erroresEncontrados.imagenes = '¡Debes añadir al menos una imagen!';
        else if (len > 5) erroresEncontrados.imagenes = '¡Sólo puedes subir 5 imágenes!';
        else {

            const maxSize = 2 * 1024 * 1024;

            for (var i = 0; i < len; i++) {
                if (!['image/jpeg', 'image/png'].includes(inputImagenes.files[i].type)) {
                    erroresEncontrados.imagenes = '¡Una imagen no tiene el formato correcto!';
                    break;
                }

                if (inputImagenes.files[i].size > maxSize) {
                    erroresEncontrados.imagenes = '¡El tamaño máximo por imagen es de 2 MB!';
                    break;
                }
            }
        }

        return erroresEncontrados;
    };

    const crearNuevoAlojamiento = async (e) => {
        e.preventDefault();

        //

        const comprobarErrores = erroresForm();

        if (Object.keys(comprobarErrores).length > 0) {

            window.scrollTo(0, 0);

            crearAlerta('error', '¡Hay errores en el formulario!');

            setformErrors(comprobarErrores);
            return;
        }

        const btnDesactivar = document.getElementById('crear-alojamiento');
        btnDesactivar.disabled = true;

        var formData = new FormData();

        Object.keys(form).map((x) => {
            formData.append(x, form[x]);
        });

        var inputImagenes = document.getElementById('imagenes');
        const len = inputImagenes.files.length;

        for (var i = 0; i < len; i++) {
            formData.append('imagen', inputImagenes.files[i]);
        }

        //

        const data = await fetch('/perfil/misalojamientos/crear', {
            method: 'POST',
            body: formData,
        });

        const items = await data.json();
        btnDesactivar.disabled = false;

        if (items.respuesta === 'err_user') {
            window.scrollTo(0, 0);
            crearAlerta('error', '¡Ha ocurrido un error con el usuario!');

        } else if (items.respuesta === 'err_db') {
            window.scrollTo(0, 0);
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if (items.respuesta === 'correcto') {
            crearAlerta('exito', '¡Has creado un nuevo alojamiento!');
            vistaAlojamientos(false);

            //console.log('alojamientoId: ' +items.alojamientoId)
        }
    };

    return (<>
        {show === true && <div className="container-fluid mb-5">

            <Form onSubmit={crearNuevoAlojamiento}>
                    <div className="row">

                        <div className="col-sm">

                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="titulo">Título</Form.Label>
                            <Form.Control
                                type="text"
                                id="titulo"
                                size="sm"
                                placeholder="Ejemplo: Casa grande con buenas vistas"
                                value={form.titulo}
                                onChange={cambiosForm}
                                isInvalid={!!formErrors.titulo} />

                            <Form.Control.Feedback type="invalid">
                                {formErrors.titulo}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="descripcion">Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                id="descripcion"
                                size="sm"
                                placeholder="Ejemplo: La casa está situada cerca de un rio con muy buenas vistas..."
                                value={form.descripcion}
                                onChange={cambiosForm}
                                isInvalid={!!formErrors.descripcion} />

                            <Form.Control.Feedback type="invalid">
                                {formErrors.descripcion}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <hr />

                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="precio">Precio por noche</Form.Label>
                            <Row>
                                <Col>
                                    <Form.Range id="precio" min="10" max="2000" value={form.precio} onChange={cambiosForm} />
                                </Col>
                                <Col>
                                    <h4 className="text-center">{form.precio} €</h4>
                                </Col>
                            </Row>
                        </Form.Group>

                        <hr />

                        <Form.Group className="mb-3">

                            <Row>
                                <Col>
                                    <Form.Label>Viajeros</Form.Label>
                                </Col>
                                <Col>
                                    <Button id="viajeros-resta" disabled={form.viajeros <= 1} className="rounded-pill btn-plus-minus" size="sm" onClick={botonesSumaResta}>
                                        <FontAwesomeIcon icon={faMinus} style={{ color: 'black' }} />
                                    </Button>
                                </Col>
                                <Col className="text-center">
                                    <h5>
                                        {form.viajeros}
                                    </h5>
                                </Col>
                                <Col style={{ textAlign: 'right' }}>
                                    <Button id="viajeros-suma" className="rounded-pill btn-plus-minus" size="sm" onClick={botonesSumaResta}>
                                        <FontAwesomeIcon icon={faPlus} style={{ color: 'black' }} />
                                    </Button>
                                </Col>
                            </Row>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Row>
                                <Col>
                                    <Form.Label>Habitaciones</Form.Label>
                                </Col>
                                <Col>
                                    <Button id="habitaciones-resta" disabled={form.habitaciones <= 1} className="rounded-pill btn-plus-minus" size="sm" onClick={botonesSumaResta}>
                                        <FontAwesomeIcon icon={faMinus} style={{ color: 'black' }} />
                                    </Button>
                                </Col>
                                <Col className="text-center">
                                    <h5>
                                        {form.habitaciones}
                                    </h5>
                                </Col>
                                <Col style={{ textAlign: 'right' }}>
                                    <Button id="habitaciones-suma" className="rounded-pill btn-plus-minus" size="sm" onClick={botonesSumaResta}>
                                        <FontAwesomeIcon icon={faPlus} style={{ color: 'black' }} />
                                    </Button>
                                </Col>
                            </Row>
                        </Form.Group>

                        <Form.Group className="mb-3">

                            <Row>
                                <Col>
                                    <Form.Label>Camas</Form.Label>
                                </Col>
                                <Col>
                                    <Button id="camas-resta" disabled={form.camas <= 1} className="rounded-pill btn-plus-minus" size="sm" onClick={botonesSumaResta}>
                                        <FontAwesomeIcon icon={faMinus} style={{ color: 'black' }} />
                                    </Button>
                                </Col>
                                <Col className="text-center">
                                    <h5>
                                        {form.camas}
                                    </h5>
                                </Col>
                                <Col style={{ textAlign: 'right' }}>
                                    <Button id="camas-suma" className="rounded-pill btn-plus-minus" size="sm" onClick={botonesSumaResta}>
                                        <FontAwesomeIcon icon={faPlus} style={{ color: 'black' }} />
                                    </Button>
                                </Col>
                            </Row>
                        </Form.Group>

                        <Form.Group className="mb-3">

                            <Row>
                                <Col>
                                    <Form.Label htmlFor="viajeros">Aseos</Form.Label>
                                </Col>
                                <Col>
                                    <Button id="aseos-resta" disabled={form.aseos <= 1} className="rounded-pill btn-plus-minus" size="sm" onClick={botonesSumaResta}>
                                        <FontAwesomeIcon icon={faMinus} style={{ color: 'black' }} />
                                    </Button>
                                </Col>
                                <Col className="text-center">
                                    <h5>
                                        {form.aseos}
                                    </h5>
                                </Col>
                                <Col style={{ textAlign: 'right' }}>
                                    <Button id="aseos-suma" className="rounded-pill btn-plus-minus" size="sm" onClick={botonesSumaResta}>
                                        <FontAwesomeIcon icon={faPlus} style={{ color: 'black' }} />
                                    </Button>
                                </Col>
                            </Row>
                        </Form.Group>

                        <hr />

                        <Form.Group className="mb-3">
                            <Row>
                                <Col>
                                    <Form.Label htmlFor="horaEntrada">Hora entrada</Form.Label>
                                    <Form.Control
                                        id="horaEntrada"
                                        type="time"
                                        size="sm"
                                        value={form.horaEntrada}
                                        onChange={cambiosForm} />
                                </Col>
                                <Col>
                                    <Form.Label htmlFor="horaSalida">Hora salida</Form.Label>
                                    <Form.Control
                                        id="horaSalida"
                                        type="time"
                                        size="sm"
                                        value={form.horaSalida}
                                        onChange={cambiosForm} />
                                </Col>
                            </Row>
                        </Form.Group>

                        <hr />

                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="mod-password-2">Normas</Form.Label>
                            <div key='checkbox' className="mb-3">
                                <Form.Check
                                    inline
                                    id="puedeFiestas"
                                    label="Se pueden hacer fiestas"
                                    name="group1"
                                    defaultChecked={false}
                                    type='checkbox'
                                    value={form.puedeFiestas}
                                    onChange={(e) => { cambiosForm(e, 'checkbox'); }}
                                />
                                <Form.Check
                                    inline
                                    id="puedeFumar"
                                    label="Se puede fumar"
                                    name="group1"
                                    defaultChecked={false}
                                    type='checkbox'
                                    value={form.puedeFumar}
                                    onChange={(e) => { cambiosForm(e, 'checkbox'); }}
                                />
                            </div>
                        </Form.Group>

                        <hr />

                        <Form.Group className="mb-3">
                            <Form.Label>Servicios</Form.Label>
                            <div key='checkbox' className="mb-3">
                                <Form.Check
                                    inline
                                    id="cocina"
                                    label="Cocina"
                                    name="group2"
                                    type='checkbox'
                                    value={form.cocina}
                                    onChange={(e) => { cambiosForm(e, 'checkbox'); }}
                                />
                                <Form.Check
                                    inline
                                    id="wifi"
                                    label="Wifi"
                                    name="group2"
                                    type='checkbox'
                                    value={form.wifi}
                                    onChange={(e) => { cambiosForm(e, 'checkbox'); }}
                                />
                                <Form.Check
                                    inline
                                    id="mascotas"
                                    label="Mascotas"
                                    name="group2"
                                    type='checkbox'
                                    value={form.mascotas}
                                    onChange={(e) => { cambiosForm(e, 'checkbox'); }}
                                />
                                <Form.Check
                                    inline
                                    id="aparcamiento"
                                    label="Aparcamiento"
                                    name="group2"
                                    type='checkbox'
                                    value={form.aparcamiento}
                                    onChange={(e) => { cambiosForm(e, 'checkbox'); }}
                                />
                                <Form.Check
                                    inline
                                    id="piscina"
                                    label="Piscina"
                                    name="group2"
                                    type='checkbox'
                                    value={form.piscina}
                                    onChange={(e) => { cambiosForm(e, 'checkbox'); }}
                                />
                                <Form.Check
                                    inline
                                    id="lavadora"
                                    label="Lavadora"
                                    name="group2"
                                    type='checkbox'
                                    value={form.lavadora}
                                    onChange={(e) => { cambiosForm(e, 'checkbox'); }}
                                />
                                <Form.Check
                                    inline
                                    id="aire"
                                    label="Aire acondicionado"
                                    name="group2"
                                    type='checkbox'
                                    value={form.aire}
                                    onChange={(e) => { cambiosForm(e, 'checkbox'); }}
                                />
                                <Form.Check
                                    inline
                                    id="calefaccion"
                                    label="Calefacción"
                                    name="group2"
                                    type='checkbox'
                                    value={form.calefaccion}
                                    onChange={(e) => { cambiosForm(e, 'checkbox'); }}
                                />
                                <Form.Check
                                    inline
                                    id="television"
                                    label="Televisión"
                                    name="group2"
                                    type='checkbox'
                                    value={form.television}
                                    onChange={(e) => { cambiosForm(e, 'checkbox'); }}
                                />
                            </div>
                        </Form.Group>

                    </div>

                    <div className="col-sm separador-izquierda">

                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="mod-password-2">Ubicación</Form.Label>

                            <BuscarLugar/>

                            <Form.Control.Feedback type="invalid">
                                {formErrors.ubicacion}
                            </Form.Control.Feedback>

                            <div id="map">

                            </div>

                            <GoogleMap 
                                center={center}
                                zoom={10}
                                onLoad={onLoad}>
                            </GoogleMap>

                        </Form.Group>

                        <hr />

                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="imagenes">Imágenes</Form.Label>
                            <Form.Control
                                type="file"
                                id="imagenes"
                                size="sm"
                                accept="image/*"
                                onChange={addImagenes}
                                isInvalid={!!formErrors.imagenes}
                                multiple />

                            <Form.Control.Feedback type="invalid">
                                {formErrors.imagenes}
                            </Form.Control.Feedback>

                            <Form.Text className="text-muted">
                                Formatos aceptados ( .png / .jpg )
                            </Form.Text>
                        </Form.Group>

                        <hr />

                        {form.imgTotal > 0 && <small className="text-muted">
                            Imágenes: {form.imgTotal} de 5
                            <br />
                            <br />
                        </small>}

                        <div className="row">

                            {
                                imagenPreview.map((x, index) => (

                                    <div className="col" key={index} onClick={(e) => { removeImagen(e, index) }}>
                                        <img className="img-fluid preview-img" src={x} alt="preview de imagen" />
                                    </div>
                                ))
                            }
                        </div>

                    </div>

                </div>

                <hr />

                <Button className="filtros-botones" size="sm" onClick={() => { vistaAlojamientos(false) }}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Volver
                </Button>
                &nbsp;&nbsp;
                <Button type="submit" className="crear-botones" size="sm" id="crear-alojamiento">
                    <FontAwesomeIcon icon={faHouse} /> Crear alojamiento
                </Button>

            </Form>
        </div>}
    </>);
}

export default CrearAlojamiento;