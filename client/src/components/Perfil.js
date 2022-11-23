import React, { useEffect, useState } from "react";

import '../css/Perfil.css';
import NoProfileImg from '../img/no-profile-img.png';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";

function Perfil() {

    // CARGAR PERFIL INFO

    var nacOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    var regOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }

    const [userInfo, setUserInfo] = useState([]);
    const [userImg, setUserImg] = useState(NoProfileImg);

    const perfilInfo = async () => {

        const data = await fetch('/perfil', { 
            method: 'GET',
            
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();
        setUserInfo(items);
    };

    const cargarImagenPerfil = async () => {

        const imagen = await fetch('/perfil/foto', { 
            method: 'GET',
            
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if(imagen.status == 200) {
            setUserImg(imagen.url);
        }
    };

    useEffect(() => {
        perfilInfo();
        cargarImagenPerfil();
    }, []);

    // CAMBIAR VISTAS

    const [vistaPerfil, setPerfilVista] = useState(0);
    const cambiarVistaPerfil = (vistaId) => {
        if(vistaPerfil == vistaId) {
            return;
        }

        var addClass = document.getElementById('vista-'+vistaId);
        var removeClass = document.getElementById('vista-'+vistaPerfil);

        addClass.classList.add('btn-activo');
        removeClass.classList.remove('btn-activo');

        setPerfilVista(vistaId);
    };

    // MODIFICAR DATOS

    const [cambiarDatos, setCambiarDatos] = useState(false);
    const [modDatos, setModDatos] = useState({});

    const volverPerfil = () => {
        setCambiarDatos(false);
    };

    const modificarOpcion = (opcionId) => {
        setCambiarDatos(true);

        var opciones;

        if(opcionId === 'telefono') {

            opciones = {
                titulo: 'Editando: ',
            }

        } else if(opcionId === 'residencia') {

            opciones = {
                titulo: 'Editando: ',
            }

        } else if(opcionId === 'presentacion') {
            opciones = {
                titulo: '<h1>Editando: </h1>',
            }
        }

        setModDatos(opciones);
    };

    //

    return (

        <div className="container-fluid">

            <div className="row">

                {cambiarDatos == false && <div className="col">
                    <button className="btn-no-style btn-activo" onClick={() => { cambiarVistaPerfil(0) }} id="vista-0">
                        Información personal
                    </button>
                    
                    <span className="vista-separador">/</span>

                    <button className="btn-no-style" onClick={() => { cambiarVistaPerfil(1) }} id="vista-1">
                        Información cuenta
                    </button>
                    
                    <span className="vista-separador">/</span>

                    <button className="btn-no-style">
                        Eliminar cuenta
                    </button>

                </div>}

                {cambiarDatos == true && <div className="col">
                    
                    <Button className="filtros-botones" size="sm" onClick={() => { volverPerfil() }} id="btn-volver">
                        <FontAwesomeIcon icon={faArrowLeft} /> Volver
                    </Button>
                </div>}

            </div>

            <hr/>

            <div className="row">
                
                <div className="col">

                    {cambiarDatos == false && vistaPerfil == 0 && <> <table className="table">
                        <tbody>
                            <tr>
                                <td>
                                    Nombre y apellidos:
                                    <br/>
                                    <small>{userInfo.nombre} {userInfo.apellidos}</small>
                                </td>
                                <td>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Fecha Nacimiento:
                                    <br/>
                                    <small>{new Date(userInfo.fechaNac).toLocaleDateString('es-ES', nacOptions)}</small>
                                </td>
                                <td>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Género:
                                    <br/>
                                    <small>{userInfo.genero}</small>
                                </td>
                                <td>
                                </td>
                            </tr>
                            <tr className="tabla-seleccion" onClick={() => { modificarOpcion('telefono') }}>
                                <td>
                                    Teléfono:
                                    <br/>
                                    <small>{userInfo.telefono}</small>
                                </td>
                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>
                            <tr className="tabla-seleccion" onClick={() => { modificarOpcion('residencia') }}>
                                <td>
                                    Residencia:
                                    <br/>
                                    <small>{userInfo.residencia}</small>
                                </td>

                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>
                            <tr className="tabla-seleccion" onClick={() => { modificarOpcion('presentacion') }}>
                                <td>
                                    Sobre ti:
                                    <br/>
                                    <small>{userInfo.presentacion}</small>
                                </td>

                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>

                        </tbody>
                    </table>
                    </>}

                    {cambiarDatos == false && vistaPerfil == 1 && <> <table className="table">
                        <tbody>
                            <tr>
                                <td>
                                    Fecha Registro:
                                    <br/>
                                    <small>{new Date(userInfo.fechaReg).toLocaleDateString('es-ES', regOptions)}</small>
                                </td>
                                <td>
                                </td>
                            </tr>
                            <tr className="tabla-seleccion">
                                <td>
                                    Correo electrónico:
                                    <br/>
                                    <small>{userInfo.email}</small>
                                </td>
                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>
                            <tr className="tabla-seleccion">
                                <td>
                                    Contraseña:
                                    <br/>
                                    <small>*********</small>
                                </td>
                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>
                            <tr className="tabla-seleccion">
                                <td>
                                    Foto de perfil:
                                    <br/>
                                    <img src={userImg} className="img-fluid" width="5%" alt="Imagen de perfil del usuario"></img>
                                </td>
                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>

                        </tbody>
                    </table>
                    </>}

                    {()=> {
                        if(cambiarDatos == true) return (<>AA {modDatos.titulo}</>)}
                    }
                </div>

            </div>
        </div>
    );
}

export default Perfil;