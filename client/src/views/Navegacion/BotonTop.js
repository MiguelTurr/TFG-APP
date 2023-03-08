import React, { useState } from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';

function BotonTop() {

    const [activo, setActivo] = useState(false);

    window.addEventListener('scroll', () => {

        if (window.pageYOffset > 300) {
            setActivo(true);
        } else {
            setActivo(false);
        }
    });

    //

    const moverTop = () => {
        window.scrollTo(0, 0);
    };

    //

    return (
        <button className="btn-top" onClick={moverTop} style={ activo === true ? {} : { display: 'none' }}>
            <FontAwesomeIcon icon={faChevronUp} />
        </button>
    )
}

export default BotonTop;