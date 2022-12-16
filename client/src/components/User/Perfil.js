import React, { useEffect, useState } from "react";

import '../../css/Perfil.css';
import NoProfileImg from '../../img/no-profile-img.png';

import BuscarLugar from "../Maps/buscarLugar.js";
import { crearAlerta } from '../Toast/Toast.js';
import userLogin from '../../js/autorizado';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faRepeat, faArrowLeft, faTrash, faUserMinus, faUserClock, faUser } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";
import Form from 'react-bootstrap/Form';

var cambioResidencia = '';

function Perfil() {

    const { autorizado, setAutorizado } = userLogin();

    // CARGAR PERFIL INFO

    var nacOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    var regOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }

    const [userInfo, setUserInfo] = useState([]);
    const [userImg, setUserImg] = useState(NoProfileImg);
    const [userIdiomas, setUserIdiomas] = useState([]);
    const [fotoCargada, setFotoCargada] = useState(null);

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

        if(imagen.status === 200) {
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
        if(vistaPerfil === vistaId) {
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

        } else if(opcionId === 'trabajo') {

            opciones = {
                modId: opcionId,
                titulo: 'Trabajo',
                anterior: userInfo.trabajo,
                modificado: false
            }

        } else if(opcionId === 'idiomas') {

            const idiomas = userInfo.idiomas.split(', ');
            var objeto = {
                idioma_esp: false,
                idioma_ing: false,
                idioma_fra: false,
                idioma_por: false,
                idioma_chi: false,
            };

            for(var i = 0; i < idiomas.length; i++) {
                objeto['idioma_' +idiomas[i].slice(0, 3).toLowerCase()] = true;
            }
            setUserIdiomas(objeto);

            //

            opciones = {
                modId: opcionId,
                titulo: 'Idiomas',
                anterior: userInfo.idiomas,
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
                modificado: false,
                puedeBorrar: (userImg === NoProfileImg ? false : true)
            }

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
            crearAlerta('error', '¡Ha ocurrido un error con el usuario!');

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {
            crearAlerta('exito', '¡Los datos han sido actualizados!');
            
            if(opcionId === 'recibirCorreos') {
                setUserInfo({ ...userInfo, recibirCorreos:  userInfo.recibirCorreos === 'Desactivado' ? 'Activado' : 'Desactivado' });
            }
        }
    }

    useEffect(() => {

        if(cambiarDatos === true && modDatos.modificado === false) {
            var element = document.getElementById('mod-' +modDatos.modId);

            if(modDatos.modId === 'imagen' || modDatos.modId === 'residencia') {

            } else if(modDatos.modId === 'idiomas') {
                document.getElementById('idioma_esp').addEventListener('change', function() { setModDatos({ ...modDatos, modificado: true }); });
                document.getElementById('idioma_ing').addEventListener('change', function() { setModDatos({ ...modDatos, modificado: true }); });
                document.getElementById('idioma_fra').addEventListener('change', function() { setModDatos({ ...modDatos, modificado: true }); });
                document.getElementById('idioma_por').addEventListener('change', function() { setModDatos({ ...modDatos, modificado: true }); });
                document.getElementById('idioma_chi').addEventListener('change', function() { setModDatos({ ...modDatos, modificado: true }); });
                
            } else {
                element.addEventListener("keyup", function() { setModDatos({ ...modDatos, modificado: true }); });
            }
        }
    }, [cambiarDatos]);

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

            if(document.getElementById('idioma_esp').checked === true) {
                idiomas.push('Español');
            }

            if(document.getElementById('idioma_ing').checked === true) {
                idiomas.push('Inglés');
            }

            if(document.getElementById('idioma_fra').checked === true) {
                idiomas.push('Francés');
            }

            if(document.getElementById('idioma_por').checked === true) {
                idiomas.push('Portugués');
            }

            if(document.getElementById('idioma_chi').checked === true) {
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
            crearAlerta('error', '¡Ha ocurrido un error con el usuario!');

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
                setUserInfo({ ...userInfo, idiomas: editado });

            } else if(modDatos.modId === 'imagen') {
                window.location.reload();
            }

            setCambiarDatos(false);
        }
    };

    const opcionBorrar = async () => {

        if(userImg === NoProfileImg) {
            return crearAlerta('error', '¡No tienes foto de perfil!');
        }

        var datoBorrar = userInfo.imagenPerfil;

        const data = await fetch('/perfil/borrar', {
            method: 'POST',

            body: JSON.stringify({
                tipo: modDatos.modId,
                borrar: datoBorrar,
            }),
            
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();

        if(items.respuesta === 'err_user') {
            crearAlerta('error', '¡Ha ocurrido un error con el usuario!');

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'err_server') {
            crearAlerta('error', '¡Ha ocurrido un error en el servidor!');

        } else if(items.respuesta === 'correcto') {
            crearAlerta('exito', '¡Ahora ya no tienes imagen de perfil!');

            setUserImg(NoProfileImg);
            setCambiarDatos(false);
        }
    };

    const desactivarCuenta = async (tipo) => {

        if(window.confirm('¿Estás seguro de ' +tipo+ ' tu cuenta?') == false) {
            return;
        } 

        const data = await fetch('/perfil/borrar', {
            method: 'POST',

            body: JSON.stringify({
                tipo: tipo,
            }),
            
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();

        if(items.respuesta === 'err_user') {
            crearAlerta('error', '¡Ha ocurrido un error con el usuario!');

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {
            
            crearAlerta('exito', '¡Tu cuenta ha sido ' +tipo+ '!');

            setTimeout(() => {
                setAutorizado(false);
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

                {cambiarDatos === false && <div className="col">
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

                </div>}

                {cambiarDatos === true && <div className="col">
                    
                    <Button className="filtros-botones" size="sm" onClick={() => { volverPerfil() }}>
                        <FontAwesomeIcon icon={faArrowLeft} /> Volver
                    </Button>
                    &nbsp;&nbsp;
                    <Button className="borrar-botones" size="sm" onClick={() => { opcionBorrar() }}  style={modDatos.puedeBorrar === true ? {} : { display: 'none' }}>
                        <FontAwesomeIcon icon={faTrash} /> Eliminar {modDatos.modId}
                    </Button>
                </div>}

            </div>

            <hr/>

            <div className="row">
                
                <div className="col">

                    {cambiarDatos === false && vistaPerfil === 0 && <> <table className="table">
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
                            
                            <tr className="tabla-seleccion" onClick={() => { modificarOpcion('trabajo') }}>
                                <td>
                                    Trabajo:
                                    <br/>
                                    <small>{userInfo.trabajo}</small>
                                </td>

                                <td className="arrow-style">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </td>
                            </tr>

                            <tr className="tabla-seleccion" onClick={() => { modificarOpcion('idiomas') }}>
                                <td>
                                    Idiomas:
                                    <br/>
                                    <small>{userInfo.idiomas}</small>
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

                    {cambiarDatos === false && vistaPerfil === 1 && <> <table className="table">
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
                            <tr className="tabla-seleccion" onClick={() => { modificarOpcion('imagen') }}>
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
                    </>}

                    {cambiarDatos === false && vistaPerfil === 2 && <div className="col-sm-6 text-center mx-auto">

                        <div className="d-grid gap-2">

                            <h5>
                                Desactiva tu cuenta
                            </h5>

                            <Button className="filtros-botones" size="sm" onClick={() => { desactivarCuenta('desactivar'); }}>
                                <FontAwesomeIcon icon={faUserClock} /> Desactivar
                            </Button>

                            <small>
                                * Su cuenta dejará de ser visible al resto de usuarios, hasta que vuelva a iniciar sesión.
                            </small>

                            <hr/>

                            <h5>
                                Elimina tu cuenta totalmente
                            </h5>

                            <Button className="borrar-botones" size="sm" onClick={() => { desactivarCuenta('eliminar'); }}>
                                <FontAwesomeIcon icon={faUserMinus} /> Eliminar
                            </Button>

                            <small>
                                * Se eliminará toda la información almacenada sobre tu cuenta.
                            </small>
                        </div>

                    </div>}


                    {cambiarDatos === true && 
                        <div className="col-sm-6 text-center mx-auto">
                            <h5>
                                {modDatos.titulo}: <span className="resaltar-titulo">{modDatos.anterior}</span>
                            </h5>

                            <hr/>

                            <Form onSubmit={enviarDatoModificado}>

                                <Form.Group className="mb-3" style={modDatos.modId === 'telefono' ? {} : { display: 'none' }} >
                                    <div className="input-group mb-3">
                                        <span className="input-group-text">{modDatos.prefix}</span>
                                        <Form.Control type="number" placeholder="Nuevo teléfono" id="mod-telefono"/>
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-3" style={modDatos.modId === 'residencia' ? {} : { display: 'none' }} >
                                    <BuscarLugar enviaDireccion={colocarDireccion} />

                                </Form.Group>

                                <Form.Group className="mb-3" style={modDatos.modId === 'presentacion' ? {} : { display: 'none' }} >
                                    <Form.Control as="textarea" placeholder="Escribe aquí algo sobre ti" id="mod-presentacion"/>
                                </Form.Group>

                                <Form.Group className="mb-3" style={modDatos.modId === 'trabajo' ? {} : { display: 'none' }} >
                                    <Form.Control type="text" placeholder="¿A qué te dedicas?" id="mod-trabajo"/>
                                </Form.Group>

                                <Form.Group className="mb-3" style={modDatos.modId === 'idiomas' ? {} : { display: 'none' }} >

                                    <small id="mod-idiomas">
                                        * Selecciona los idiomas que hablas:
                                    </small>
                                    
                                    <br/>
                                    <br/>

                                    <div key='checkbox' className="mb-3">
                                        <Form.Check
                                            inline
                                            id="idioma_esp"
                                            label="Español"
                                            name="group1"
                                            defaultChecked={userIdiomas.idioma_esp}
                                            type='checkbox'
                                            value={userIdiomas.idioma_esp}
                                        />
                                        <Form.Check
                                            inline
                                            id="idioma_ing"
                                            label="Inglés"
                                            name="group1"
                                            defaultChecked={userIdiomas.idioma_ing}
                                            type='checkbox'
                                            value={userIdiomas.idioma_ing}
                                        />
                                        <Form.Check
                                            inline
                                            id="idioma_fra"
                                            label="Francés"
                                            name="group1"
                                            defaultChecked={userIdiomas.idioma_fra}
                                            type='checkbox'
                                            value={userIdiomas.idioma_fra}
                                        />
                                        <Form.Check
                                            inline
                                            id="idioma_por"
                                            label="Portugués"
                                            name="group1"
                                            defaultChecked={userIdiomas.idioma_por}
                                            type='checkbox'
                                            value={userIdiomas.idioma_por}
                                        />
                                        <Form.Check
                                            inline
                                            id="idioma_chi"
                                            label="Chino"
                                            name="group1"
                                            defaultChecked={userIdiomas.idioma_chi}
                                            type='checkbox'
                                            value={userIdiomas.idioma_chi}
                                        />
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-3" style={modDatos.modId === 'email' ? {} : { display: 'none' }} >
                                    <Form.Control type="email" placeholder="Nuevo correo" id="mod-email" />
                                </Form.Group>

                                <Form.Group className="mb-3" style={modDatos.modId === 'password' ? {} : { display: 'none' }} >
                                    <Form.Control type="password" placeholder="Nueva contraseña" id="mod-password" />
                                </Form.Group>

                                <Form.Group className="mb-3" style={modDatos.modId === 'imagen' ? {} : { display: 'none' }} >
                                    <div style={ fotoCargada !== null ? { } : { display: 'none'}}>

                                        <img
                                            alt="Nueva imagen de perfil"
                                            src={fotoCargada}
                                            width="40%"
                                            className="img-fluid"/>

                                        <br/>
                                    </div>

                                    <Form.Label htmlFor="mod-password-2">
                                        <small>512x512 dimensiones recomendadas (.png / .jpg)</small>
                                    </Form.Label>

                                    <Form.Control type="file" accept="image/*" id="mod-imagen" onChange={addImagen}/>
                                </Form.Group>

                                <Form.Group className="mb-3" style={modDatos.modificado === true ? {} : { display: 'none' }}>
                                    <Form.Label htmlFor="mod-password-2">Valida tu contraseña</Form.Label>
                                    <Form.Control type="password" placeholder="Escribe contraseña" id="mod-password-2" />
                                </Form.Group>
                            
                                <div className="d-grid gap-2">
                                    <Button type="submit" className="filtros-botones" size="sm" id="mod-btn">
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