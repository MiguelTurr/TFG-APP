import React from "react";

import { useParams } from "react-router-dom";
import { useEffect, useState } from 'react';

import NoProfileImg from '../../img/no-profile-img.png';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faHouse, faLanguage, faBriefcase, faWarning } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";

function PerfilPublico() {

    var regFecha = { year: 'numeric', month: 'long' };

    const { id } = useParams();

    //

    const [infoPerfil, setInfoPerfil] = useState({ nombre: 'Nadie' });
    const [imgPerfil, setImgPerfil] = useState(NoProfileImg);

    useEffect(() => {
        obtenerInfoPerfil();
        cargarImagenPerfil();
    }, []);

    const obtenerInfoPerfil = async () => {

        const data = await fetch('/usuario/ver/' + id, {
            method: 'GET',

            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();

        if (items.respuesta === 'err_db') {

        } else if (items.respuesta === 'err_datos') {

        } else if (items.respuesta === 'correcto') {
            setInfoPerfil(items.user[0]);
        }
    };

    const cargarImagenPerfil = async () => {

        const imagen = await fetch('/alojamiento/hospedador/foto/' + id, { method: 'GET' });

        if (imagen.status === 200) {
            setImgPerfil(imagen.url);
        }
    };

    //

    const denunciarPerfil = () => {

    };

    return (
        <div className="container-fluid mt-4 mb-5" style={{ paddingLeft: '30px', paddingRight: '30px' }}>

            <div className="row mb-3">

                <div className="col-sm-2">
                    <img src={imgPerfil} key={imgPerfil} className="img-fluid rounded-pill" alt="Imagen de perfil del usuario"></img>

                    <hr/>

                    <ul className="lista-sin-numeros">

                        <li style={{ fontSize: '17px', marginBottom: '5px' }}>
                            <FontAwesomeIcon icon={faCheck} /> Identidad
                        </li>

                        <li style={{ fontSize: '17px', marginBottom: '5px' }}>
                            <FontAwesomeIcon icon={faCheck} /> Número de teléfono
                        </li>

                        <li style={{ fontSize: '17px', marginBottom: '5px' }}>
                            <FontAwesomeIcon icon={faCheck} /> Correo electrónico
                        </li>
                    </ul>

                </div>

                <div className="col" style={{ marginLeft: '100px' }}>
                    <span style={{ fontSize: '25px' }}>
                        Soy {infoPerfil.nombre} {infoPerfil.apellidos}
                    </span>

                    <br/>

                    <small>
                        Registrado en {new Date(infoPerfil.fechaReg).toLocaleDateString('es-ES', regFecha)}
                    </small>

                    <hr/>

                    <h3>
                        Sobre mi
                    </h3>

                    <div dangerouslySetInnerHTML={{ __html: infoPerfil.presentacion }} />

                    <hr/>

                    <ul className="lista-sin-numeros">

                        {infoPerfil.residencia !== '' &&   
                            <li style={{ marginBottom: '10px' }}>
                                <FontAwesomeIcon icon={faHouse} /> Reside en <strong>{infoPerfil.residencia}</strong>
                            </li>
                        }

                        {infoPerfil.idiomas !== '' &&

                            <li style={{ marginBottom: '10px' }}>
                                <FontAwesomeIcon icon={faLanguage} /> Habla <strong>{infoPerfil.idiomas}</strong>
                            </li>
                        }

                        {infoPerfil.trabajo !== '' &&

                            <li style={{ marginBottom: '10px' }}>
                                <FontAwesomeIcon icon={faBriefcase} /> Trabaja en <strong>{infoPerfil.trabajo}</strong>
                            </li>
                        }
                    </ul>

                </div>
            </div>

            <hr/>

            <div className="row mb-3">     

                <h3>
                    Alojamientos de {infoPerfil.nombre}
                </h3>

                <div className="col">
                </div>
            </div>

            <hr/>

            <div className="row mb-3">     

                <h3>
                    Valoraciones
                </h3>

                <div className="col">
                </div>
            </div>

            <hr/>
             
            <div className="row mb-3">     
                <div className="col text-center">    
                    <Button className="borrar-botones" size="sm" onClick={denunciarPerfil}>
                        <FontAwesomeIcon icon={faWarning} /> Denunciar este perfil
                    </Button>
                </div>
            </div>

        </div>
    );
}

export default PerfilPublico;