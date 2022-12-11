import React, { useEffect, useState } from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faStar } from '@fortawesome/free-solid-svg-icons';

import NoProfileImg from '../../img/no-profile-img.png';

import Modal from 'react-bootstrap/Modal';

const ValorarModal = ({ valoraciones, funcionCerrar }) => {

    const [imgAlojamiento, setImgAlojamiento] = useState();
    const [valoracionUser, setValoracionUser] = useState(null);
    const [imgUser, setImgUser] = useState(NoProfileImg);
    const [valoracionHospedador, setValoracionHospedador] = useState(null);
    const [imgHospedador, setImgHospedador] = useState(NoProfileImg);

    const obtenerImagenAlojamiento = async () => {
        if (valoraciones === null) {
            return;
        }

        const imagen = await fetch('/alojamiento/imagen/' + valoraciones.alojamientoID + '-0', {
            method: 'GET',

            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (imagen.status === 200) {
            setImgAlojamiento(imagen.url)
        }
    };

    useEffect(() => {
        obtenerImagenAlojamiento();
        obtenerValoracionUser();
        obtenerValoracionHospedador();

    }, [valoraciones]);

    const obtenerValoracionUser = async () => {

        if (valoraciones === null || valoraciones.userValoracion === -1) {
            setValoracionUser(null);
            return;
        }

        const data = await fetch('/perfil/valoracion-cliente/ver/' + valoraciones.userValoracion, { method: 'GET' });
        const items = await data.json();

        if (items.respuesta === 'correcto') {
            setValoracionUser(items.valoracion[0]);

            const perfil = await fetch('/alojamiento/hospedador/foto/' + items.valoracion[0].ID, { method: 'GET' });

            if (perfil.status === 200) {
                setImgUser(perfil.url);
            }
        }
    };

    const obtenerValoracionHospedador = async () => {

        if (valoraciones === null || valoraciones.hospedadorValoracion === -1) {
            setValoracionHospedador(null);
            return;
        }

        const data = await fetch('/perfil/valoracion-hospedador/ver/' + valoraciones.hospedadorValoracion, { method: 'GET' });
        const items = await data.json();

        if (items.respuesta === 'correcto') {
            setValoracionHospedador(items.valoracion[0]);

            const perfil = await fetch('/alojamiento/hospedador/foto/' + items.valoracion[0].ID, { method: 'GET' });

            if (perfil.status === 200) {
                setImgHospedador(perfil.url);
            }
        }
    };

    if (valoraciones === null) {
        return <></>;
    }

    const regFecha = { year: 'numeric', month: 'long' };

    return (
        <Modal fullscreen={true} show={valoraciones} onHide={funcionCerrar}>

            <Modal.Header closeButton>
                <Modal.Title>Valoraciones</Modal.Title>
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

                            <FontAwesomeIcon icon={faLocationDot} /> {valoraciones.ubicacion}
                            <br />
                            <FontAwesomeIcon icon={faStar} /> {valoraciones.valoracionMedia} <span className="text-muted">({valoraciones.vecesValorado})</span>

                        </div>
                        <div className="col-sm-2">
                        </div>

                        <div className="col">

                            <h5 style={{ fontWeight: 'bold' }}>
                                Valoración del usuario:
                            </h5>

                            <hr />

                            <div style={valoracionUser === null ? {} : { display: 'none' }}>
                                Todavía no ha escrito ninguna valoración.
                            </div>

                            <div style={valoracionUser !== null ? {} : { display: 'none' }}>
                                <span style={{ fontWeight: 'bold' }}>
                                    <small className="text-muted">
                                        {new Date(valoracionUser?.creadaEn).toLocaleDateString('es-ES', regFecha)}
                                    </small>
                                </span>

                                <br />
                                <br />
                                {valoracionUser?.mensaje}

                                <br />
                                <br />
                                <div className="row">
                                    <div className="col-sm-2">

                                        <img
                                            src={imgUser}
                                            key={imgUser}
                                            className="img-fluid rounded-pill"
                                            alt="Imagen de perfil del usuario" />
                                    </div>
                                    <div className="col">

                                        <strong>
                                            {valoracionUser?.nombre} de {valoracionUser?.residencia}
                                        </strong>
                                        <br />
                                        <small>
                                            {new Date(valoracionUser?.fechaReg).toLocaleDateString('es-ES', regFecha)}
                                        </small>
                                    </div>
                                </div>
                            </div>

                            <hr />

                            <h5 style={{ fontWeight: 'bold' }}>
                                Valoración del hospedador:
                            </h5>

                            <hr />

                            <div style={valoracionHospedador === null ? {} : { display: 'none' }}>
                                Todavía no ha escrito ninguna valoración.
                            </div>

                            <div style={valoracionHospedador !== null ? {} : { display: 'none' }}>

                            <span style={{ fontWeight: 'bold' }}>
                                    <small className="text-muted">
                                        {new Date(valoracionHospedador?.creadoEn).toLocaleDateString('es-ES', regFecha)}
                                    </small>
                                </span>

                                <br />
                                <br />
                                {valoracionHospedador?.mensaje}

                                <br />
                                <br />
                                <div className="row">
                                    <div className="col-sm-2">

                                        <img
                                            src={imgHospedador}
                                            key={imgHospedador}
                                            className="img-fluid rounded-pill"
                                            alt="Imagen de perfil del usuario" />
                                    </div>
                                    <div className="col">

                                        <strong>
                                            {valoracionHospedador?.nombre} de {valoracionHospedador?.residencia}
                                        </strong>
                                        <br />
                                        <small>
                                            {new Date(valoracionHospedador?.fechaReg).toLocaleDateString('es-ES', regFecha)}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </Modal.Body>
        </Modal>
    )
};

export default ValorarModal;