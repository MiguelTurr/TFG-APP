import React, { useState, useEffect } from "react";
import { crearAlerta } from "../Toast/Toast";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faStar, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

import NoProfileImg from '../../img/no-profile-img.png';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

function ValorarModalInquilino({ infoHuesped, funcionCerrar, valoracionCorrecto }) {

    const [imgAlojamiento, setImgAlojamiento] = useState();
    const [imgHuesped, setImgHuesped] = useState(NoProfileImg);

    const obtenerImagenAlojamiento = async () => {
        if(infoHuesped === null) {
            return;
        }

        const imagen = await fetch('/alojamiento/imagen/' +infoHuesped.alojamientoID+ '-0', { 
            method: 'GET',
    
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if(imagen.status === 200) {
            setImgAlojamiento(imagen.url)
        }
    };

    const obtenerImagenHuesped = async (userId) => {
        if(infoHuesped === null) {
            return;
        }

        const imagen = await fetch('/alojamiento/imagen/hospedador/' +infoHuesped.usuarioID, { method: 'GET' });

        if(imagen.status === 200) {
            setImgHuesped(imagen.url);
        }
    };

    useEffect(() => {
        obtenerImagenAlojamiento();
        obtenerImagenHuesped();
        setTipoValoracion(null);

    }, [infoHuesped]);

    const [tipoValoracion, setTipoValoracion] = useState(null);

    if(infoHuesped === null) {
        return <></>;
    }

    const regFecha = { year: 'numeric', month: 'long' };

    const enviarValoracion = async (e) => {
        e.preventDefault();

        const mensaje = document.getElementById('huesped-mensaje').value;

        if(mensaje.length < 25) {
            return crearAlerta('error', '¡El mensaje es demasiado corto!');
        }

        if(tipoValoracion === null) {
            return crearAlerta('error', '¡Selecciona un tipo de valoración!');
        }

        //

        const btnDesactivar = document.getElementById('huesped-valoracion');
        btnDesactivar.disabled = true;

        const data = await fetch('/usuario/valorar/', {
            method: 'POST',
            
            body: JSON.stringify({
                reservaID:  infoHuesped.reservaID,
                usuarioID: infoHuesped.usuarioID,
                mensaje: mensaje,
                tipo: tipoValoracion,
            }),
            
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();
        btnDesactivar.disabled = false;

        if(items.respuesta === 'err_user') {
            crearAlerta('error', '¡Ha ocurrido un error con el usuario!');

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {
            valoracionCorrecto(infoHuesped.index, items.userValoracion);
        }
    };

    const cambiarValoracion = (e) => {
        const element = e.target.id;
        const valoracion = tipoValoracion;

        setTipoValoracion(element === 'val-positiva' ? 'Positiva' : 'Negativa');
    };

    //

    return (
        <Modal fullscreen={true} show={infoHuesped} onHide={funcionCerrar}>

            <Modal.Header closeButton>
                <Modal.Title>Valora tu huésped</Modal.Title>
            </Modal.Header>
            
            <Modal.Body>
                <div className="container-fluid">

                    <div className="row">

                        <div className="col-sm-4 mb-3">
                            
                            <h5 style={{ fontWeight: 'bold' }}>
                                Huésped:
                            </h5>
                            
                            <hr />

                            <table className="table">

                                <tbody>
                                    <tr style={{ verticalAlign: 'middle', borderBottom: 'transparent' }}>
                                        <td style={{ width: '25%' }}>

                                            <img src={imgHuesped} key={imgHuesped} className="img-fluid rounded-pill" alt="Imagen de perfil del usuario"/>
                                        </td>
                                        <td></td>
                                        <td>
                                            <span style={{ fontSize: '17px' }}>
                                                {infoHuesped.nombre} de {infoHuesped.residencia} 
                                            </span>
                                            <br/>
                                            <small>
                                                Registrado en {new Date(infoHuesped.fechaReg).toLocaleDateString('es-ES', regFecha)}
                                            </small>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <hr />

                            <h5 style={{ fontWeight: 'bold' }}>
                                Alojamiento:
                            </h5>
                            
                            <hr />

                            <img
                                className='img-fluid'
                                src={imgAlojamiento} />

                            <br />

                            <FontAwesomeIcon icon={faLocationDot} style={{ color: 'green' }} /> {infoHuesped.ubicacion}
                            <br />
                            <FontAwesomeIcon icon={faStar} /> {infoHuesped.valoracionMedia} <span className="text-muted">({infoHuesped.vecesValorado})</span>

                        </div>

                        <div className="col-sm-1">
                        </div>

                        <div className="col">
                            <h5 style={{ fontWeight: 'bold' }}>
                                Valoración:
                            </h5>

                            <hr />

                            <Form onSubmit={enviarValoracion}>

                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Tipo:
                                    </Form.Label>

                                    <br/>

                                    <Button style={ tipoValoracion === false ? { opacity: '0.2' } : {}} className="crear-botones" id="val-positiva" onClick={cambiarValoracion}>
                                        Positiva
                                    </Button>

                                    &nbsp;&nbsp;

                                    <Button style={ tipoValoracion === true ? { opacity: '0.2' } : {}} className="borrar-botones" id="val-negativa" onClick={cambiarValoracion}>
                                        Negativa
                                    </Button>

                                </Form.Group>

                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Mensaje:
                                    </Form.Label>

                                    <Form.Control
                                        id="huesped-mensaje"
                                        as="textarea"
                                        maxLength="300"
                                        placeholder="Escribe cómo dejó el alojamiento" />
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button type="submit" className="crear-botones" id="huesped-valoracion">
                                        <FontAwesomeIcon icon={faPaperPlane} /> Enviar valoración
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

export default ValorarModalInquilino;