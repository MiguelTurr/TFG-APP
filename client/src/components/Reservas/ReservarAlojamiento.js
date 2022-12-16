import React,{ useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";

import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faLocationDot, faStar, faSquareCheck } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";

function ReservarAlojamiento() {

    var opcFecha = { year: 'numeric', month: 'short', day: '2-digit' };

    const { id } = useParams();

    const location = useLocation();
    const params = new URLSearchParams(location.search);

    //

    const [alojamiento, setAlojamiento] = useState({});
    const [aloImg, setAloImg] = useState();
    const [reserva, setReserva] = useState({});

    useEffect(() => {

        const fechaEntrada = new Date(params.get('entrada'));
        const fechaSalida = new Date(params.get('salida'));

        const entradaStr = fechaEntrada.toLocaleDateString('es-ES', opcFecha);
        const salidaStr = fechaSalida.toLocaleDateString('es-ES', opcFecha);

        const splitEntrada = entradaStr.split(' ');
        const splitSalida = salidaStr.split(' ');

        var finalStr = '';

        if(splitEntrada[1] === splitSalida[1]) {
            finalStr = fechaEntrada.getDate()+ ' - ' +fechaSalida.getDate()+ ' ' +splitEntrada[1]+ ' ' +splitEntrada[2];

        } else {
            finalStr = fechaEntrada.getDate()+ ' '+splitEntrada[1]+ ' - ' +fechaSalida.getDate()+ ' ' +splitSalida[1]+ ' ' +splitEntrada[2];
        }

        setReserva({
            alojamientoID: id,
            fechaFinal: finalStr,
            personas: params.get('personas'),
            mascotas: params.get('mascotas'),
            noches: Math.round((fechaSalida.getTime() - fechaEntrada.getTime()) / (1000 * 60 * 60 * 24))
        });

        obtenerAlojamiento(id);

    }, [location.search]);

    const obtenerAlojamiento = async (alojamientoID) => {

        const data = await fetch('/alojamiento/reservar/' +alojamientoID, { method: 'GET' });
        const items = await data.json();

        if (items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if (items.respuesta === 'correcto') {
            setAlojamiento(items.alojamiento);

            const imagen = await fetch('/alojamiento/imagen/' +alojamientoID+ '-0', { 
                method: 'GET',
        
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if(imagen.status === 200) {
                setAloImg(imagen.url);
            }
        }
    };

    //

    const volverAtras = () => {
        window.location.href = '/alojamiento/ver?casa=' +alojamiento.ID;
    };

    const confirmarReserva = async () => {

        const data = await fetch('/alojamiento/reservar', { 
            method: 'POST',
            body: JSON.stringify({
                alojamientoID: alojamiento.ID,
                fechaEntrada: params.get('entrada'),
                fechaSalida: params.get('salida'),
                costeTotal: reserva.noches * alojamiento.precio,
            }),
            
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();

        if (items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if (items.respuesta === 'correcto') {
            crearAlerta('exito', '¡Reserva hecha!');

            setTimeout(() => {
                window.location.href = '/';

            }, 1000);
        }
    };

    //

    return (
        <div className="container-fluid">
            <Button className="filtros-botones" size="sm" onClick={volverAtras}>
                <FontAwesomeIcon icon={faArrowLeft} /> Volver
            </Button>

            <hr />
            <div className="row">
                <div className="col">

                    <h4 style={{ fontWeight: 'bold'}}>
                        RESERVAR ALOJAMIENTO
                    </h4>

                    <hr/>

                    <table className="table">

                        <tbody>
                            <tr>
                                <td>
                                    Fechas:
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    {reserva.fechaFinal}
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    Personas:
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    {reserva.personas}
                                </td>
                            </tr>

                            <tr style={ reserva.mascotas > 0 ? {} : { display: 'none' }}>
                                <td>
                                    Mascotas:
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    {reserva.mascotas}
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    Coste:
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    {alojamiento.precio}€ <small className="text-muted">(base)</small> x {reserva.noches} <small className="text-muted">(noches)</small>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    Comisión:
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    10%
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    Total:
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <strong>
                                        {reserva.noches * alojamiento.precio}€
                                    </strong>
                                    &nbsp;
                                    <small className="text-muted">(IVA incluido)</small>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <Button className="filtros-botones" size="sm" onClick={confirmarReserva}>
                        <FontAwesomeIcon icon={faSquareCheck} /> Confirmar reserva
                    </Button>

                </div>
                <div className="col">

                    <h4 style={{ fontWeight: 'bold'}}>
                        DETALLES ALOJAMIENTO
                    </h4>

                    <hr/>
                    <div className="row">
                        <div className="col-sm-4">
                            <img 
                                src={aloImg}
                                key={aloImg}
                                className="img-fluid"
                                alt="Imagen de perfil del usuario"></img>
                        </div>
                        <div className="col">
                            
                            <FontAwesomeIcon icon={faLocationDot} style={{ color: 'green' }} /> {alojamiento.ubicacion}
                            <br/>
                            <FontAwesomeIcon icon={faStar} /> {alojamiento.valoracionMedia} <span className="text-muted">({alojamiento.vecesValorado})</span>
                        </div>
                    </div>
                </div>
            </div>

            <hr/>

            <div className="row">
                <div className="col">
                    <h4 style={{ fontWeight: 'bold'}}>
                        MÉTODO DE PAGO
                    </h4>

                    <hr/>

                    Paypal no se que nose crearNuevoAlojamiento

                    <hr/>

                    <Button className="filtros-botones" size="sm" onClick={confirmarReserva}>
                        <FontAwesomeIcon icon={faSquareCheck} /> Confirmar reserva
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ReservarAlojamiento;