import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";

const fechaOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
const horaOptions = { hour: '2-digit', minute: '2-digit' };

var totalReportes = [];
const totalPagina = 5;

function AdminReportes({ changeLogged }) {

    const navigate = useNavigate();

    //

    const [reportesList, setReportesList] = useState([]);
    const [paginacion, setPaginacion] = useState(0);
    const [maxPagina, setMaxPagina] = useState(0);

    useEffect(() => {
        obtenerReportes();
    }, []);

    const obtenerReportes = async () => {
        const data = await fetch('/admin/reportes', { method: 'GET' });
        const items = await data.json();

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'err_rol') {
            window.localStorage.setItem('isAdmin', 0);
            window.location.href = '/';

        } else if(items.respuesta === 'correcta') {
            totalReportes = items.reportes;

            setReportesList(totalReportes.slice(0, totalPagina));
            setPaginacion(0);
    
            var paginas = Math.floor(totalReportes.length / totalPagina);
            if(totalReportes.length % totalPagina === 0) {
                paginas --;
            }
            setMaxPagina(paginas);
        }
    };

    const restarPagina = () => {

        const primeraPagina = (paginacion - 1) * totalPagina;
        const ultimaPagina = primeraPagina + totalPagina;

        setPaginacion(paginacion - 1);
        setReportesList(totalReportes.slice(primeraPagina, ultimaPagina));
    }; 

    const sumarPagina = () => {

        const primeraPagina = (paginacion + 1) * totalPagina;
        const ultimaPagina = primeraPagina + totalPagina;

        setPaginacion(paginacion + 1);
        setReportesList(totalReportes.slice(primeraPagina, ultimaPagina));
    }; 

    return (
        <div className="container-fluid">
            <h4 style={{ fontWeight: 'bold' }}>
                ADMINISTRACIÓN &gt; REPORTES
            </h4>

            <hr />

            <div className="row">
                <div className="col">

                    <Button className="filtros-botones" size="sm" onClick={() => { navigate('/admin'); }}>
                        <FontAwesomeIcon icon={faArrowLeft} /> Volver
                    </Button>
                    
                    <hr/>

                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>
                                        ID
                                    </th>
                                    <th>
                                        Fecha
                                    </th>
                                    <th>
                                        Usuario
                                    </th>
                                    <th>
                                        Reportado
                                    </th>
                                    <th>
                                        Mensaje
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {
                                    reportesList.map((e, index) => (
                                        <tr key={index}>
                                            <td>
                                                {e.ID}
                                            </td>
                                            <td>
                                                {new Date(e.creadoEn).toLocaleDateString('es-ES', fechaOptions)} a las {new Date(e.creadoEn).toLocaleTimeString('es-ES', horaOptions)}
                                            </td>
                                            <td>
                                                <a href={'/usuario/ver/' +e.usuarioID} target="_blank" rel="noopener">
                                                    {e.userNombre}
                                                </a>
                                            </td>
                                            <td>
                                                <a href={'/usuario/ver/' +e.reportadoID} target="_blank" rel="noopener">
                                                    {e.reportedNombre}
                                                </a>
                                            </td>
                                            <td>
                                                {e.mensaje}
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>

                    <div className="col" style={maxPagina > 0 ? {} : { display: 'none' }}>

                        <Button className="filtros-botones" size="sm" disabled={paginacion === 0} onClick={restarPagina}>
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </Button>

                        &nbsp;

                        <span style={{ fontWeight: 'bold' }}>
                            {paginacion} / {maxPagina}
                        </span>

                        &nbsp;

                        <Button className="filtros-botones" size="sm" disabled={paginacion === maxPagina} onClick={sumarPagina}>
                            <FontAwesomeIcon icon={faArrowRight} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReportes;