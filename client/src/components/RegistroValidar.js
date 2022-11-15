import React from 'react';
import { useParams } from "react-router-dom";
import { useEffect, useState } from 'react';

function RegistroValidar() {
    const { id } = useParams();

    //

    //var [loginModal, setShowLogin] = useState(false);

    useEffect( () => {
        fetchValidar();
    }, []);

    const fetchValidar = async () => {
        const data = await fetch('/validar/' +id, { method: 'GET' });
        const items = await data.json();

        if(items.respuesta == 'err_db') {
            alert('ERROR DB');

        } else if(items.respuesta == 'err_datos') {
            alert('ERROR CODIGO');

        } else if(items.respuesta == 'correcto') {
            alert('Email confirmado');
        }
    };

    return (
        <div>
            <h1>
                Validar {id}
            </h1>
        </div>
    );
}

export default RegistroValidar;