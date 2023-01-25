import React, { useState, useEffect } from "react";

import { crearAlerta } from '../Toast/Toast.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

import Button from "react-bootstrap/esm/Button";

const creacionOptions = { year: 'numeric', month: 'short', day: 'numeric' };
var totalAlojamientos = [];
const totalPagina = 6;

function AdminAlojamientos({ show, cambiarVista }) {

    const [alojamientosList, setAlojamientosList] = useState([]);
    const [paginacion, setPaginacion] = useState(0);
    const [maxPagina, setMaxPagina] = useState(0);

    useEffect(() => {
        obtenerAlojamientos();
    }, [show]);

    const obtenerAlojamientos = async () => {
        if(show !== 'alojamientos') return;

        const data = await fetch('/admin/alojamientos', { method: 'GET' });
        const items = await data.json();

        if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'err_rol') {
            window.localStorage.setItem('isAdmin', 0);
            window.location.href = '/';

        } else if(items.respuesta === 'correcta') {
            totalAlojamientos = items.alojamientos;

            setAlojamientosList(totalAlojamientos.slice(0, totalPagina));
            setPaginacion(0);
    
            var paginas = Math.floor(totalAlojamientos.length / totalPagina);
            if(totalAlojamientos.length % totalPagina === 0) {
                paginas --;
            }
            setMaxPagina(paginas);
        }
    };

    if(show !== 'alojamientos') return(<> </>);

    const restarPagina = () => {

        const primeraPagina = (paginacion - 1) * totalPagina;
        const ultimaPagina = primeraPagina + totalPagina;

        setPaginacion(paginacion - 1);
        setAlojamientosList(totalAlojamientos.slice(primeraPagina, ultimaPagina));
    }; 

    const sumarPagina = () => {

        const primeraPagina = (paginacion + 1) * totalPagina;
        const ultimaPagina = primeraPagina + totalPagina;

        setPaginacion(paginacion + 1);
        setAlojamientosList(totalAlojamientos.slice(primeraPagina, ultimaPagina));
    }; 

    //

    return (
        <div className="row">
            <div className="col">

                <Button className="filtros-botones" size="sm" onClick={() => { cambiarVista('general') }}>
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
                                    Creado
                                </th>
                                <th>
                                    Dueño
                                </th>
                                <th>
                                    Ubicación
                                </th>
                                <th>
                                    Precio
                                </th>
                                <th>
                                    Valoración
                                </th>
                            </tr>
                        </thead>

                        <tbody>

                            {
                                alojamientosList.map((e, index) => (
                                    <tr key={index}>
                                        <td>
                                            {e.ID}
                                        </td>
                                        <td>
                                            {new Date(e.creadoEn).toLocaleDateString('es-ES', creacionOptions)}
                                        </td>
                                        <td>
                                            <a href={'/usuario/ver/' +e.userId} target="_blank">
                                                {e.userNombre}
                                            </a>
                                        </td>
                                        <td>
                                            <a href={'/alojamiento/ver/' +e.ID} target="_blank">
                                                {e.ubicacion}
                                            </a>
                                        </td>
                                        <td>
                                            {e.precio}€
                                        </td>
                                        <td>
                                            {e.valoracionMedia} ({e.vecesValorado})
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
    );
};

export default AdminAlojamientos;