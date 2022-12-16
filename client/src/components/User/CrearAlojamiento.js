import React, { useEffect, useState } from "react";

import { crearAlerta } from '../Toast/Toast.js';

import BuscarLugar from "../Maps/buscarLugar.js";
import { GoogleMap, Marker } from '@react-google-maps/api';
import { getGeocode, getLatLng } from 'use-places-autocomplete';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faArrowLeft, faPlus, faMinus, faLocationDot } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const opciones = {
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
}

const formDefault = {
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
}
  
function CrearAlojamiento({ show, vistaAlojamientos, nuevoAlojamiento }) {

    //

    const [form, setForm] = useState(formDefault);

    const [direccion, setDireccion] = useState('');

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

    // MAPA

    const [map, setMap] = React.useState(null);
    const [posicion, setPosicion] = useState({ lat: 40.46, lng: -3.74922 });
    const [ubicacion, setUbicacion] = useState({ ubicacion: 'Sin definir...' });
    const [markPosicion, setMarkPosicion] = useState(null);

    const onLoad = React.useCallback(function callback(map) {
        
        map.setOptions({styles: [
            {
                featureType: "poi",
                stylers: [{ visibility: "off" } ]   
            }
        ]});
        setMap(map);

    }, []);

    const onUnmount = React.useCallback(function callback() {
        setMap(null)
    }, []);

    const clickMapa = async (...args) => {
        const lat = args[0].latLng.lat();
        const lng = args[0].latLng.lng();

        setMarkPosicion({lat: lat, lng: lng})

        const latLng_resultados = await getGeocode({ 'latLng': args[0].latLng });
        const len = latLng_resultados.length;

        var localidad, provincia, comunidad, pais;

        for(var i = 0; i < len; i++) {

            const tipo = latLng_resultados[i].types[0];

            if(tipo === 'country') {
                pais = latLng_resultados[i].address_components[0].long_name;

            } else if(tipo === 'administrative_area_level_1') {
                comunidad = latLng_resultados[i].address_components[0].long_name;

            } else if(tipo === 'administrative_area_level_2') {
                provincia = latLng_resultados[i].address_components[0].long_name;

            } else if(tipo === 'locality') {
                localidad = latLng_resultados[i].address_components[0].long_name;

            } else if(localidad === undefined && tipo === 'administrative_area_level_3') {
                localidad = latLng_resultados[i].address_components[0].long_name;
            }
        }

        setUbicacion({ localidad: localidad, provincia: provincia, comunidad: comunidad, pais: pais, ubicacion: localidad+ ', ' +comunidad+ ', ' +pais});
    }

    useEffect(() => {
        cambiarPosicion();

    }, [direccion]);

    const cambiarPosicion = async () => {

        if(direccion === '') {
            return;
        }

        const direccion_resultados = await getGeocode({ address: direccion });
        const { lat, lng } = getLatLng(direccion_resultados[0]);

        setPosicion({ lat: lat, lng: lng});

        const len = direccion_resultados[0].address_components.length;

        if(len <= 4) {
            map.setZoom(8);

        } else {
            map.setZoom(18);
        }
    };

    //

    const erroresForm = () => {
        const erroresEncontrados = {};

        if (!form.titulo || form.titulo === '') erroresEncontrados.titulo = '¡Debe tener un título!';
        else if (form.titulo > 70) erroresEncontrados.titulo = '¡El título es demasiado largo!';

        if (!form.descripcion || form.descripcion === '') erroresEncontrados.descripcion = '¡Debe tener una descripción!';
        else if (form.descripcion > 800) erroresEncontrados.descripcion = '¡La descripción es demasiada larga!';

        const inputImagenes = document.getElementById('imagenes');
        const len = inputImagenes.files.length;

        if (len === 0) erroresEncontrados.imagenes = '¡Debes añadir al menos una imagen!';
        else if (len > 10) erroresEncontrados.imagenes = '¡Sólo puedes subir 10 imágenes!';
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

        // DIRECCIÓN

        if (direccion === '') {
            window.scrollTo(0, 0);
            return crearAlerta('error', '¡Falta la ubicación!');
        }

        if(ubicacion.localidad === undefined || ubicacion.comunidad === undefined || ubicacion.pais === undefined) {
            window.scrollTo(0, 0);
            return crearAlerta('error', '¡Se debe expecificar mejor la ubicación!');
        }

        //

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

        formData.append('ubicacion', ubicacion.ubicacion);
        formData.append('localidad', ubicacion.localidad);
        formData.append('provincia', ubicacion.provincia);
        formData.append('comunidad', ubicacion.comunidad);
        formData.append('pais', ubicacion.pais);
        formData.append('lat', posicion.lat);
        formData.append('lng', posicion.lng);

        //

        const data = await fetch('/perfil/mis-alojamientos/crear', {
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
            vistaAlojamientos('principal');

            // ESTADO POR DEFECTO
            
            document.getElementById('imagenes').value = '';

            setForm(formDefault);
            setImagenPreview([]);
            setDireccion('');
            setPosicion({ lat: 40.46, lng: -3.74922 });
            setUbicacion({ ubicacion: 'Sin definir...' });

            // AÑADIR A LA LISTA

            nuevoAlojamiento({
                ID: items.alojamientoId,
                precio: form.precio,
                creadoEn: new Date(),
                valoracionMedia: 0,
                vecesValorado: 0,
                visitas: 0,
                valoracionesNuevas: 0,

                // UBICACIÓN

                ubicacion: ubicacion.ubicacion,
            });
        }
    };

    return (
        <div className="container-fluid mb-5" style={show === 'crear' ? {} : { display: 'none' }}>

            <Button className="filtros-botones" size="sm" onClick={() => { vistaAlojamientos('principal') }}>
                <FontAwesomeIcon icon={faArrowLeft} /> Volver
            </Button>

            <hr />

            <Form onSubmit={crearNuevoAlojamiento}>
                    <div className="row">

                        <div className="col-sm-4">

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
                                <Col xs={4}>
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
                                <Col xs={4}>
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
                                <Col xs={4}>
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
                                <Col xs={4}>
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

                    <div className={window.innerWidth < 600 ? "col-sm" : "col-sm separador-izquierda"}>

                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="mod-password-2">Ubicación</Form.Label>

                            <BuscarLugar enviaDireccion={setDireccion} />

                            <div className="mb-3" style={ direccion !== '' ? {} : { display: 'none' } }>

                                <Form.Label htmlFor="imagenes">Selecciona el lugar exacto: </Form.Label>

                                <GoogleMap
                                    mapContainerStyle={{ width: '100%', height: '500px' }}
                                    center={posicion}
                                    zoom={5}
                                    options={opciones}
                                    onLoad={onLoad}
                                    onUnmount={onUnmount}
                                    onClick={clickMapa}
                                >
                                    <Marker position={markPosicion}/>
                                </GoogleMap>

                            </div>
                            
                            <FontAwesomeIcon icon={faLocationDot} style={{ color: 'green' }} /> {ubicacion.ubicacion}

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
                            Imágenes: {form.imgTotal} de 10
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

                <Button className="filtros-botones" size="sm" onClick={() => { vistaAlojamientos('principal') }}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Volver
                </Button>
                &nbsp;&nbsp;
                <Button type="submit" className="crear-botones" size="sm" id="crear-alojamiento">
                    <FontAwesomeIcon icon={faHouse} /> Crear alojamiento
                </Button>

            </Form>
        </div>
    );
}

export default CrearAlojamiento;