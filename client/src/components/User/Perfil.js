import React, { useEffect, useState } from "react";

import '../../css/Perfil.css';
import NoProfileImg from '../../img/no-profile-img.png';

import BuscarLugar from "../Maps/buscarLugar.js";
import { crearAlerta } from '../Toast/Toast.js';

import phonePrefix from '../../resources/phone-prefix.json';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faRepeat, faTrash, faUserMinus, faUserClock, faUser, faPenToSquare, faXmark } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";
import Form from 'react-bootstrap/Form';

var cambioResidencia = '';
const presentacionCaracteres = 300;
const trabajoCaracteres = 70;
const passwordCaracteres = 70;
const correoCaracteres = 200;

function Perfil({ changeLogged }) {

    // CARGAR PERFIL INFO

    var nacOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    var regOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }

    const [userInfo, setUserInfo] = useState([]);
    const [userImg, setUserImg] = useState(NoProfileImg);
    const [fotoCargada, setFotoCargada] = useState(null);

    const perfilInfo = async () => {

        const data = await fetch('/perfil', { 
            method: 'GET',
            
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();

        if(data.status === 200) {
            setUserInfo(items);

            const imagen = await fetch('/perfil/foto', { method: 'GET' });

            if(imagen.status === 200) {
                setUserImg(imagen.url);
            }

            return;
        }

        if (items.respuesta === 'err_db') crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');
        else if(items.respuesta === 'err_user') changeLogged(false);
    };

    useEffect(() => {
        perfilInfo();
    }, []);

    // CAMBIAR VISTAS

    const [vistaPerfil, setPerfilVista] = useState(0);
    const cambiarVistaPerfil = (vistaId) => {
        if(vistaPerfil === vistaId) {
            return;
        }

        setPerfilVista(vistaId);

        setCambiarDatos(false);
        setModDatos({});
    };

    // MODIFICAR DATOS

    const [cambiarDatos, setCambiarDatos] = useState(false);
    const [modDatos, setModDatos] = useState({});

    const volverPerfil = () => {
        setCambiarDatos(false);
        setModDatos({});
    };

    const modificarOpcion = (opcionId) => {
        setCambiarDatos(true);

        var opciones = {};

        opciones.modificado = false;
        opciones.modId = opcionId;

        if(opcionId === 'telefono') {

            const telefono = userInfo.telefono.split(' ');

            opciones.prefix = telefono[0];
            opciones.telefono = telefono[1];

        } else if(opcionId === 'presentacion') {
            opciones[opcionId] = userInfo.presentacion;

        } else if(opcionId === 'trabajo') {
            opciones[opcionId] = userInfo.trabajo;

        } else if(opcionId === 'idiomas') {

            const idiomas = userInfo.idiomas.split(', ');

            opciones.idioma_esp = false;
            opciones.idioma_ing = false;
            opciones.idioma_fra = false;
            opciones.idioma_por = false;
            opciones.idioma_chi = false;

            for(var i = 0; i < idiomas.length; i++) {
                opciones['idioma_' +idiomas[i].slice(0, 3).toLowerCase()] = true;
            }

        } else if(opcionId === 'email') {
            opciones[opcionId] = userInfo.email;

        } else if(opcionId === 'password') {
            opciones[opcionId] = '';

        } else if(opcionId === 'imagen') {
            opciones.modificado = true;
            opciones.puedeBorrar = userImg === NoProfileImg ? false : true;

        }

        setModDatos(opciones);
    };

    const cambiarEstado = async (opcionId) => {

        var nuevoEstado = 0;

        if(opcionId === 'recibirCorreos') {   
            nuevoEstado = userInfo.recibirCorreos === 'Desactivado' ? 1 : 0;
        }

        var formData = new FormData();

        formData.append('editado', nuevoEstado);
        formData.append('tipo', opcionId);

        const data = await fetch('/perfil/editar/estado', {
            method: 'POST',
            body: formData,
        });

        const items = await data.json();

        if(items.respuesta === 'err_user') {
            changeLogged(false);

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {
            crearAlerta('exito', '¡Los datos han sido actualizados!');
            
            if(opcionId === 'recibirCorreos') {
                setUserInfo({ ...userInfo, recibirCorreos:  userInfo.recibirCorreos === 'Desactivado' ? 'Activado' : 'Desactivado' });
            }
        }
    }

    const controlDato = (e, tipo=undefined) => {
        const elementId = e.target.id.split('-')[1];
        const elementValue = (tipo === undefined) ? e.target.value : e.target.checked;

        setModDatos({ ...modDatos, [elementId]: elementValue, modificado: true });
    };

    const colocarDireccion = (direccion) => {
        setModDatos({ ...modDatos, modificado: true });
        cambioResidencia = direccion;
    };

    const addImagen = (e) => {
        setModDatos({ ...modDatos, modificado: true }); 
        setFotoCargada(URL.createObjectURL(e.target.files[0]));
    };

    const enviarDatoModificado = async (event) => {
        event.preventDefault();

        var editado = '';

        if(modDatos.modId === 'residencia') {
            editado = cambioResidencia;

        } else {
            const element = document.getElementById('mod-' +modDatos.modId);
            editado = element.value;
        }

        if(editado === '') {
            return crearAlerta('error', '¡Escribe algo primero!');
        }

        var imagenAvatar = undefined;

        if(modDatos.modId === 'password') {

            if(editado.length < 5) {
                return crearAlerta('error', '¡La contraseña debe tener al menos 5 caracteres!');
            }

        } else if(modDatos.modId === 'imagen') {

            const element = document.getElementById('mod-' +modDatos.modId);
            imagenAvatar = element.files[0];
            
            if (!['image/jpeg', 'image/png'].includes(imagenAvatar.type)) {
                return crearAlerta('error', '¡Sólo formato .png o .jpg!');
            }

            if(imagenAvatar.size > 2 * 1024 * 1024) {
                return crearAlerta('error', '¡La imagen debe pesar menos de 2 MB!');
            }
        }

        const password = document.getElementById('mod-password-2').value;
        if(password === '') {
            return crearAlerta('error', '¡Escribe tu contraseña para confirmar!');
        }

        var datoEditado = editado;

        if(modDatos.modId === 'telefono') {
            datoEditado = modDatos.prefix+ ' ' +editado;

        } else if(modDatos.modId === 'idiomas') {
            var idiomas = [];

            if(modDatos.idioma_esp === true) {
                idiomas.push('Español');
            }

            if(modDatos.idioma_ing === true) {
                idiomas.push('Inglés');
            }

            if(modDatos.idioma_fra === true) {
                idiomas.push('Francés');
            }

            if(modDatos.idioma_por === true) {
                idiomas.push('Portugués');
            }

            if(modDatos.idioma_chi === true) {
                idiomas.push('Chino');
            }

            if(idiomas.length === 0) {
                return crearAlerta('error', '¡Debes colocar al menos un idioma!');
            }
            datoEditado = idiomas.toString().replaceAll(',', ', ');
        }

        var formData = new FormData();

        formData.append('editado', datoEditado);
        formData.append('password', password);
        formData.append('tipo', modDatos.modId);

        if(imagenAvatar !== undefined) {
            formData.append('imagen', imagenAvatar);
            formData.append('imagenAnterior', userInfo.imagenPerfil);
        }

        var desactivarBtn = document.getElementById('mod-btn');
        desactivarBtn.disabled = true;

        const data = await fetch('/perfil/editar', {
            method: 'POST',
            body: formData,
        });

        const items = await data.json();
        desactivarBtn.disabled = false;

        if(items.respuesta === 'err_user') {
            changeLogged(false);

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'err_datos') {
            crearAlerta('error', '¡La contraseña no es la correcta!');

        } else if(items.respuesta === 'correcto') {
            crearAlerta('exito', '¡Los datos han sido actualizados!');

            if(modDatos.modId === 'telefono') {
                setUserInfo({ ...userInfo, telefono: modDatos.prefix+ ' ' +editado });
    
            } else if(modDatos.modId === 'residencia') {
                setUserInfo({ ...userInfo, residencia: editado });
    
            } else if(modDatos.modId === 'presentacion') {
                setUserInfo({ ...userInfo, presentacion: editado });
    
            } else if(modDatos.modId === 'email') {
                setUserInfo({ ...userInfo, email: editado });

            } else if(modDatos.modId === 'trabajo') {
                setUserInfo({ ...userInfo, trabajo: editado });

            } else if(modDatos.modId === 'idiomas') {
                setUserInfo({ ...userInfo, idiomas: datoEditado });

            } else if(modDatos.modId === 'imagen') {
                window.location.reload();
            }

            setCambiarDatos(false);
            setModDatos({});

            document.getElementById('mod-password-2').value = '';
        }
    };

    const eliminarFoto = async () => {

        if(userImg === NoProfileImg) {
            return crearAlerta('error', '¡No tienes foto de perfil!');
        }

        const password = document.getElementById('mod-password-2').value;
        if(password === '') {
            return crearAlerta('error', '¡Escribe tu contraseña para confirmar!');
        }

        const data = await fetch('/perfil/borrar/foto', {
            method: 'POST',

            body: JSON.stringify({
                borrar: userInfo.imagenPerfil,
                password: password
            }),
            
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();

        if(items.respuesta === 'err_user') {
            changeLogged(false);

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'err_server') {
            crearAlerta('error', '¡Ha ocurrido un error en el servidor!');

        } else if(items.respuesta === 'err_datos') {
            crearAlerta('error', '¡La contraseña no es la correcta!');

        } else if(items.respuesta === 'correcto') {
            crearAlerta('exito', '¡Ahora ya no tienes imagen de perfil!');

            setUserImg(NoProfileImg);
            setCambiarDatos(false);
        }
    };

    const desactivarCuenta = async () => {

        if(window.confirm('¿Estás seguro de ' +modDatos.modId+ ' tu cuenta?') === false) {
            return;
        }

        const password = document.getElementById('mod-' +modDatos.modId).value;
        if(password === '') {
            return crearAlerta('error', '¡Escribe tu contraseña para confirmar!');
        }

        const data = await fetch('/perfil/borrar/cuenta', {
            method: 'POST',

            body: JSON.stringify({
                tipo: modDatos.modId,
                password: password
            }),
            
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();

        if(items.respuesta === 'err_user') {
            changeLogged(false);

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'err_datos') {
            crearAlerta('error', '¡La contraseña no es la correcta!');

        } else if(items.respuesta === 'correcto') {
            
            crearAlerta('exito', '¡Tu cuenta ha sido ' +modDatos.modId+ '!');

            setTimeout(() => {
                changeLogged(false);
                window.location.href = '/';

            }, 1000);
        }
    };

    //

    const verPerfilPublico = () => {
        window.open('/usuario/ver/' +userInfo.ID, '_blank');
    };

    //

    return (

        <div className="container-fluid mb-5">

            <div className="row">

                <div className="col">
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

                    <Button className="filtros-botones" size="sm" style={{ float: 'right' }} onClick={verPerfilPublico}>
                        <FontAwesomeIcon icon={faUser} /> Ir a tu perfil público
                    </Button>

                </div>

            </div>

            <hr/>

            <div className="row">
                
                <div className="col" style={window.innerWidth < 600 && cambiarDatos === true ? { display: 'none' } : {}}>

                    <table className="table" style={ vistaPerfil === 0 ? {} : { display: 'none' }}>
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
                            <tr className={modDatos.modId === 'telefono' ? "tabla-activa" : "tabla-seleccion"} onClick={() => { modificarOpcion('telefono') }}>
                                <td>
                                    Teléfono:
                                    <br/>
                                    <small>{userInfo.telefono}</small>
                                </td>
                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>
                            <tr className={modDatos.modId === 'residencia' ? "tabla-activa" : "tabla-seleccion"} onClick={() => { modificarOpcion('residencia') }}>
                                <td>
                                    Residencia:
                                    <br/>
                                    <small>{userInfo.residencia}</small>
                                </td>

                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>
                            
                            <tr className={modDatos.modId === 'trabajo' ? "tabla-activa" : "tabla-seleccion"} onClick={() => { modificarOpcion('trabajo') }}>
                                <td>
                                    Trabajo:
                                    <br/>
                                    <small>{userInfo.trabajo}</small>
                                </td>

                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>

                            <tr className={modDatos.modId === 'idiomas' ? "tabla-activa" : "tabla-seleccion"} onClick={() => { modificarOpcion('idiomas') }}>
                                <td>
                                    Idiomas:
                                    <br/>
                                    <small>{userInfo.idiomas}</small>
                                </td>

                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>
                            <tr className={modDatos.modId === 'presentacion' ? "tabla-activa" : "tabla-seleccion"} onClick={() => { modificarOpcion('presentacion') }}>
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

                    <table className="table" style={ vistaPerfil === 1 ? {} : { display: 'none' }}>
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
                            <tr className={modDatos.modId === 'email' ? "tabla-activa" : "tabla-seleccion"} onClick={() => { modificarOpcion('email') }}>
                                <td>
                                    Correo electrónico:
                                    <br/>
                                    <small>{userInfo.email}</small>
                                </td>
                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>
                            <tr className={modDatos.modId === 'password' ? "tabla-activa" : "tabla-seleccion"} onClick={() => { modificarOpcion('password') }}>
                                <td>
                                    Contraseña:
                                    <br/>
                                    <small>*********</small>
                                </td>
                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>
                            <tr className="tabla-seleccion" onClick={() => { cambiarEstado('recibirCorreos') }}>
                                <td>
                                    Recibir recomendaciones y ofertas:
                                    <br/>
                                    <small>{userInfo.recibirCorreos}</small>
                                </td>
                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faRepeat} />
                                </td>
                            </tr>
                            <tr className={modDatos.modId === 'imagen' ? "tabla-activa" : "tabla-seleccion"} onClick={() => { modificarOpcion('imagen') }}>
                                <td>
                                    Foto de perfil:
                                    <br/>
                                    <img src={userImg} key={userImg} className="img-fluid" width="5%" alt="Imagen de perfil del usuario"></img>
                                </td>
                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>

                        </tbody>
                    </table>

                    <table className="table" style={ vistaPerfil === 2 ? {} : { display: 'none' }}>

                        <tbody>

                            <tr className={modDatos.modId === 'desactivar' ? "tabla-activa" : "tabla-seleccion"} onClick={() => { modificarOpcion('desactivar') }}>
                                <td>
                                    Desactiva tu cuenta
                                    <br/>
                                    <small>
                                        * Su cuenta dejará de ser visible al resto de usuarios, hasta que vuelva a iniciar sesión.
                                    </small>
                                </td>
                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>

                            <tr className={modDatos.modId === 'eliminar' ? "tabla-activa" : "tabla-seleccion"} onClick={() => { modificarOpcion('eliminar') }}>
                                <td>
                                    Elimina tu cuenta totalmente
                                    <br/>
                                    <small>
                                        * Se eliminará toda la información almacenada sobre tu cuenta.
                                    </small>
                                </td>
                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                </div>
                
                <div className="col" style={window.innerWidth < 600 && cambiarDatos === false ? { display: 'none' } : {}}>

                    <div style={cambiarDatos === true ? {} : { display: 'none' }}>

                        <h4 className="text-center" style={{ fontWeight: 'bold' }}>
                            <FontAwesomeIcon icon={faXmark} style={{ float: 'left', marginTop: '5px', cursor: 'pointer' }} onClick={volverPerfil}/> 
                            
                            MODIFICAR: {modDatos.modId?.toUpperCase()}
                        </h4>

                        <hr />
                    </div>

                    <Form onSubmit={enviarDatoModificado}>

                        <Form.Group className="mb-3" style={modDatos.modId === 'telefono' ? {} : { display: 'none' }} >
                            
                            <div className="input-group mb-3">

                                <Form.Select aria-label="Seleccion prefijo telefono" id="mod-prefix" value={modDatos?.prefix} onChange={controlDato}>
                                    {
                                        phonePrefix.map((x, index) => {
                                            return <option key={index} value={x.dial_code}>
                                                {x.name} {x.dial_code}
                                            </option>
                                        })
                                    }
                                </Form.Select>
                                <Form.Control type="number" placeholder="Escribe número" id="mod-telefono" value={modDatos?.telefono} onChange={controlDato}/>
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3" style={modDatos.modId === 'residencia' ? {} : { display: 'none' }} >
                            <BuscarLugar enviaDireccion={colocarDireccion} />
                        </Form.Group>

                        <Form.Group className="mb-3" style={modDatos.modId === 'presentacion' ? {} : { display: 'none' }} >
                            <Form.Label>
                                <small className="text-muted">Quedan {presentacionCaracteres - modDatos?.presentacion?.length} caracteres</small>
                            </Form.Label>
                            <Form.Control as="textarea" placeholder="Escribe aquí algo sobre ti" id="mod-presentacion" value={modDatos?.presentacion} onChange={controlDato}/>
                        </Form.Group>

                        <Form.Group className="mb-3" style={modDatos.modId === 'trabajo' ? {} : { display: 'none' }} >
                            <Form.Label>
                                <small className="text-muted">Quedan {trabajoCaracteres - modDatos?.trabajo?.length} caracteres</small>
                            </Form.Label>
                            <Form.Control type="text" placeholder="¿A qué te dedicas?" id="mod-trabajo" value={modDatos?.trabajo} onChange={controlDato}/>
                        </Form.Group>

                        <Form.Group className="mb-3" style={modDatos.modId === 'idiomas' ? {} : { display: 'none' }} >

                            <Form.Label>
                                <small id="mod-idiomas" className="text-muted">
                                    Selecciona los idiomas que hablas:
                                </small>
                            </Form.Label>

                            <div key='checkbox' className="mb-3">
                                <Form.Check
                                    inline
                                    id="mod-idioma_esp"
                                    label="Español"
                                    name="group1"
                                    defaultChecked={modDatos?.idioma_esp}
                                    onClick={(e) => { controlDato(e, 'checked') }}
                                    type='checkbox'
                                    value={modDatos?.idioma_esp}
                                />
                                <Form.Check
                                    inline
                                    id="mod-idioma_ing"
                                    label="Inglés"
                                    name="group1"
                                    defaultChecked={modDatos?.idioma_ing}
                                    onClick={(e) => { controlDato(e, 'checked') }}
                                    type='checkbox'
                                    value={modDatos?.idioma_ing}
                                />
                                <Form.Check
                                    inline
                                    id="mod-idioma_fra"
                                    label="Francés"
                                    name="group1"
                                    defaultChecked={modDatos?.idioma_fra}
                                    onClick={(e) => { controlDato(e, 'checked') }}
                                    type='checkbox'
                                    value={modDatos?.idioma_fra}
                                />
                                <Form.Check
                                    inline
                                    id="mod-idioma_por"
                                    label="Portugués"
                                    name="group1"
                                    defaultChecked={modDatos?.idioma_por}
                                    onClick={(e) => { controlDato(e, 'checked') }}
                                    type='checkbox'
                                    value={modDatos?.idioma_por}
                                />
                                <Form.Check
                                    inline
                                    id="mod-idioma_chi"
                                    label="Chino"
                                    name="group1"
                                    defaultChecked={modDatos?.idioma_chi}
                                    onClick={(e) => { controlDato(e, 'checked') }}
                                    type='checkbox'
                                    value={modDatos?.idioma_chi}
                                />
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3" style={modDatos.modId === 'email' ? {} : { display: 'none' }} >
                            <Form.Label>
                                <small className="text-muted">Quedan {correoCaracteres - modDatos?.email?.length} caracteres</small>
                            </Form.Label>
                            <Form.Control type="email" placeholder="Nuevo correo" id="mod-email" value={modDatos?.email} onChange={controlDato}/>
                        </Form.Group>

                        <Form.Group className="mb-3" style={modDatos.modId === 'password' ? {} : { display: 'none' }} >
                            <Form.Label>
                                <small className="text-muted">Quedan {passwordCaracteres - modDatos?.password?.length} caracteres</small>
                            </Form.Label>
                            <Form.Control type="password" placeholder="Nueva contraseña" id="mod-password" value={modDatos?.password} onChange={controlDato}/>
                        </Form.Group>

                        <Form.Group className="mb-3" style={modDatos.modId === 'imagen' ? {} : { display: 'none' }} >

                            <div style={fotoCargada !== null ? {} : { display: 'none' }}>

                                <img
                                    alt="Nueva imagen de perfil"
                                    src={fotoCargada}
                                    width="40%"
                                    className="img-fluid" />

                                <br />
                            </div>

                            <Form.Label htmlFor="mod-imagen">
                                <small>512x512 dimensiones recomendadas (.png / .jpg)</small>
                            </Form.Label>

                            <Form.Control type="file" accept="image/*" id="mod-imagen" onChange={addImagen} />
                        </Form.Group>

                        <Form.Group className="mb-3" style={modDatos.modId === 'desactivar' ? {} : { display: 'none' }} >

                            <Form.Control type="password" placeholder="Contraseña" id="mod-desactivar" />

                            <br />

                            <Button className="borrar-botones" size="sm" onClick={desactivarCuenta}>
                                <FontAwesomeIcon icon={faUserClock} /> Desactivar
                            </Button>
                        </Form.Group>

                        <Form.Group className="mb-3" style={modDatos.modId === 'eliminar' ? {} : { display: 'none' }} >

                            <Form.Control type="password" placeholder="Contraseña" id="mod-eliminar" />

                            <br />
                            
                            <Button className="borrar-botones" size="sm" onClick={desactivarCuenta}>
                                <FontAwesomeIcon icon={faUserMinus} /> Eliminar
                            </Button>
                        </Form.Group>

                        <Form.Group className="mb-3" style={modDatos.modificado === true ? {} : { display: 'none' }}>
                            <Form.Label htmlFor="mod-password-2">Contraseña:</Form.Label>
                            <Form.Control type="password" placeholder="Escribe contraseña" id="mod-password-2" />

                            <br />

                            <Button type="submit" className="filtros-botones" size="sm" id="mod-btn">
                                &nbsp;&nbsp;&nbsp;<FontAwesomeIcon icon={faPenToSquare} /> Modificar&nbsp;&nbsp;&nbsp;
                            </Button>

                            &nbsp;&nbsp;
                            
                            <Button className="borrar-botones" size="sm" onClick={eliminarFoto} style={modDatos.puedeBorrar === true ? {} : { display: 'none' }}>
                                <FontAwesomeIcon icon={faTrash} /> Eliminar foto perfil
                            </Button>
                        </Form.Group>

                    </Form>
                </div>

            </div>
        </div>
    );
}

export default Perfil;