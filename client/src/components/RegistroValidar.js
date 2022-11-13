import React from 'react';
import { useParams } from "react-router-dom";

function RegistroValidar() {
    const { id } = useParams();

    console.log(id);

    return (
        <div>
            <h1>
                Validar {id}
            </h1>
        </div>
    );
}

export default RegistroValidar;