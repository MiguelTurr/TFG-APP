import React from 'react';

import { useEffect, useState } from 'react';

import ToolTipRec from './ToolTipRec';

function Recomendaciones() {



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