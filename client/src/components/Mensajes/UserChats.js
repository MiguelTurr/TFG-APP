import React, { useState, useEffect, useRef } from "react";

import { useLocation } from "react-router-dom";

import { crearAlerta } from '../Toast/Toast.js';

import NoProfileImg from '../../img/no-profile-img.png';
import './Chats.css';
import icons from '../../resources/icons.json';

import MensajeImagen from './MensajeImagen';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faFaceLaughBeam, faArrowLeft, faImage } from '@fortawesome/free-solid-svg-icons';

import Form from 'react-bootstrap/Form';

const fechaOpc = { year: 'numeric', month: '2-digit', day: '2-digit' };
const horaOpc = { hour: '2-digit', minute: '2-digit' };

var fechaComparar = null;

function UserChats({ changeLogged }) {

    const location = useLocation();

    //

    const [chats, setChats] = useState([]);
    const [userImg, setUserImg] = useState([]);

    const [chatIndex, setChatIndex] = useState(null);
    const [chatMensajes, setChatMensajes] = useState([]);

    const [nuevoChat, setNuevoChat] = useState(null);
    const [nuevoMensajes, setNuevoMensajes] = useState([]);

    const primerMensaje = useRef();
    const escribirMensaje = useRef();

    const chatImagen = useRef();

    const [showIcon, setShowIcon] = useState(null);

    const [imagenChat, setImagenChat] = useState(null);

    useEffect(() => {

        var element = document.getElementById('mensajes-chat');
        element.scrollTo(element.scrollHeight, element.scrollHeight);
    
    }, [chatMensajes])

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const userId = params.get('user');

        if (userId === null) {
            return;
        }

        var len = chats.length;
        var index = -1;

        for (var i = 0; i < len; i++) {

            if (parseInt(chats[i].hablarID) !== parseInt(userId)) {
                continue;
            }
            index = i;
            break;
        }

        if(index === -1) {
            setNuevoChat({
                userId: userId,
                nombre: params.get('nombre')
            });
            return;
        }
        
        abrirChat(index);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location, chats]);

    useEffect(() => {
        obtenerChats();
    }, []);

    const obtenerChats = async () => {
        const data = await fetch('/perfil/mis-chats', { method: 'GET' });
        const items = await data.json();

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'err_user') {
            changeLogged(false);

        } else if(items.respuesta === 'correcto') {
            setChats(items.chats);

            var len = items.chats.length;
            var arrayPerfiles = [];
            for(var i = 0; i < len; i++) {

                const perfil = await fetch('/alojamiento/hospedador/foto/' +items.chats[i].hablarID, { method: 'GET' });
    
                if(perfil.status === 200) {
                    arrayPerfiles.push(perfil.url);
    
                } else {
                    arrayPerfiles.push(NoProfileImg);
                }
            }
            setUserImg(arrayPerfiles);
        }
    };

    const abrirChat = async (index) => {

        if(chatIndex === index) {
            return;
        }

        const data = await fetch('/perfil/mis-chats/chat/' +chats[index].chatID, { method: 'GET' });
        const items = await data.json();

        if(items.respuesta === 'correcto') {
            setChatMensajes(items.mensajes);
            setChatIndex(index);

            setShowIcon(false);
            fechaComparar = null;

            //

            if(chats[index].sinLeer > 0) {
                var array = chats;

                array[index].sinLeer = 0;
                setChats(array);
            }

            //

            if(nuevoChat !== null) {
                setNuevoChat(null);
            }
        }
    };

    const volverAtrasNuevo = () => {
        setNuevoChat(null);
        setChatMensajes([]);
    };

    const enviarNuevoMensaje = async (e) => {
        e.preventDefault();

        //

        const mensaje = primerMensaje.current.value;

        if(mensaje === '') return;

        primerMensaje.current.value = '';

        const data = await fetch('/perfil/mis-chats/nuevo-mensaje', {
            method: 'POST',

            body: JSON.stringify({
                hablarId: nuevoChat.userId,
                mensaje: mensaje,
            }),
            
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const items = await data.json();

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'err_chat') {
            crearAlerta('error', '¡No puedes enviarte mensajes a ti mismo!');
            
            setNuevoChat(null);
            setChatMensajes([]);

        } else if(items.respuesta === 'correcto') {

            setNuevoMensajes([...nuevoMensajes, { 
                mensaje: mensaje,
                propio: true,
                creadoEn: new Date()}
            ]);

           setChats([{ 
                nombre: nuevoChat.nombre,
                hablarID: nuevoChat.userId,

                chatID: items.chatID,
                fecha: new Date(),
                mensaje: mensaje,
                propio: true,
            }, ...chats]);

            const perfil = await fetch('/alojamiento/hospedador/foto/' +nuevoChat.userId, { method: 'GET' });
    
            if(perfil.status === 200) {
                setUserImg([perfil.url, ...userImg]);
    
            } else {
                setUserImg([NoProfileImg, ...userImg]);
            }
        }
    };

    const volverAtras = () => {
        setChatIndex(null);
        setChatMensajes([]);
    };

    const enviarMensaje = async (e) => {
        e.preventDefault();

        //

        const mensaje = escribirMensaje.current.value;

        if(mensaje === '') return;

        escribirMensaje.current.value = '';

        const data = await fetch('/perfil/mis-chats/nuevo-mensaje', {
            method: 'POST',

            body: JSON.stringify({
                chatID: chats[chatIndex].chatID,
                mensaje: mensaje,
            }),
            
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const items = await data.json();

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {

            setChatMensajes([...chatMensajes, { 
                mensaje: mensaje,
                propio: true,
                creadoEn: new Date()}
            ]);

            //
            
            var array = chats;
            array[chatIndex].propio = true;
            array[chatIndex].mensaje = mensaje;
            array[chatIndex].fecha = new Date();
            setChats(array);
        }
    };

    const addNewIcon = (icon) => {
        escribirMensaje.current.value += icon;
    };

    const comprobarDia = (fecha) => {

        const fechaAsDate = new Date(fecha);

        if(fechaComparar === null || fechaComparar.getDate() !== fechaAsDate.getDate() || (fechaComparar.getDate() === fechaAsDate.getDate() && fechaComparar.getMonth() !== fechaAsDate.getMonth())) {
            fechaComparar = fechaAsDate;
            return (<div className="mensaje-fecha">{fechaComparar.toLocaleDateString('es-ES', {day: '2-digit',  month: 'long' })}</div>);
        }
        return '';
    };

    const enviarImagen = async () => {

        const len = chatImagen.current.files.length;
        if(len === 0) return;

        if (!['image/jpeg', 'image/png'].includes(chatImagen.current.files[0].type)) {
            return crearAlerta('error', '¡Ese formato de imagen no es válido!');
        }

        const maxSize = 2 * 1024 * 1024;

        if (chatImagen.current.files[0].size > maxSize) {
            return crearAlerta('error', '¡El tamaño máximo por imagen es de 2 MB!');
        }

        var formData = new FormData();

        formData.append('chatID', chats[chatIndex].chatID);
        formData.append('imagen', chatImagen.current.files[0]);

        const data = await fetch('/perfil/mis-chats/nuevo-foto', {
            method: 'POST',
            body: formData,
        });

        const items = await data.json();

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcto') {

            setChatMensajes([...chatMensajes, { 
                ID: items.imagenId,
                propio: true,
                imagen: true,
                mensaje: 'Foto.' +chatImagen.current.files[0].type.split('/')[1],
                creadoEn: new Date()}
            ]);

            //
            
            var array = chats;
            array[chatIndex].propio = true;
            array[chatIndex].imagen = true;
            array[chatIndex].mensaje = 'Foto';
            array[chatIndex].fecha = new Date();
            setChats(array);
        }
    };

    //

    const cerrarImagenChat = () => { setImagenChat(null) };
    const mostrarImagen = async (index) => {
        const param = chats[chatIndex].chatID+ '-' +chatMensajes[index].ID+ '-' +chatMensajes[index].mensaje.split('.')[1];
        const imagen = await fetch('/perfil/mis-chats/chat-foto/' +param, { method: 'GET' });
    
        if(imagen.status === 200) {
            setImagenChat(imagen.url);
        }
    };

    //

    return (
        <div className="container-fluid mb-3">
            <div className="row">

                <div className="col-sm-4" style={window.innerWidth < 600 && (chatIndex !== null || nuevoChat !== null) ? { display: 'none' } : { }}>

                    <h5 style={{ fontWeight: 'bold' }}>
                        CHATS
                    </h5>

                    <hr />

                    <table className="table">

                        <tbody style={{ verticalAlign: 'middle', fontWeight: 'bold', fontSize: '13px'}}>

                            {
                                chats.map((x, index) => (
                                <tr className="tabla-seleccion" key={index} onClick={() => { abrirChat(index) }} style={chatIndex === index ? { backgroundColor: 'rgb(240, 240, 240)' } : {}}>

                                    <td style={{ width: '20%' }}>
                                        <img
                                            className="img-fluid rounded-pill"
                                            src={userImg[index]}
                                            alt="Imagen de perfil del usuario" />
                                    </td>
                                    <td>
                                        {x.nombre}
                                        <br />
                                        <span style={ x.propio === true ? { color: '#4349ff' } : { display: 'none', }}>
                                            Tú:&nbsp;
                                        </span>
                                        {x.mensaje.substring(0, 8)} {x.mensaje.length > 8 ? '...' : ''}
                                    </td>

                                    <td style={{ textAlign: 'right'}}>

                                        <span style={ x.hoy === false ? {} : { display: 'none' }}>
                                            { new Date(x.fecha).toLocaleDateString('es-ES', fechaOpc) }
                                        </span>

                                        <span style={ x.hoy === true ? {} : { display: 'none' }}>
                                            { new Date(x.fecha).toLocaleTimeString('es-ES', horaOpc) }
                                        </span>
                                                                         
                                        <span style={ x.sinLeer > 0 ? {} : { display: 'none'}}>
                                            &nbsp;&nbsp;
                                            <span style={{backgroundColor: '#ffaf2b', padding: '8px', borderRadius: '20px' }}>
                                                &nbsp;{x.sinLeer}&nbsp;
                                            </span>
                                        </span>
                                    </td>
                                </tr>
                                ))
                            }

                            
                        </tbody>
                    </table>
                </div>

                <div className="col" style={window.innerWidth < 600 && chatIndex === null && nuevoChat === null ? { display: 'none' } : { }}>
                    
                    <div style={nuevoChat !== null ? {  } : { display: 'none' }}>

                        <span style={window.innerWidth > 600 ? { display: 'none' } : {}}>
                            <FontAwesomeIcon icon={faArrowLeft} style={{ cursor: 'pointer' }} onClick={volverAtrasNuevo} />
                            &nbsp;&nbsp;&nbsp;

                            <img
                                className="rounded-pill"
                                width='10%'
                                src={NoProfileImg}
                                alt="Imagen de perfil del usuario" />
                            &nbsp;&nbsp;&nbsp;
                        </span>

                        <span className="chat-titulo">
                            {nuevoChat?.nombre.toUpperCase()}
                        </span>

                        <hr />

                        <div className="chat-mensajes">
                            {
                                nuevoMensajes.map((x, index) => (
                                    
                                    <div key={index} className='mensaje mensaje-propio'>
                                        {x.mensaje}

                                        <small className="mensaje-hora">
                                            &nbsp; { new Date(x.creadoEn).toLocaleTimeString('es-ES', horaOpc) }&nbsp;
                                        </small>
                                    </div>
                                ))
                            }

                        </div>

                        <hr/> 
                        
                        <Form className="chat-input mt-2" onSubmit={enviarNuevoMensaje}>
                            <FontAwesomeIcon className="chat-icon" icon={faCamera} />
                            <FontAwesomeIcon className="chat-icon" icon={faFaceLaughBeam} />
                            <Form.Control type="text" placeholder="Escribe tu mensaje aquí!" maxlength="150" ref={primerMensaje} />
                        </Form>

                    </div>

                    <div style={ chatIndex !== null ? {} : { display: 'none' } }>
                            
                        <span style={window.innerWidth > 600 && chatIndex !== null ? { display: 'none' } : { }}>  
                            <FontAwesomeIcon icon={faArrowLeft} style={{ cursor: 'pointer'} } onClick={volverAtras}/>
                            &nbsp;&nbsp;&nbsp;
                            
                            <img
                                className="rounded-pill"
                                width='10%'
                                src={userImg[chatIndex]}
                                alt="Imagen de perfil del usuario" />
                            &nbsp;&nbsp;&nbsp;
                        </span>

                        <span className="chat-titulo">
                            {chats[chatIndex]?.nombre.toUpperCase()} <br/> <small className="text-muted">{chats[chatIndex]?.ultimaConexion}</small>
                        </span>

                        <hr/>

                        <div className="chat-mensajes" id="mensajes-chat">

                            {
                                chatMensajes.map((x, index) => (
                                    <span key={index}>
                                        {comprobarDia(x.creadoEn)}

                                        <div className={x.propio === false ? 'mensaje' : 'mensaje mensaje-propio' }>

                                            {x.imagen === true ? <FontAwesomeIcon icon={faImage} className="mensaje-img" onClick={() => mostrarImagen(index) }/> : x.mensaje}

                                            <small className="mensaje-hora">
                                                &nbsp; { new Date(x.creadoEn).toLocaleTimeString('es-ES', horaOpc) }&nbsp;
                                            </small>
                                        </div>
                                    </span>
                                ))
                            }

                        </div>

                        <div style={{ position: 'relative' }}>
    
                            <div className="icon-list" style={ showIcon === true ? { } : { display: 'none' }}>

                                {
                                    icons.map((x, index) => (
                                        <span key={index}>
                                            <span className="icon" onClick={() => { addNewIcon(x.icon) }}>
                                                {x.icon}
                                            </span>
                                            {(index+1) % 5 === 0 ? <br/> : ''}
                                        </span>
                                    ))
                                }
                            </div>
                        </div>

                        <hr/>
                                                
                        <Form className="chat-input mt-2" onSubmit={enviarMensaje}>
                            <FontAwesomeIcon
                                className="chat-icon"
                                icon={faCamera}
                                onClick={() => { chatImagen.current.click() }}
                                />

                            <FontAwesomeIcon
                                className="chat-icon"
                                icon={faFaceLaughBeam} 
                                
                                onClick={() => setShowIcon(!showIcon) }/>

                            <Form.Control type="text" placeholder="Escribe tu mensaje aquí!" maxlength="150" ref={escribirMensaje} />
                        </Form>

                    </div>

                    <input type="file" accept="image/*" ref={chatImagen} onChange={enviarImagen} style={{ display: 'none' }} />

                    <div style={ chatIndex === null && nuevoChat === null ? {} : {display: 'none'} }>

                        <h5 style={{ fontWeight: 'bold', fontSize: '15px', textAlign: 'center', marginTop: '25%' }}>
                            <span style={{backgroundColor: '#494949', padding: '10px', borderRadius: '25px', color: 'white' }}>
                                Selecciona un chat para empezar a hablar
                            </span>
                        </h5>
                    </div>
                </div>
            </div>

            <MensajeImagen imagen={imagenChat} funcionCerrar={cerrarImagenChat} />
        </div>
    );
}

export default UserChats;