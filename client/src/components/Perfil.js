import React, { useEffect, useState } from "react";

import '../css/Perfil.css';
import NoProfileImg from '../img/no-profile-img.png';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";
import Form from 'react-bootstrap/Form';

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

        const imagen = await fetch('/perfil/foto', { method: 'GET' });

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
                modId: opcionId,
                titulo: 'Teléfono',
                anterior: userInfo.telefono,
                prefix: userInfo.telefono.split(' ')[0],
                modificado: false
            }

        } else if(opcionId === 'residencia') {

            opciones = {
                modId: opcionId,
                titulo: 'Residencia',
                anterior: userInfo.residencia,
                modificado: false
            }

        } else if(opcionId === 'presentacion') {

            opciones = {
                modId: opcionId,
                titulo: 'Sobre ti',
                anterior: userInfo.presentacion.substring(0, 15)+ '...',
                modificado: false
            }

        } else if(opcionId === 'email') {

            opciones = {
                modId: opcionId,
                titulo: 'Email',
                anterior: userInfo.email,
                modificado: false
            }
        } else if(opcionId === 'password') {

            opciones = {
                modId: opcionId,
                titulo: 'Contraseña',
                anterior: '*********',
                modificado: false
            }
        }

        setModDatos(opciones);
    };

    useEffect(() => {
        if(cambiarDatos == true && modDatos.modificado == false) {
            var element = document.getElementById('mod-' +modDatos.modId);
            element.addEventListener("keyup", function() { setModDatos({ ...modDatos, modificado: true }); });
        }
    });

    const enviarDatoModificado = async (event) => {
        event.preventDefault();

        const editado = document.getElementById('mod-' +modDatos.modId).value;
        if(editado == '') {
            alert('Debes escribir algo primero');
            return;
        }

        const password = document.getElementById('mod-password-2').value;
        if(password == '') {
            alert('Debes escribir tu contraseña');
            return;
        }

        var datoEditado = editado;

        if(modDatos.modId === 'telefono') {
            datoEditado = modDatos.prefix+ ' ' +editado;
        }

        const data = await fetch('/perfil/editar', {
            method: 'POST',
            body: JSON.stringify({
                editado: datoEditado,
                password: password,
                tipo: modDatos.modId,
            }),
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();

        if(items.respuesta == 'err_user') {
            alert('Ha ocurrido un error');

        } else if(items.respuesta == 'err_db') {
            alert('ERROR DB');

        } else if(items.respuesta == 'err_datos') {
            alert('ERROR datos');

        } else if(items.respuesta == 'correcto') {
            alert('Se ha actualizado tus datos');

            const editado = document.getElementById('mod-' +modDatos.modId).value;

            if(modDatos.modId === 'telefono') {
                setUserInfo({ ...userInfo, telefono: modDatos.prefix+ ' ' +editado });
    
            } else if(modDatos.modId === 'residencia') {
                setUserInfo({ ...userInfo, residencia: editado });
    
            } else if(modDatos.modId === 'presentacion') {
                setUserInfo({ ...userInfo, presentacion: editado });
    
            } else if(modDatos.modId === 'email') {
                setUserInfo({ ...userInfo, email: editado });
            }

            setCambiarDatos(false);
        }
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
                            <tr className="tabla-seleccion" onClick={() => { modificarOpcion('email') }}>
                                <td>
                                    Correo electrónico:
                                    <br/>
                                    <small>{userInfo.email}</small>
                                </td>
                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>
                            <tr className="tabla-seleccion" onClick={() => { modificarOpcion('password') }}>
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

                    {cambiarDatos == true && 
                        <div className="col-sm-6 text-center mx-auto">
                            <h5>
                                {modDatos.titulo}: <span className="resaltar-titulo">{modDatos.anterior}</span>
                            </h5>

                            <hr/>

                            <Form onSubmit={enviarDatoModificado}>

                                <Form.Group className="mb-3" style={modDatos.modId == 'telefono' ? {} : { display: 'none' }} >
                                    <div className="input-group mb-3">
                                        <span className="input-group-text">{modDatos.prefix}</span>
                                        <Form.Control type="number" placeholder="Nuevo teléfono" id="mod-telefono"/>
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-3" style={modDatos.modId == 'residencia' ? {} : { display: 'none' }} >
                                    <Form.Control type="text" placeholder="Nueva residencia" id="mod-residencia" />
                                </Form.Group>

                                <Form.Group className="mb-3" style={modDatos.modId == 'presentacion' ? {} : { display: 'none' }} >
                                    <Form.Control as="textarea" placeholder="Escribe aquí algo sobre ti" id="mod-presentacion"/>
                                </Form.Group>

                                <Form.Group className="mb-3" style={modDatos.modId == 'email' ? {} : { display: 'none' }} >
                                    <Form.Control type="email" placeholder="Nuevo correo" id="mod-email" />
                                </Form.Group>

                                <Form.Group className="mb-3" style={modDatos.modId == 'password' ? {} : { display: 'none' }} >
                                    <Form.Control type="password" placeholder="Nueva contraseña" id="mod-password" />
                                </Form.Group>

                                <Form.Group className="mb-3" style={modDatos.modificado == true ? {} : { display: 'none' }}>
                                    <Form.Label htmlFor="mod-password-2">Valida tu contraseña</Form.Label>
                                    <Form.Control type="password" placeholder="Escribe contraseña" id="mod-password-2" />
                                </Form.Group>
                            
                                <div className="d-grid gap-2">
                                    <Button type="submit" className="filtros-botones" size="sm">
                                        Modificar
                                    </Button>
                                </div>

                            </Form>
                        </div>
                    }
                </div>

            </div>
        </div>
    );
}

export default Perfil;