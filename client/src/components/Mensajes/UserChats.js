import React, {useState, useEffect } from "react";

import { useLocation } from "react-router-dom";

import { crearAlerta } from '../Toast/Toast.js';

import NoProfileImg from '../../img/no-profile-img.png';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";

const fechaOpc = { year: 'numeric', month: '2-digit', day: '2-digit' };
const horaOpc = { hour: '2-digit', minute: '2-digit' };

function UserChats() {

    const location = useLocation();

    //

    const [chats, setChats] = useState([]);
    const [userImg, setUserImg] = useState([]);

    const [chatIndex, setChatIndex] = useState(null);
    const [chatMensajes, setChatMensajes] = useState([]);

    const [nuevoChat, setNuevoChat] = useState(null);
    const [nuevoMensajes, setNuevoMensajes] = useState([]);

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

        if(items.respuesta === 'correcto') {
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
        const data = await fetch('/perfil/mis-chats/chat/' +chats[index].chatID, { method: 'GET' });
        const items = await data.json();

        if(items.respuesta === 'correcto') {
            setChatMensajes(items.mensajes);
            setChatIndex(index);

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

    const enviarNuevoMensaje = async () => {

        const element = document.getElementById('envia-mensaje-nuevo');
        const mensaje = element.value;

        if(mensaje === '') {
            return;

        }
        element.value = '';

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

    const enviarMensaje = async () => {

        const element = document.getElementById('envia-mensaje');
        const mensaje = element.value;

        if(mensaje === '') {
            return;

        }
        element.value = '';

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

                        <span style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '1em' }}>
                            {nuevoChat?.nombre.toUpperCase()}
                        </span>

                        <hr />

                        <div style={{ height: '250px', overflowY: 'auto', color: 'white' }}>

                            <br/>

                            {
                                nuevoMensajes.map((x, index) => (

                                    <div key={index} style={x.propio === false ? { marginRight: '8px', marginBottom: '18px' } : { textAlign: 'right', marginRight: '8px', marginBottom: '18px' } }>
                                        <span style={x.propio === false ? { backgroundColor: '#494949', padding: '8px', borderRadius: '25px' } : { backgroundColor: '#6060f8', padding: '8px', borderRadius: '25px' } }>
                                            
                                            {x.mensaje} 
                                            <small  style={{  verticalAlign: 'bottom', fontSize: '11px', fontWeight: 'bold' }}>
                                                &nbsp; { new Date(x.creadoEn).toLocaleTimeString('es-ES', horaOpc) }&nbsp;
                                            </small>
                                        </span>
                                    </div>
                                ))
                            }

                        </div>

                        <div className="input-group mb-3">
                            <input type="text" className="form-control" placeholder="Escribe un mensaje" id="envia-mensaje-nuevo" />
                            
                            <Button className="filtros-botones" size="sm" onClick={enviarNuevoMensaje}>
                                <FontAwesomeIcon icon={faPaperPlane} /> Enviar
                            </Button>
                        </div>

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

                        <span style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '1em' }}>
                            {chats[chatIndex]?.nombre.toUpperCase()}
                        </span>

                        <hr/>

                        <div style={{ height: '250px', overflowY: 'auto', color: 'white' }} id="mensajes-chat">

                            <br/>

                            {
                                chatMensajes.map((x, index) => (
                                    <div key={index} style={x.propio === false ? { marginRight: '8px', marginBottom: '18px' } : { textAlign: 'right', marginRight: '8px', marginBottom: '18px' } }>
                                        <span style={x.propio === false ? { backgroundColor: '#494949', padding: '8px', borderRadius: '25px' } : { backgroundColor: '#6060f8', padding: '8px', borderRadius: '25px' } }>
                                            
                                            {x.mensaje} 
                                            <small  style={{  verticalAlign: 'bottom', fontSize: '11px', fontWeight: 'bold' }}>
                                                &nbsp; { new Date(x.creadoEn).toLocaleTimeString('es-ES', horaOpc) }&nbsp;
                                            </small>
                                        </span>
                                    </div>
                                ))
                            }

                        </div>

                        <div className="input-group mb-3">
                            <input type="text" className="form-control" placeholder="Escribe un mensaje" id="envia-mensaje" />
                            
                            <Button className="filtros-botones" size="sm" onClick={enviarMensaje}>
                                <FontAwesomeIcon icon={faPaperPlane} /> Enviar
                            </Button>
                        </div>

                    </div>

                    <div style={ chatIndex === null && nuevoChat === null ? {} : {display: 'none'} }>

                        <h5 style={{ fontWeight: 'bold', fontSize: '15px', textAlign: 'center', marginTop: '25%' }}>
                            <span style={{backgroundColor: '#494949', padding: '10px', borderRadius: '25px', color: 'white' }}>
                                Selecciona un chat para empezar a hablar
                            </span>
                        </h5>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserChats;