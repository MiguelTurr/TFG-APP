import React, { useState } from "react";

import { crearAlerta } from '../Toast/Toast.js';
import { esNumero } from '../../resources/regex.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

function CrearAlojamiento({ show, vistaAlojamientos }) {  

    const [form, setForm] = useState({
        titulo: '',
        descripcion: '',
        precio: '',

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

        ubicacion: '',
        lat: 0.0,
        long: 0.0,

        imagenes: undefined,
        imgTotal: 0,
    });

    const [ formErrors, setformErrors ] = useState({});
    const [ imagenPreview, setImagenPreview ] = useState([]);

    const cambiosForm = (event, tipo=undefined) => {

        const elementId = event.target.id;
        const elementValue = (tipo === undefined) ? event.target.value : event.target.checked;

        setForm({...form, [elementId]: elementValue, });
        
        if(!!formErrors[elementId]) {
            setformErrors({...formErrors, [elementId]: null});
        }
    };

    const addImagenes = (e) => {

        const len = e.target.files.length;

        setForm({...form, imagenes: e.target.files, imgTotal: len });

        var array = [];
        for(var i = 0; i < len; i++) {
            array.push(URL.createObjectURL(e.target.files[i]));
        }
        setImagenPreview(array);
        
        if(!!formErrors.imagenes) {
            setformErrors({...formErrors, imagenes: null});
        }
    };

    const removeImagen = (e) => {
        console.log(e.target)
    };

    const erroresForm = () => {
        const erroresEncontrados = {};

        if(!form.titulo || form.titulo === '') erroresEncontrados.titulo = '¡Debe tener un título!';
        else if(form.titulo > 70) erroresEncontrados.titulo = '¡El título es demasiado largo!';

        if(!form.descripcion || form.descripcion === '') erroresEncontrados.descripcion = '¡Debe tener una descripción!';
        else if(form.descripcion > 800) erroresEncontrados.descripcion = '¡La descripción es demasiada larga!';

        if(!form.precio || form.precio === '') erroresEncontrados.precio = '¡Debes poner un precio!';
        else if(!esNumero.test(form.precio)) erroresEncontrados.precio = '¡Debes poner un número!';
        else if(parseInt(form.precio) < 10) erroresEncontrados.precio = '¡El precio mínimo son 10€!';

        if(!form.viajeros || form.viajeros === ''
        || !esNumero.test(form.viajeros) || parseInt(form.viajeros) < 1) erroresEncontrados.viajeros = '¡Mínimo uno!';

        if(!form.habitaciones || form.habitaciones === ''
        || !esNumero.test(form.habitaciones) || parseInt(form.habitaciones) < 1) erroresEncontrados.habitaciones = '¡Mínimo una!';

        if(!form.camas || form.camas === ''
        || !esNumero.test(form.camas) || parseInt(form.camas) < 1) erroresEncontrados.camas = '¡Mínimo una!';

        if(!form.aseos || form.aseos === ''
        || !esNumero.test(form.aseos) || parseInt(form.aseos) < 1) erroresEncontrados.aseos = '¡Mínimo uno!';

        if(!form.ubicacion || form.ubicacion === '') erroresEncontrados.ubicacion = '¡Debes poner una ubicación!';

        if(form.imagenes === undefined) erroresEncontrados.imagenes = '¡Debes añadir al menos una imagen!';
        else {
            const len = form.imagenes.length;

            if(len === 0) erroresEncontrados.imagenes = '¡Debes añadir al menos una imagen!';
            else if(len > 5) erroresEncontrados.imagenes = '¡Sólo puedes subir 5 imágenes!';
            else {
                
                const maxSize = 2 * 1024 * 1024;

                for(var i = 0; i < len; i++) {
                    if(!['image/jpeg', 'image/png'].includes(form.imagenes[i].type)) {
                        erroresEncontrados.imagenes = '¡Una imagen no tiene el formato correcto!';
                        break;
                    }
        
                    if(form.imagenes[i].size > maxSize) {
                        erroresEncontrados.imagenes = '¡El tamaño máximo por imagen es de 2 MB!';
                        break;
                    }
                }
            }
        }

        return erroresEncontrados;
    };

    const crearNuevoAlojamiento = async (e) => {
        e.preventDefault();

        //

        const comprobarErrores = erroresForm();

        if(Object.keys(comprobarErrores).length > 0) {

            window.scrollTo(0, 0);

            crearAlerta('error', '¡Hay errores en el formulario!');

            setformErrors(comprobarErrores);
            return;
        }

        const btnDesactivar = document.getElementById('crear-alojamiento');
        btnDesactivar.disabled = true;

        var formData = new FormData();

        Object.keys(form).map((x) => {
            if(x === 'imagenes') {
                return;
            }
            formData.append(x, form[x]);
        });

        const len = form.imagenes.length;

        for(var i = 0; i < len; i++) {
            formData.append('imagen', form.imagenes[i]);
        }

        //

        const data = await fetch('/perfil/misalojamientos/crear', {
            method: 'POST',
            body: formData,
        });

        const items = await data.json();
        btnDesactivar.disabled = false;

        if(items.respuesta === 'err_user') {
            crearAlerta('error', '¡Ha ocurrido un error con el usuario!');

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {

            crearAlerta('exito', '¡Has creado un nuevo alojamiento!');

            //vistaAlojamientos(false);
        }
    };

    return(<>
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
                                isInvalid={!!formErrors.titulo}/>

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
                                isInvalid={!!formErrors.descripcion}/>

                            <Form.Control.Feedback type="invalid">
                                {formErrors.descripcion}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="precio">Precio</Form.Label>
                            <Form.Control 
                                type="text" 
                                id="precio"
                                size="sm" 
                                placeholder="Escribe el precio por noche"
                                value={form.precio}
                                onChange={cambiosForm}
                                isInvalid={!!formErrors.precio}/>

                            <Form.Control.Feedback type="invalid">
                                {formErrors.precio}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Row>
                                <Col>
                                    <Form.Label htmlFor="viajeros">Viajeros</Form.Label>
                                    <Form.Control 
                                        type="text"
                                        id="viajeros"
                                        placeholder="Escribe una cantidad" 
                                        value={form.viajeros}
                                        onChange={cambiosForm}
                                        size="sm" 
                                        isInvalid={!!formErrors.viajeros}/>
                                        
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.viajeros}
                                    </Form.Control.Feedback>
                                </Col>
                                <Col>
                                
                                    <Form.Label htmlFor="habitaciones">Habitaciones</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        id="habitaciones"
                                        placeholder="Escribe una cantidad" 
                                        value={form.habitaciones}
                                        onChange={cambiosForm}
                                        size="sm"
                                        isInvalid={!!formErrors.habitaciones}/>

                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.habitaciones}
                                    </Form.Control.Feedback>
                                </Col>
                            </Row>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Row>
                                <Col>
                                    <Form.Label htmlFor="camas">Camas</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="camas"
                                        placeholder="Escribe una cantidad"
                                        value={form.camas}
                                        onChange={cambiosForm}
                                        size="sm"
                                        isInvalid={!!formErrors.camas} />

                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.camas}
                                    </Form.Control.Feedback>
                                </Col>
                                <Col>

                                    <Form.Label htmlFor="aseos">Baños</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="aseos"
                                        placeholder="Escribe una cantidad"
                                        value={form.aseos}
                                        onChange={cambiosForm}
                                        size="sm"
                                        isInvalid={!!formErrors.aseos} />

                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.aseos}
                                    </Form.Control.Feedback>
                                </Col>
                            </Row>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Row>
                                <Col>
                                    <Form.Label htmlFor="horaEntrada">Hora entrada</Form.Label>
                                    <Form.Control 
                                        id="horaEntrada"
                                        type="time" 
                                        size="sm" 
                                        value={form.horaEntrada}
                                        onChange={cambiosForm}/>
                                </Col>
                                <Col>
                                    <Form.Label htmlFor="horaSalida">Hora salida</Form.Label>
                                    <Form.Control 
                                        id="horaSalida"
                                        type="time" 
                                        size="sm" 
                                        value={form.horaSalida}
                                        onChange={cambiosForm}/>
                                </Col>
                            </Row>
                        </Form.Group>

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
                            <Form.Control 
                                type="text"
                                id="ubicacion"
                                size="sm" 
                                placeholder="Escribe el lugar del alojamiento"
                                value={form.ubicacion}
                                onChange={cambiosForm}
                                isInvalid={!!formErrors.ubicacion}/>

                            <Form.Control.Feedback type="invalid">
                                {formErrors.ubicacion}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <hr/>

                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="mod-password-2">Imágenes</Form.Label>
                            <Form.Control 
                                type="file"
                                id="prueba"
                                size="sm" 
                                accept="image/*" 
                                onChange={addImagenes}
                                isInvalid={!!formErrors.imagenes}
                                multiple/>

                            <Form.Control.Feedback type="invalid">
                                {formErrors.imagenes}
                            </Form.Control.Feedback>

                            <Form.Text className="text-muted">
                                Formatos aceptados ( .png / .jpg )
                            </Form.Text>
                        </Form.Group>

                        <hr/>

                        <div className="row">

                            {
                                imagenPreview.map((x, index) => (
                                    
                                    <div className="col" key={index}>
                                        <img className="img-fluid" src={x}/>
                                    </div>
                                ))
                            }
                        </div>

                    </div>

                </div>

                <hr/>

                <Button className="filtros-botones" size="sm" onClick={ () => { vistaAlojamientos(false) }}>
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