import React, { useEffect, useState } from "react";

import '../css/Perfil.css';
import NoProfileImg from '../img/no-profile-img.png';

import { crearAlerta } from './Toast/Toast.js';

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

        } else if(opcionId === 'imagen') {

            opciones = {
                modId: opcionId,
                titulo: 'Imagen',
                anterior: 'Foto de perfil',
                modificado: false
            }
        }

        setModDatos(opciones);
    };

    useEffect(() => {
        if(cambiarDatos == true && modDatos.modificado == false) {
            var element = document.getElementById('mod-' +modDatos.modId);

            if(modDatos.modId == 'imagen') {
                element.addEventListener('change', function() { setModDatos({ ...modDatos, modificado: true }); });
            } else {
                element.addEventListener("keyup", function() { setModDatos({ ...modDatos, modificado: true }); });
            }
        }
    });

    const enviarDatoModificado = async (event) => {
        event.preventDefault();

        const element = document.getElementById('mod-' +modDatos.modId);
        const editado = element.value;
        if(editado == '') {
            return crearAlerta('error', '¡Escribe algo primero!');
        }

        var imagenAvatar = undefined;

        if(modDatos.modId === 'password') {

            if(editado.length < 5) {
                return crearAlerta('error', '¡La contraseña debe tener al menos 5 caracteres!');
            }

        } else if(modDatos.modId === 'imagen') {

            imagenAvatar = element.files[0];
            
            if (!['image/jpeg', 'image/png'].includes(imagenAvatar.type)) {
                return crearAlerta('error', '¡Sólo formato .png o .jpg!');
            }

            if(imagenAvatar.size > 2 * 1024 * 1024) {
                return crearAlerta('error', '¡La imagen debe pesar menos de 2 MB!');
            }
        }

        const password = document.getElementById('mod-password-2').value;
        if(password == '') {
            return crearAlerta('error', '¡Escribe tu contraseña para confirmar!');
        }

        var datoEditado = editado;

        if(modDatos.modId === 'telefono') {
            datoEditado = modDatos.prefix+ ' ' +editado;
        }

        var formData = new FormData();

        formData.append('editado', datoEditado);
        formData.append('password', password);
        formData.append('tipo', modDatos.modId);

        if(imagenAvatar != undefined) {
            formData.append('imagen', imagenAvatar);
        }

        const data = await fetch('/perfil/editar', {
            method: 'POST',
            body: formData,
        });

        const items = await data.json();

        if(items.respuesta == 'err_user') {
            crearAlerta('error', '¡Ha ocurrido un error con el usuario!');

        } else if(items.respuesta == 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta == 'err_datos') {
            crearAlerta('error', '¡La contraseña no es la correcta!');

        } else if(items.respuesta == 'correcto') {
            crearAlerta('exito', '¡Los datos han sido actualizados!');

            if(modDatos.modId === 'telefono') {
                setUserInfo({ ...userInfo, telefono: modDatos.prefix+ ' ' +editado });
    
            } else if(modDatos.modId === 'residencia') {
                setUserInfo({ ...userInfo, residencia: editado });
    
            } else if(modDatos.modId === 'presentacion') {
                setUserInfo({ ...userInfo, presentacion: editado });
    
            } else if(modDatos.modId === 'email') {
                setUserInfo({ ...userInfo, email: editado });

            } else if(modDatos.modId === 'imagen') {
            }

            setCambiarDatos(false);
        }
    };

    //

    return (

        <div className="container-fluid">

            <div className="row">

                {cambiarDatos == false && <div className="col">
                    <button className={vistaPerfil === 0 ? "btn-no-style btn-activo" : "btn-no-style"} onClick={() => { cambiarVistaPerfil(0) }} id="vista-0">
                        Información personal
                    </button>
                    
                    <span className="vista-separador">/</span>

                    <button className={vistaPerfil === 1 ? "btn-no-style btn-activo" : "btn-no-style"} onClick={() => { cambiarVistaPerfil(1) }} id="vista-1">
                        Información cuenta
                    </button>
                    
                    <span className="vista-separador">/</span>

                    <button className={vistaPerfil === 2 ? "btn-no-style btn-activo" : "btn-no-style"} onClick={() => { cambiarVistaPerfil(2) }} id="vista-2">
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
                            <tr className="tabla-seleccion" onClick={() => { modificarOpcion('imagen') }}>
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

                                <Form.Group className="mb-3" style={modDatos.modId == 'imagen' ? {} : { display: 'none' }} >
                                    <Form.Label htmlFor="mod-password-2"><small>512x512 dimensiones recomendadas (.png / .jpg)</small></Form.Label>
                                    <Form.Control type="file" accept="image/*" id="mod-imagen" />
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