import React from 'react';

import { useEffect, useState } from 'react';

import ToolTipRec from './ToolTipRec';

function Recomendaciones() {

    const [alojamientos, setAlojamientos] = useState([]);
    const [imgAlojamientos, setImgAlojamientos] = useState([]);

    useEffect(() => {
        obtenerRecomendados();
    }, []);

    const obtenerRecomendados = async () => {

    };

    return (
        <div className="container-fluid">

            <div className="row">

                <h4 style={{ fontWeight: 'bold' }}>

                    <ToolTipRec> </ToolTipRec>

                    &nbsp;
                    RECOMENDADOS
                </h4>

                <hr />

            </div>
        </div>
    )
}

export default Recomendaciones;