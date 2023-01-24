import React, { useState, useEffect } from "react";

import { crearAlerta } from '../Toast/Toast.js';

import './Admin.css';
import AdminUsuarios from './AdminUsuarios';
import AdminAlojamientos from './AdminAlojamientos';
import AdminReportes from './AdminReportes';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckDouble, faFlag, faHouse, faRankingStar, faStar, faUser } from '@fortawesome/free-solid-svg-icons';

function Admin({ changeLogged }) {

    const [datosAdmin, setDatosAdmin] = useState({});
    const [vistaAdmin, setVistaAdmin] = useState('general');

    useEffect(() => {
        adminPagina();
    }, []);

    const adminPagina = async () => {
        const data = await fetch('/admin', { method: 'GET' });
        const items = await data.json();

        if(items.respuesta === 'err_user') {
            changeLogged(false);

        } else if(items.respuesta === 'err_rol') {
            window.localStorage.setItem('isAdmin', 0);
            window.location.href = '/';

        } else if(items.respuesta === 'err_db') {
            crearAlerta('error', '¡Ha ocurrido un error con la base de datos!');

        } else if(items.respuesta === 'correcta') {
            setDatosAdmin(items.admin);
        }
    };

    //

    return (
        <div className="container-fluid">
            <h4 style={{ fontWeight: 'bold' }}>
                ADMINISTRACIÓN &gt; {vistaAdmin.toUpperCase()}
            </h4>

            <hr />

            <div className="row" style={ vistaAdmin === 'general' ? {} : { display: 'none' } }>

                <div className="container-fluid" style={{ width: '80%' }}>

                    <div className="row">

                        <div className={window.innerWidth < 600 ? 'mb-3' : "col mb-3"}>
                            <div className="cuadro-seleccionable" onClick={() => { setVistaAdmin('alojamientos'); }}>

                                <FontAwesomeIcon icon={faHouse} style={{ fontSize: '80px' }} />
                                <br />

                                <span style={{ fontSize: '30px' }}>{datosAdmin.alojamientos}</span>
                                <br />
                                ALOJAMIENTOS
                            </div>
                        </div>

                        <div className={window.innerWidth < 600 ? 'mb-3' : "col mb-3"}>
                            <div className="cuadro-seleccionable" onClick={() => { setVistaAdmin('usuarios'); }}>

                                <FontAwesomeIcon icon={faUser} style={{ fontSize: '80px' }} />
                                <br />
                                <span style={{ fontSize: '30px' }}>
                                    {datosAdmin.usuarios}
                                </span>
                                <br />
                                USUARIOS
                            </div>
                        </div>

                        <div className={window.innerWidth < 600 ? 'mb-3' : "col"}>
                            <div className="cuadro-seleccionable" onClick={() => { setVistaAdmin('reportes'); }}>

                                <FontAwesomeIcon icon={faFlag} style={{ fontSize: '80px' }} />
                                <br />

                                <span style={{ fontSize: '30px' }}>{datosAdmin.reportes}</span>
                                <br />
                                REPORTES
                            </div>
                        </div>
                    </div>

                    <div className="row">

                        <div className={window.innerWidth < 600 ? 'mb-3' : "col mb-3"}>
                            <div className="cuadro-normal">

                                <FontAwesomeIcon icon={faStar} style={{ fontSize: '80px' }} />
                                <br />

                                <span style={{ fontSize: '25px' }}>{datosAdmin.alojamientosValorados}</span>
                                <br />
                                ALOJAMIENTOS VALORADOS
                            </div>
                        </div>

                        <div className={window.innerWidth < 600 ? 'mb-3' : "col"}>
                            <div className="cuadro-normal">

                                <FontAwesomeIcon icon={faRankingStar} style={{ fontSize: '80px' }} />
                                <br />

                                <span style={{ fontSize: '30px' }}>{datosAdmin.administradores}</span>
                                <br />
                                ADMINISTRADORES
                            </div>
                        </div>
                        <div className={window.innerWidth < 600 ? '' : "col"}>
                            <div className="cuadro-normal">

                                <FontAwesomeIcon icon={faCheckDouble} style={{ fontSize: '80px' }} />
                                <br />

                                <span style={{ fontSize: '25px' }}>{datosAdmin.reservas}</span>
                                <br />
                                RESERVAS COMPLETADAS
                            </div>
                        </div>
                    </div>

                    <hr/>

                    <div className="row">
                        <div className="col mb-3">
                            <div className="cuadro-normal">

                                <h5 style={{ fontWeight: 'bold' }}>
                                    CIUDADES MÁS BUSCADAS...
                                </h5>
                                {
                                    datosAdmin.ciudades?.map((x, index) => (
                                        <span key={index}>
                                            {index + 1}. {x.nombre} <small className="text-muted">({x.busquedas})</small> <span style={ index !== datosAdmin.ciudades.length-1 ? {} : { display: 'none' }}>/&nbsp;</span>
                                        </span>
                                    ))
                                }
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col mb-3">
                            <div className="cuadro-normal">

                                <h5 style={{ fontWeight: 'bold' }}>
                                    PAISES MÁS BUSCADOS...
                                </h5>
                                {
                                    datosAdmin.paises?.map((x, index) => (
                                        <span key={index}>
                                            {index + 1}. {x.nombre} <small className="text-muted">({x.busquedas})</small> <span style={ index !== datosAdmin.paises.length-1 ? {} : { display: 'none' }}>/&nbsp;</span>
                                        </span>
                                    ))
                                }
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <AdminUsuarios show={vistaAdmin} cambiarVista={setVistaAdmin} />
            <AdminAlojamientos show={vistaAdmin} cambiarVista={setVistaAdmin} />
            <AdminReportes show={vistaAdmin} cambiarVista={setVistaAdmin} />
        </div>
    );
}

export default Admin;