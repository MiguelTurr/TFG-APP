import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";

function RegistroValidar() {
    const { id } = useParams();

    //

    const [resultadoTexto, setResultadoTexto] = useState();

    useEffect(() => {
        fetchValidar();
    });

    const fetchValidar = async () => {

        const data = await fetch('/cuenta/validar/' +id, { method: 'GET' });
        const items = await data.json();

        if(items.respuesta === 'err_db') {
            setResultadoTexto('Ha ocurrido un error en la base de datos.');

        } else if(items.respuesta === 'err_datos') {
            setResultadoTexto('Ese código ya ha sido validado o no existe.');

        } else if(items.respuesta === 'correcto') {
            setResultadoTexto('Su correo ha sido validado correctamente. Ya puede iniciar sesión en su cuenta.');

            setTimeout(() => {
                window.location.href = '/';
            }, 5000);
        }
    };

    return (

        <div className="container-fluid">

            <h4 style={{ fontWeight: 'bold' }}>
                Valida tu cuenta
            </h4>

            <hr/>

            <div className="row">
                <div className="col">
                    <h5>
                        {resultadoTexto}
                    </h5>
                </div>
            </div>
        </div>
    );
}

export default RegistroValidar;