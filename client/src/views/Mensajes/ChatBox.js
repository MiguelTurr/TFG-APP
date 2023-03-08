import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';

import { crearAlerta } from '../Toast/Toast.js';

import ChatIconos from './ChatIconos.js';
import MensajeImagen from './MensajeImagen.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faFaceLaughBeam, faArrowLeft, faImage, faPaperPlane, faPersonMilitaryRifle } from '@fortawesome/free-solid-svg-icons';

import Form from 'react-bootstrap/Form';

var fechaComparar = null;

const horaOpc = { hour: '2-digit', minute: '2-digit' };

function ChatBox({ seleccionado, cambiarSeleccionado, chatInfo, chatImagen, updateMessage, updateSinLeer }) {

    const navigate = useNavigate();

    //

    const [chatMensajes, setChatMensajes] = useState([]);

    const enviarChatMensaje = useRef();
    const enviarChatImagen = useRef();

    const [showIcon, setShowIcon] = useState(false);

    const [modalImagen, setModalImagen] = useState(null);

    //

    useEffect(() => {
        if (seleccionado === null) return;

        fechaComparar = null;
        cargarMensajesChat();

    }, [seleccionado]);

    useEffect(() => {
        if (seleccionado === null) return;

        var element = document.getElementById('mensajes-chat');
        element.scrollTo(element.scrollHeight, element.scrollHeight);
    }, [chatMensajes])

    if (seleccionado === null) {
        if (window.innerWidth > 600) {
            return (
                <h5 style={{ fontWeight: 'bold', fontSize: '15px', textAlign: 'center', marginTop: '25%' }}>
                    <span style={{ backgroundColor: '#494949', padding: '10px', borderRadius: '25px', color: 'white' }}>
                        Selecciona un chat para empezar a hablar.
                    </span>
                </h5>
            );
        }
        return '';
    }

    const cargarMensajesChat = async () => {

        const data = await fetch('/perfil/mis-chats/chat/' + chatInfo.chatID, { method: 'GET' });
        const items = await data.json();

        if (items.respuesta === 'correcto') {
            setChatMensajes(items.mensajes);
            updateSinLeer(seleccionado);
        }
    };

    const enviarMensaje = async (e) => {
        e.preventDefault();

        //

        const mensaje = enviarChatMensaje.current.value;

        if (mensaje === '') return;

        enviarChatMensaje.current.value = '';

        const data = await fetch('/perfil/mis-chats/nuevo-mensaje', {
            method: 'POST',

            body: JSON.stringify({
                chatID: chatInfo.chatID,
                mensaje: mensaje,
            }),

            headers: {
                'Content-Type': 'application/json'
            }
        });

        const items = await data.json();

        if (items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if (items.respuesta === 'correcto') {

            setChatMensajes([...chatMensajes, {
                mensaje: mensaje,
                propio: true,
                creadoEn: new Date()
            }
            ]);

            //

            updateMessage(seleccionado, mensaje);
        }
    };

    const enviarImagen = async () => {

        const len = enviarChatImagen.current.files.length;
        if (len === 0) return;

        if (!['image/jpeg', 'image/png'].includes(enviarChatImagen.current.files[0].type)) {
            return crearAlerta('error', '¡Ese formato de imagen no es válido!');
        }

        const maxSize = 2 * 1024 * 1024;

        if (enviarChatImagen.current.files[0].size > maxSize) {
            return crearAlerta('error', '¡El tamaño máximo por imagen es de 2 MB!');
        }

        var formData = new FormData();

        formData.append('chatID', chatInfo.chatID);
        formData.append('imagen', enviarChatImagen.current.files[0]);

        const data = await fetch('/perfil/mis-chats/nuevo-foto', {
            method: 'POST',
            body: formData,
        });

        const items = await data.json();

        if (items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if (items.respuesta === 'correcto') {

            setChatMensajes([...chatMensajes, {
                ID: items.imagenId,
                propio: true,
                imagen: true,
                mensaje: 'Foto.' + enviarChatImagen.current.files[0].type.split('/')[1],
                creadoEn: new Date()
            }
            ]);

            //

            updateMessage(seleccionado, 'Foto');
        }
    };

    //

    const cerrarChat = () => {
        navigate('/perfil/mis-chats');
        cambiarSeleccionado(null);
    };

    const addNewIcon = (icon) => {
        enviarChatMensaje.current.value += icon;
    };

    const comprobarDia = (fecha) => {

        const fechaAsDate = new Date(fecha);

        if (fechaComparar === null || fechaComparar.getDate() !== fechaAsDate.getDate() || (fechaComparar.getDate() === fechaAsDate.getDate() && fechaComparar.getMonth() !== fechaAsDate.getMonth())) {
            fechaComparar = fechaAsDate;
            return (
                <div className="mensaje-fecha">
                    {fechaComparar.toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })}
                </div>
            );
        }
        return '';
    };

    const colocarUltimaConexion = (conexion) => {
        if (conexion === null) return 'Desconocida';

        const fechaHoy = new Date();

        const ultimaConexion = new Date(conexion);
        const ultimaVez = fechaHoy.getDate() - ultimaConexion.getDate();

        if (ultimaVez === 0) {
            return 'Hoy a las ' + ultimaConexion.toLocaleTimeString('es-Es', horaOpc);

        } else if (ultimaVez === 1 && fechaHoy.getMonth() === ultimaConexion.getMonth()) {
            return 'Ayer a las ' + ultimaConexion.toLocaleTimeString('es-Es', horaOpc);

        } else {
            return ultimaConexion.toLocaleDateString('es-Es', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
        }
    }

    const comprobarRol = (esAdmin) => {

        if (esAdmin === false) return (<td style={{ width: '10px' }}> </td>);

        return (
            <>
                <td style={{ width: '10px' }}>
                </td>

                <td>
                    <FontAwesomeIcon icon={faPersonMilitaryRifle} style={{ backgroundColor: '#ff3636', padding: '8px', borderRadius: '10px', color: 'white' }} />
                </td>

                <td style={{ width: '10px' }}>
                </td>
            </>
        );
    }

    //

    const cerrarImagenChat = () => { setModalImagen(null) };

    const mostrarChatImagen = async (index) => {

        const param = chatInfo.chatID + '-' + chatMensajes[index].ID + '-' + chatMensajes[index].mensaje.split('.')[1];
        const imagen = await fetch('/perfil/mis-chats/chat-foto/' + param, { method: 'GET' });

        if (imagen.status === 200) {
            setModalImagen(imagen.url);
        }
    };

    //

    return (
        <>
            <div className="row">
                <div className="col-sm-6">

                    <table style={{ verticalAlign: 'middle' }}>

                        <tbody>
                            <tr>
                                <td>
                                    <FontAwesomeIcon icon={faArrowLeft} style={{ cursor: 'pointer', fontSize: '20px' }} onClick={cerrarChat} />
                                    &nbsp;&nbsp;&nbsp;
                                </td>

                                <td style={{ width: '70px' }}>
                                    <img
                                        className="rounded-pill img-fluid"
                                        src={chatImagen}
                                        alt="Imagen de perfil del usuario" />
                                </td>

                                {comprobarRol(chatInfo?.esAdmin)}

                                <td className="chat-titulo">
                                    {chatInfo?.nombre.toUpperCase()}
                                    <br />
                                    <small className="text-muted">
                                        {colocarUltimaConexion(chatInfo?.ultimaConexion)}
                                    </small>
                                </td>

                                <td style={{ width: '10px' }}>
                                </td>

                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <hr />

            <div className="chat-mensajes" id="mensajes-chat">

                {
                    chatMensajes.map((x, index) => (
                        <span key={index}>

                            {comprobarDia(x.creadoEn)}

                            <div className={x.propio === false ? 'mensaje' : 'mensaje mensaje-propio'}>

                                {x.imagen === true ? <FontAwesomeIcon icon={faImage} className="mensaje-img" onClick={() => mostrarChatImagen(index)} /> : x.mensaje}

                                <small className="mensaje-hora">
                                    &nbsp;&nbsp;{new Date(x.creadoEn).toLocaleTimeString('es-ES', horaOpc)}&nbsp;
                                </small>
                            </div>
                        </span>
                    ))
                }

            </div>

            <ChatIconos show={showIcon} pulsarIcono={addNewIcon} />

            <hr />

            <Form className="chat-input mt-2" onSubmit={enviarMensaje}>

                <FontAwesomeIcon className="chat-icon" icon={faCamera} onClick={() => { enviarChatImagen.current.click() }} />

                <FontAwesomeIcon className="chat-icon" icon={faFaceLaughBeam} onClick={() => setShowIcon(!showIcon)} />

                <Form.Control type="text" placeholder="Escribe tu mensaje aquí!" maxLength="150" ref={enviarChatMensaje} />

                <FontAwesomeIcon className="chat-icon" style={{ color: '#6060f8' }} icon={faPaperPlane} onClick={enviarMensaje} />
            </Form>

            <input type="file" accept="image/*" ref={enviarChatImagen} onChange={enviarImagen} style={{ display: 'none' }} />

            <MensajeImagen imagen={modalImagen} funcionCerrar={cerrarImagenChat} />
        </>
    );
}

export default ChatBox;