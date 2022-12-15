import React, { useState, useEffect } from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faStar } from '@fortawesome/free-solid-svg-icons';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { crearAlerta } from "../Toast/Toast";

const ValorarModal = ({ infoAlojamiento, funcionCerrar, valoracionCorrecto }) => {

    const [imgAlojamiento, setImgAlojamiento] = useState();

    const obtenerImagenAlojamiento = async () => {
        if(infoAlojamiento === null) {
            return;
        }

        const imagen = await fetch('/alojamiento/imagen/' +infoAlojamiento.alojamientoID+ '-0', { 
            method: 'GET',
    
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if(imagen.status === 200) {
            setImgAlojamiento(imagen.url)
        }
    };

    useEffect(() => {
        obtenerImagenAlojamiento();

    }, [infoAlojamiento]);

    const [valoraciones, setValoraciones] = useState({
        llegada: 0.0,
        veracidad: 0.0,
        comunicacion: 0.0,
        ubicacion: 0.0,
        limpieza: 0.0,
        calidad: 0.0
    });

    if(infoAlojamiento === null) {
        return <></>;
    }

    //

    const cambiosValoracion = (e) => {
        const elementId = e.target.id;
        setValoraciones({ ...valoraciones, [elementId]: e.target.value, });
    };

    const enviarValoracion = async (e) => {
        e.preventDefault();

        //

        const mensaje = document.getElementById('mensaje').value;

        if(mensaje.length < 25) {
            return crearAlerta('error', '¡El mensaje es demasiado corto!');
        }

        const btnDesactivar = document.getElementById('valoracion-btn');
        btnDesactivar.disabled = true;

        //

        const data = await fetch('/perfil/valorar/alojamiento', {
            method: 'POST',
            body: JSON.stringify({
                reservaID:  infoAlojamiento.reservaID,
                alojamientoID: infoAlojamiento.alojamientoID,
                mensaje: mensaje,
                llegada: valoraciones.llegada,
                veracidad: valoraciones.veracidad,
                comunicacion: valoraciones.comunicacion,
                ubicacion: valoraciones.ubicacion,
                limpieza: valoraciones.limpieza,
                calidad: valoraciones.calidad,
                vecesValorado: infoAlojamiento.vecesValorado,
                valoracionMedia: infoAlojamiento.valoracionMedia,
            }),
            
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();
        btnDesactivar.disabled = false;

        if(items.respuesta === 'err_user') {

        } else if(items.respuesta === 'err_db') {

        } else if(items.respuesta === 'correcto') {
            valoracionCorrecto(infoAlojamiento.index, items.userValoracion);
        }
    };

    return (
        <Modal fullscreen={true} show={infoAlojamiento} onHide={funcionCerrar}>

            <Modal.Header closeButton>
                <Modal.Title>Valora tu estancia</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="container-fluid">

                    <div className="row">

                        <div className="col-sm-4 mb-3">
                            <h5 style={{ fontWeight: 'bold' }}>
                                Alojamiento:
                            </h5>

                            <hr />

                            <img
                                className='img-fluid'
                                src={imgAlojamiento} />

                            <br />

                            <FontAwesomeIcon icon={faLocationDot} style={{ color: 'green' }} /> {infoAlojamiento.ubicacion}
                            <br />
                            <FontAwesomeIcon icon={faStar} /> {infoAlojamiento.valoracionMedia} <span className="text-muted">({infoAlojamiento.vecesValorado})</span>

                        </div>
                        <div className="col-sm-2">
                        </div>

                        <div className="col">
                            <h5 style={{ fontWeight: 'bold' }}>
                                Valoración:
                            </h5>

                            <hr />

                            <Form onSubmit={enviarValoracion}>

                                <Form.Group>
                                    <Form.Label>
                                        Llegada
                                    </Form.Label>

                                    <span style={{ float: 'right' }}>
                                        {valoraciones.llegada} <FontAwesomeIcon icon={faStar} />
                                    </span>

                                    <Form.Range id="llegada" min="0" max="5" step="0.1" value={valoraciones.llegada} onChange={cambiosValoracion} />
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label>
                                        Veracidad
                                    </Form.Label>

                                    <span style={{ float: 'right' }}>
                                        {valoraciones.veracidad} <FontAwesomeIcon icon={faStar} />
                                    </span>

                                    <Form.Range id="veracidad" min="0" max="5" step="0.1" value={valoraciones.veracidad} onChange={cambiosValoracion} />
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label>Comunicación</Form.Label>

                                    <span style={{ float: 'right' }}>
                                        {valoraciones.comunicacion} <FontAwesomeIcon icon={faStar} />
                                    </span>
                                    <Form.Range id="comunicacion" min="0" max="5" step="0.1" value={valoraciones.comunicacion} onChange={cambiosValoracion} />
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label>Ubicación</Form.Label>

                                    <span style={{ float: 'right' }}>
                                        {valoraciones.ubicacion} <FontAwesomeIcon icon={faStar} />
                                    </span>
                                    <Form.Range id="ubicacion" min="0" max="5" step="0.1" value={valoraciones.ubicacion} onChange={cambiosValoracion} />
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label>Limpieza</Form.Label>

                                    <span style={{ float: 'right' }}>
                                        {valoraciones.limpieza} <FontAwesomeIcon icon={faStar} />
                                    </span>
                                    <Form.Range id="limpieza" min="0" max="5" step="0.1" value={valoraciones.limpieza} onChange={cambiosValoracion} />
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label>Calidad</Form.Label>

                                    <span style={{ float: 'right' }}>
                                        {valoraciones.calidad} <FontAwesomeIcon icon={faStar} />
                                    </span>
                                    <Form.Range id="calidad" min="0" max="5" step="0.1" value={valoraciones.calidad} onChange={cambiosValoracion} />
                                </Form.Group>

                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Mensaje:
                                    </Form.Label>

                                    <Form.Control
                                        id="mensaje"
                                        as="textarea"
                                        placeholder="Escribe cómo fue tu estancia" />
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button type="submit" variant="success" id="valoracion-btn">
                                        Enviar valoración
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>

            </Modal.Body>
        </Modal>
    );
}

export default ValorarModal;