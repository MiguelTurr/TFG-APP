import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { crearAlerta } from '../Toast/Toast.js';
import ChatBox from './ChatBox.js';

import NoProfileImg from '../../img/no-profile-img.png';
import './Chats.css';

const fechaOpc = { year: 'numeric', month: '2-digit', day: '2-digit' };
const horaOpc = { hour: '2-digit', minute: '2-digit' };

function ChatList({ changeLogged }) {

    const navigate = useNavigate();
    const { id } = useParams();

    //

    const [chats, setChats] = useState([]);
    const [chatProfileImage, setChatProfileImage] = useState([]);

    const [chatSeleccionado, setChatSeleccionado] = useState(null);

    //

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

                const perfil = await fetch('/alojamiento/imagen/hospedador/' +items.chats[i].hablarID, { method: 'GET' });
    
                if(perfil.status === 200) {
                    arrayPerfiles.push(perfil.url);
    
                } else {
                    arrayPerfiles.push(NoProfileImg);
                }
            }
            setChatProfileImage(arrayPerfiles);

            if(id !== undefined) {
                var index = -1;

                for (var i = 0; i < len; i++) {

                    if (parseInt(items.chats[i].hablarID) !== parseInt(id)) {
                        continue;
                    }
                    index = i;
                    break;
                }

                if(index === -1) {
                    return crearNuevoChat(id);
                }

                setChatSeleccionado(index);
            }
        }
    };

    const crearNuevoChat = async (id) => {
        const data = await fetch('/perfil/mis-chats/start-chat/' +id, { method: 'GET' });
        const items = await data.json();

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');
            navigate('/perfil/mis-chats');

        } else if(items.respuesta === 'err_user') {
            changeLogged(false);

        } else if(items.respuesta === 'correcto') {
            setChats(chats => [items.nuevoChat, ...chats]);

            const perfil = await fetch('/alojamiento/imagen/hospedador/' +id, { method: 'GET' });
    
            if(perfil.status === 200) {
                 setChatProfileImage(chatProfileImage => [ perfil.url, ...chatProfileImage]);
    
            } else {
                setChatProfileImage(chatProfileImage => [ NoProfileImg, ...chatProfileImage]);
            }

            setChatSeleccionado(0);
        }
    };

    const abrirChat = (index) => {

        if(index === chatSeleccionado) return;

        navigate('/perfil/mis-chats/' +chats[index].hablarID);
        setChatSeleccionado(index);
    };

    const updateMessageChat = (index, mensaje) => {

        var array = [...chats];
        array[index].propio = true;

        if(mensaje === 'Foto') array[index].imagen = true;
        
        array[index].mensaje = mensaje;
        array[index].fecha = new Date();
        setChats(array);
    };

    const updateSinLeer = (index) => {

        var array = [...chats];
        array[index].sinLeer = 0;
        setChats(array);
    };

    //

    const ultimoMensaje = (propio, mensaje) => {

        if(propio === null) return 'No hay ningún mensaje';

        if(propio === true) {
            return (
                <>
                    <span style={{color: '#4349ff'}}>
                        Tú:&nbsp;
                    </span>
                    {mensaje.substring(0, 8)} {mensaje.length > 8 ? '...' : ''}
                </>
            );
        }
        return (
            <>
                {mensaje.substring(0, 8)} {mensaje.length > 8 ? '...' : ''}
            </>
        );
    };

    const esMensajeHoy = (hoy, fecha) => {

        if(fecha === null) return '';

        if(hoy === false) {
            return new Date(fecha).toLocaleDateString('es-ES', fechaOpc);
        }
        return new Date(fecha).toLocaleTimeString('es-ES', horaOpc);
    };

    const mensajesSinLeer = (cantidad) => {
        if(cantidad === 0) return '';
        return (
            <>
                &nbsp;&nbsp;
                <span style={{ backgroundColor: '#ffaf2b', padding: '8px', borderRadius: '20px' }}>
                    &nbsp;{cantidad}&nbsp;
                </span>
            </>
        );
    };

    //

    if(window.innerWidth < 600 && chatSeleccionado !== null) {
        return (
            <div className="container-fluid mb-3">
                <div className="row">
                    <div className="col">
                        <ChatBox 
                            seleccionado={chatSeleccionado}
                            cambiarSeleccionado={setChatSeleccionado}
                            chatInfo={chats[chatSeleccionado]}
                            chatImagen={chatProfileImage[chatSeleccionado]}
                            updateMessage={updateMessageChat} 
                            updateSinLeer={updateSinLeer} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container-fluid mb-3">
            <div className="row">

                <div className="col-sm-4">

                    <h5 style={{ fontWeight: 'bold', textAlign: 'center' }}>
                        CHATS
                    </h5>

                    <hr />

                    <table className="table">

                        <tbody style={{ verticalAlign: 'middle', fontWeight: 'bold', fontSize: '13px'}}>

                            {
                                chats.map((x, index) => (
                                    <tr className="tabla-seleccion" key={index} onClick={() => { abrirChat(index) }} style={chatSeleccionado === index ? { backgroundColor: 'rgb(240, 240, 240)' } : {}}>

                                        <td style={{ width: '20%' }}>
                                            <img
                                                className="img-fluid rounded-pill"
                                                src={chatProfileImage[index]}
                                                alt="Imagen de perfil del usuario" />
                                        </td>
                                        <td>
                                            {x.nombre}
                                            <br />
                                            {ultimoMensaje(x.propio, x.mensaje)}
                                        </td>

                                        <td style={{ textAlign: 'right'}}>

                                            <span>
                                                {esMensajeHoy(x.hoy, x.fecha)}
                                            </span>
                                                                            
                                            {mensajesSinLeer(x.sinLeer)}
                                        </td>
                                    </tr>
                                ))
                            }

                        </tbody>
                    </table>
                </div>

                <div className="col">
                    <ChatBox 
                        seleccionado={chatSeleccionado}
                        cambiarSeleccionado={setChatSeleccionado}
                        chatInfo={chats[chatSeleccionado]}
                        chatImagen={chatProfileImage[chatSeleccionado]}
                        updateMessage={updateMessageChat} 
                        updateSinLeer={updateSinLeer} />
                </div>
            </div>
        </div>
    )
}

export default ChatList;