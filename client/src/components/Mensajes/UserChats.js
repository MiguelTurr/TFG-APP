import React, {useState, useEffect, useRef } from "react";

import NoProfileImg from '../../img/no-profile-img.png';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";

function Mensaje({ children }) {
    const ref = useRef();
  
    useEffect(() => {
        if (ref.current) {
            const element = document.getElementById('mensajes-chat');
            element.scrollTo(element.scrollHeight, element.scrollHeight);
        }
    }, []);
  
    return (
        <div ref={ref} style={children.propio === false ? { marginRight: '8px', marginBottom: '18px' } : { textAlign: 'right', marginRight: '8px', marginBottom: '18px' } }>
            <span style={children.propio === false ? { backgroundColor: '#494949', padding: '8px', borderRadius: '25px' } : { backgroundColor: '#6060f8', padding: '8px', borderRadius: '25px' } }>
                
                {children.texto}
            </span>
        </div>
    );
}

function UserChats() {

    const [chats, setChats] = useState([]);
    const [chatIndex, setChatIndex] = useState(null);
    const [chatSeleccionado, setChatSeleccionado] = useState(null);
    const [chatMensajes, setChatMensajes] = useState([]);

    useEffect(() => {
        obtenerChats();
    }, []);

    const obtenerChats = async () => {
        const data = await fetch('/perfil/mis-chats', { method: 'GET' });
        const items = await data.json();

        if(items.respuesta === 'correcto') {
            setChats(items.chats);
        }
    };

    const abrirChat = (index) => {
        setChatSeleccionado(chats[index]);
        setChatMensajes(chats[index].mensajes);
        setChatIndex(index);
    };

    const volverAtras = () => {
        setChatSeleccionado(null);
        setChatIndex(null);
    };

    const enviarMensaje = () => {

        const element = document.getElementById('envia-mensaje');

        if(element.value === '') {
            return;
        }

        setChatMensajes([...chatMensajes, { 
            texto: element.value,
            propio: true}]);

        element.value = '';
    };

    return (
        <div className="container-fluid">
            <div className="row">

                <div className="col-sm-4" style={window.innerWidth < 600 && chatSeleccionado !== null ? { display: 'none' } : { }}>

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
                                            src={NoProfileImg}
                                            alt="Imagen de perfil del usuario" />
                                    </td>
                                    <td>
                                        {x.nombre}
                                        <br />
                                        {x.mensajes[0].texto.substring(0, 12)} {x.mensajes[0].texto.length > 12 ? '...' : ''}
                                    </td>

                                    <td style={{ textAlign: 'right'}}>
                                        {x.fecha}
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

                <div className="col" style={window.innerWidth < 600 && chatSeleccionado === null ? { display: 'none' } : { }}>

                    <div style={ chatSeleccionado !== null ? {} : { display: 'none' } }>
                            
                        <span style={window.innerWidth > 600 && chatSeleccionado !== null ? { display: 'none' } : { }}>  
                            <Button onClick={volverAtras} className="rounded-pill filtros-botones">
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </Button>

                            &nbsp;&nbsp;&nbsp;
                        </span>

                        <span style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '1em' }}>

                            {chatSeleccionado?.nombre.toUpperCase()}
                        </span>

                        <hr/>

                        <div style={{ height: '250px', overflowY: 'auto', color: 'white' }} id="mensajes-chat">

                            <br/>

                            {
                                chatMensajes.map((x, index) => (<>
                                    <Mensaje key={index}>{x}</Mensaje>
                                </>))
                            }

                        </div>

                        <div className="input-group mb-3">
                            <input type="text" className="form-control" placeholder="Escribe un mensaje" id="envia-mensaje" />
                            
                            <Button className="filtros-botones" size="sm" onClick={enviarMensaje}>
                                <FontAwesomeIcon icon={faPaperPlane} /> Enviar
                            </Button>
                        </div>

                    </div>

                    <div style={ chatSeleccionado === null ? {} : {display: 'none'} }>

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