import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";

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

                        <button className="btn-style">
                            <FontAwesomeIcon icon={faGlobe} />
                        </button>

                        <span className="punto-style idioma-text">Español (ESP)</span>
                    </div>
                </div>
            </div>

            <br/>
        </div>
    );
}

export default Footer;