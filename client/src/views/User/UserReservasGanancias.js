import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faCalendar, faDownload } from '@fortawesome/free-solid-svg-icons';

import Button from 'react-bootstrap/Button';

var totalGanancias = [];
const cantidadColumnas = 5;

function UserReservasGanancias({ changeLogged }) {

    const navigate = useNavigate();

    //

    const [ganancias, setGanancias] = useState({});
    const [gananciasInfo, setGananciasInfo] = useState([]);

    useEffect(() => {
        obtenerGanancias();
    }, []);

    const obtenerGanancias = async (mes) => {
        const data = await fetch('/perfil/mis-ganancias/' + mes, { method: 'GET' });
        const items = await data.json();

        if (items.respuesta === 'err_user') {
            changeLogged(false);

        } else if (items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if (items.respuesta === 'correcto') {
            setGanancias(items.mesInfo);

            setGananciasInfo(items.reservasInfo.splice(0, cantidadColumnas));
            totalGanancias = items.reservasInfo;
        }
    };

    const obtenerMesAnterior = () => {
        obtenerGanancias(ganancias.mesAnteriorNumero + '-' + ganancias.yearAnteriorNumero);
    }

    const obtenerMesSiguiente = () => {
        obtenerGanancias(ganancias.mesSiguienteNumero + '-' + ganancias.yearSiguienteNumero);
    }

    const descargarFactura = async (tipo) => {

        var totalArray = gananciasInfo.concat(totalGanancias);

        cambiarBotonesDescarga(true);

        const data = await fetch('/perfil/mis-ganancias/descargar/' + tipo,
            {
                method: 'POST',

                body: JSON.stringify({
                    mesNombre: ganancias.mes,
                    mesYear: ganancias.year,

                    primerDia: ganancias.primerDia,
                    ultimoDia: ganancias.ultimoDia,

                    reservas: totalArray,

                    totalGanancias: ganancias.totalGanancias,

                    //

                    clienteNombre: ganancias.clienteNombre,
                    clienteResidencia: ganancias.clienteResidencia,
                }),

                headers: {
                    'Content-Type': 'application/json'
                },
            });

        if (data.status === 200) {
            const items = await data.blob();

            var a = document.createElement("a");
            a.href = window.URL.createObjectURL(items);
            a.download = ganancias?.mes + '-' + ganancias?.year + '.' + tipo;
            a.click();

            crearAlerta('exito', '¡Archivo descargado!');
        }

        cambiarBotonesDescarga(false);
    };

    const mostrarMasGanancias = () => {
        setGananciasInfo([...gananciasInfo, ...totalGanancias]);
        totalGanancias = [];
    };

    const mostrarMenosGanancias = () => {
        setGananciasInfo(gananciasInfo.splice(0, cantidadColumnas));
        totalGanancias = gananciasInfo;
    };

    const cambiarBotonesDescarga = (estado) => {
        const btnPdf = document.getElementById('descargar-btn-pdf');
        const btnCsv = document.getElementById('descargar-btn-csv');

        btnPdf.disabled = estado;
        btnCsv.disabled = estado;
    };

    //

    return (
        <div className="container-fluid mb-5">
            <div className="row">
                <div className="col">

                    <button className="btn-no-style" onClick={() => { navigate('/perfil/mis-reservas'); }}>
                        Mis reservas
                    </button>

                    <span className="vista-separador">/</span>

                    <button className="btn-no-style" onClick={() => { navigate('/perfil/mis-reservas/alojamientos'); }}>
                        Mis alojamientos
                    </button>

                    <span className="vista-separador">/</span>

                    <button className="btn-no-style btn-activo">
                        Mis ganancias
                    </button>
                </div>
            </div>

            <hr />

            <h4 style={{ fontWeight: 'bold' }}>
                {ganancias?.mes} DE {ganancias?.year}
            </h4>

            <small className="text-muted">
                {ganancias?.primerDia} - {ganancias?.ultimoDia}
            </small>

            <span style={window.innerWidth < 600 ? { display: ganancias?.reservas === 0 ? 'none' : '' } : { float: 'right', display: ganancias?.reservas === 0 ? 'none' : '' }}>

                <br style={window.innerWidth < 600 ? {} : { display: 'none' }} />

                <Button className="crear-botones" size="sm" onClick={() => { descargarFactura('csv'); }} id="descargar-btn-csv">
                    <FontAwesomeIcon icon={faDownload} /> Descargar .csv
                </Button>

                &nbsp;

                <Button className="borrar-botones" size="sm" onClick={() => { descargarFactura('pdf'); }} id="descargar-btn-pdf">
                    <FontAwesomeIcon icon={faDownload} /> Descargar .pdf
                </Button>
            </span>

            <hr />

            <div className="row" style={ganancias?.reservas === 0 ? {} : { display: 'none' }}>
                <div className="col">
                    <h4>
                        No hay datos sobre este mes.
                    </h4>

                    <hr />
                </div>
            </div>

            <div className="row" style={ganancias?.reservas > 0 ? {} : { display: 'none' }}>
                <div className="col">

                    <table className="table">
                        <tbody>
                            <tr>
                                <td>
                                    ID:
                                </td>
                                <td>
                                    {ganancias?.clienteID}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Cliente:
                                </td>
                                <td>
                                    {ganancias?.clienteNombre}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Reservas:
                                </td>
                                <td>
                                    {ganancias?.reservas}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                </div>
                <div className={window.innerWidth < 600 ? '' : "col"}>

                    <table className="table">
                        <thead>
                            <tr>
                                <td>
                                    ID
                                </td>
                                <td>
                                    Info
                                </td>
                                <td>
                                    Coste
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                gananciasInfo?.map((x, index) => (
                                    <tr key={index}>
                                        <td>
                                            {x.ID}
                                        </td>
                                        <td>
                                            <small className="text-muted">
                                                {x.dias} noches x {x.precioBase}€
                                            </small>
                                        </td>
                                        <td>
                                            {x.costeTotal.toLocaleString("de-DE")}€
                                        </td>
                                    </tr>
                                ))
                            }

                            <tr style={totalGanancias.length !== 0 ? {} : { display: 'none' }}>
                                <td>...</td>
                                <td>...</td>
                                <td>...</td>
                            </tr>

                            <tr style={{ fontWeight: 'bold' }}>
                                <td>
                                    Total:
                                </td>
                                <td>
                                </td>
                                <td>
                                    {ganancias?.totalGanancias?.toLocaleString("de-DE")}€
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="text-center">
                        <Button className="filtros-botones text-center" size="sm" onClick={mostrarMasGanancias} style={totalGanancias.length !== 0 ? {} : { display: 'none' }}>
                            <FontAwesomeIcon icon={faArrowDown} /> Mostrar todo
                        </Button>

                        <Button className="filtros-botones text-center" size="sm" onClick={mostrarMenosGanancias} style={totalGanancias.length === 0 && gananciasInfo?.length > cantidadColumnas ? {} : { display: 'none' }}>
                            <FontAwesomeIcon icon={faArrowUp} /> Mostrar menos
                        </Button>
                    </div>
                </div>
            </div>

            <Button className="filtros-botones" size="sm" onClick={obtenerMesAnterior}>
                <FontAwesomeIcon icon={faCalendar} /> {ganancias?.mesAnterior} DE {ganancias?.yearAnteriorNumero}
            </Button>

            &nbsp;&nbsp;

            <Button className="crear-botones" size="sm" style={ganancias?.mesSiguiente !== '' ? {} : { display: 'none' }} onClick={obtenerMesSiguiente}>
                <FontAwesomeIcon icon={faCalendar} /> {ganancias?.mesSiguiente} DE {ganancias?.yearSiguienteNumero}
            </Button>

        </div>
    );
}

export default UserReservasGanancias;