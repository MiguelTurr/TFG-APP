import React, { useState, useEffect } from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckDouble, faFlag, faHouse, faRankingStar, faStar, faUser } from '@fortawesome/free-solid-svg-icons';

function Admin({ changeLogged }) {

    const [datosAdmin, setDatosAdmin] = useState({});

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

        } else if(items.respuesta === 'correcta') {
            setDatosAdmin(items.admin);
        }
    };

    //

    return (
        <div className="container-fluid">
            <h4 style={{ fontWeight: 'bold' }}>
                ADMINISTRACIÓN
            </h4>

            <hr />

            <div className="row">

                <div className="container-fluid" style={{ width: '80%' }}>

                    <div className="row">

                        <div className={window.innerWidth < 600 ? 'mb-3' : "col mb-3"}>
                            <div style={{ backgroundColor: '#e7e7e7', border: '3px solid #000', padding: '15px', borderRadius: '10px', fontWeight: 'bold', color: 'black', textAlign: 'center' }}>

                                <FontAwesomeIcon icon={faHouse} style={{ fontSize: '80px' }} />
                                <br />

                                <span style={{ fontSize: '30px' }}>{datosAdmin.alojamientos}</span>
                                <br />
                                ALOJAMIENTOS
                            </div>
                        </div>

                        <div className={window.innerWidth < 600 ? 'mb-3' : "col mb-3"}>
                            <div style={{ backgroundColor: '#e7e7e7', border: '3px solid #000', padding: '15px', borderRadius: '10px', fontWeight: 'bold', color: 'black', textAlign: 'center' }}>

                                <FontAwesomeIcon icon={faUser} style={{ fontSize: '80px' }} />
                                <br />
                                <span style={{ fontSize: '30px' }}>
                                    {datosAdmin.usuarios}
                                </span>
                                <br />
                                USUARIOS
                            </div>
                        </div>

                        <div className={window.innerWidth < 600 ? 'mb-3' : "col mb-3"}>
                            <div style={{ backgroundColor: '#e7e7e7', border: '3px solid #000', padding: '15px', borderRadius: '10px', fontWeight: 'bold', color: 'black', textAlign: 'center' }}>

                                <FontAwesomeIcon icon={faStar} style={{ fontSize: '80px' }} />
                                <br />

                                <span style={{ fontSize: '25px' }}>{datosAdmin.alojamientosValorados}</span>
                                <br />
                                ALOJAMIENTOS VALORADOS
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className={window.innerWidth < 600 ? 'mb-3' : "col"}>
                            <div style={{ backgroundColor: '#e7e7e7', border: '3px solid #000', padding: '15px', borderRadius: '10px', fontWeight: 'bold', color: 'black', textAlign: 'center' }}>

                                <FontAwesomeIcon icon={faFlag} style={{ fontSize: '80px' }} />
                                <br />

                                <span style={{ fontSize: '30px' }}>{datosAdmin.reportes}</span>
                                <br />
                                REPORTES
                            </div>
                        </div>
                        <div className={window.innerWidth < 600 ? 'mb-3' : "col"}>
                            <div style={{ backgroundColor: '#e7e7e7', border: '3px solid #000', padding: '15px', borderRadius: '10px', fontWeight: 'bold', color: 'black', textAlign: 'center' }}>

                                <FontAwesomeIcon icon={faRankingStar} style={{ fontSize: '80px' }} />
                                <br />

                                <span style={{ fontSize: '30px' }}>{datosAdmin.administradores}</span>
                                <br />
                                ADMINISTRADORES
                            </div>
                        </div>
                        <div className={window.innerWidth < 600 ? '' : "col"}>
                            <div style={{ backgroundColor: '#e7e7e7', border: '3px solid #000', padding: '15px', borderRadius: '10px', fontWeight: 'bold', color: 'black', textAlign: 'center' }}>

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
                            <div style={{ backgroundColor: '#e7e7e7', border: '3px solid #000', padding: '15px', borderRadius: '10px', fontWeight: 'bold', color: 'black' }}>

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
                            <div style={{ backgroundColor: '#e7e7e7', border: '3px solid #000', padding: '15px', borderRadius: '10px', fontWeight: 'bold', color: 'black' }}>

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
        </div>
    );
}

export default Admin;