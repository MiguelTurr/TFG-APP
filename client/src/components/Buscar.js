import React from "react";
import { useLocation } from "react-router-dom";

function Buscar() {

    const location = useLocation();
    const params = new URLSearchParams(location.search);

    return (
        <h1>
            BUSCAR {params.get("place")}
        </h1>
    );
}

export default Buscar;