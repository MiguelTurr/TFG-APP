import React from "react";

function CrearAlojamiento({ show }) {
    return(<>
        {show === true &&
        <h1>
            CREAR
        </h1>
        }
    </>);
}

export default CrearAlojamiento;