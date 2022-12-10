import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { crearAlerta } from '../Toast/Toast.js';
import NoProfileImg from '../../img/no-profile-img.png';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

import Modal from 'react-bootstrap/Modal';

function ValoracionesModal({ mostrar, funcionCerrar }) {

    const location = useLocation();
    const params = new URLSearchParams(location.search);

    //

    var regFecha = { year: 'numeric', month: 'long' };

    //

    const [valoraciones, setValoraciones] = useState([]);
    const [valoracionesImg, setValoracionesImg] = useState([]);

    useEffect(() => {
        obtenerValoraciones();
    }, []);

    const obtenerValoraciones = async () => {
        const data = await fetch('/alojamiento/comentarios/' +params.get('casa'), {
            method: 'GET',

            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if (items.respuesta === 'correcto') {
            setValoraciones(items.valoraciones);
            
            var len = items.valoraciones.length;
            var arrayPerfiles = [];

            for(var i = 0; i < len; i++) {

                const perfil = await fetch('/alojamiento/hospedador/foto/' +items.valoraciones[i].usuarioId, { method: 'GET' });

                if(perfil.status === 200) {
                    arrayPerfiles.push(perfil.url);

                } else {
                    arrayPerfiles.push(NoProfileImg);
                }
            }
            setValoracionesImg(arrayPerfiles);
        }
    };

    //

    const verPerfilUsuario = (e, index) => {
        window.location.href = '/usuario/ver/' +valoraciones[index].usuarioId;
    };

    return (
        <Modal fullscreen={true} show={mostrar} onHide={funcionCerrar}>

            <Modal.Header closeButton>
                <Modal.Title>
                    <FontAwesomeIcon icon={faStar} /> {valoraciones.length} reseñas
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="container-fluid">

                    <div className="row">
                        <div className="col">

                            <ul className="lista-sin-numeros">
                            {
                                valoraciones.map((x, index) => (

                                    <li key={index}>
                                        <span style={{ fontWeight: 'bold' }}>
                                            <small className="text-muted">
                                                {new Date(x.creadaEn).toLocaleDateString('es-ES', regFecha)}
                                            </small>
                                        </span>

                                        <br/>
                                        <br/>
                                        {x.mensaje}

                                        <br/>
                                        <br/>
                                        <div className="row">
                                            <div className="col-sm-1">
                                                
                                                <img 
                                                    style={{ cursor: 'pointer' }}
                                                    src={valoracionesImg[index]} 
                                                    key={valoracionesImg[index]} 
                                                    className="img-fluid rounded-pill" 
                                                    alt="Imagen de perfil del usuario"
                                                    onClick={e => { verPerfilUsuario(e, index) }}/>
                                            </div>
                                            <div className="col">

                                                <strong>
                                                    {x.nombre} de {x.residencia}
                                                </strong>
                                                <br/>
                                                <small>
                                                    {new Date(x.fechaReg).toLocaleDateString('es-ES', regFecha)}
                                                </small>
                                            </div>
                                        </div>

                                        <hr/>
                                    </li>
                                ))
                            }
                            </ul>
                        </div>
                    </div>
                </div>

            </Modal.Body>
        </Modal>
    );
}

export default ValoracionesModal;