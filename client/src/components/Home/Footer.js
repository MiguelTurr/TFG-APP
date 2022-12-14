import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";

import Idiomas from './IdiomasModal';

import '../../css/Footer.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGlobe } from '@fortawesome/free-solid-svg-icons'

function Footer() {

    const [posicion, setPosicion] = useState('sticky');
    const location = useLocation();

    useEffect(() => {

        if (location.pathname === '/' || location.pathname === '/home') {
            setPosicion('sticky');

        } else {
            setPosicion('');
        }

    }, [location]);

    //

    const [idiomasModal, setShowIdiomas] = useState(false);
    const cerrarIdiomasModal = () => setShowIdiomas(false);

    const abrirIdiomasModal = () => {
        setShowIdiomas(true);
    };

    //

    return (
        <div className="footer" style={{ position: posicion }}>

            <hr/>

            <div className="container-fluid">
                <div className="row">

                    <div className="col">
                        <span>&copy; 2022 FastForHolidays</span>

                        <span className="punto-style">&middot;</span>
                        <a className="link-style" href="/privacidad">Privacidad</a>

                        <span className="punto-style">&middot;</span>
                        <a className="link-style" href="/condiciones">Condiciones</a>
                    </div>

                    <div className="col idioma-col">

                        <button className="btn-style" onClick={abrirIdiomasModal}>
                            <FontAwesomeIcon icon={faGlobe} />
                        </button>

                        <span className="punto-style idioma-text" onClick={abrirIdiomasModal}>
                            Español (ESP)
                        </span>
                    </div>
                </div>
            </div>

            <br/>
            <Idiomas mostrar={idiomasModal} funcionCerrar={cerrarIdiomasModal} />
        </div>
    );
}

export default Footer;