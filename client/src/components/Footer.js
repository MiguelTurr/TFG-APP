import React from 'react';
import '../css/Footer.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGlobe } from '@fortawesome/free-solid-svg-icons'

function Footer() {

    return (
        <div className="footer">
            <hr/>

            <div className="container-fluid">

                <div class="row">

                    <div class="col">
                        <span>&copy; 2022 FastForHolidays</span>

                        <span className="punto-style">&middot;</span>
                        <a className="link-style" href="/privacidad">Privacidad</a>

                        <span className="punto-style">&middot;</span>
                        <a className="link-style" href="/condiciones">Condiciones</a>
                    </div>

                    <div class="col idioma-col">

                        <button className="btn-style">
                            <FontAwesomeIcon icon={faGlobe} />
                        </button>

                        <span className="punto-style idioma-text">Español (ESP)</span>
                    </div>
                </div>
            </div>
            <hr/>

        </div>
    );
}

export default Footer;