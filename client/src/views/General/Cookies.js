import React from "react";
import './Cookies.css';

import { useState, useEffect } from "react";

import Button from 'react-bootstrap/Button';


function Cookies() {

    const [aceptaCookies, setCookies] = useState(true);

    useEffect( () => {
        const cookies = document.cookie.split('; ');

        cookies.map(estado => {
            var tipo = estado.split('=');

            if(tipo[0] == 'cookiesAceptadas') {
                setCookies(!(tipo[1] == false));

            } else {
                setCookies(false);
            }
        });
    }, []);

    if(aceptaCookies == true) {
        return(<></>);
    }

    const aceptarCookies = async () => {
        const data = await fetch('/cookies/aceptar', { method: 'GET' });

        if(data.status == 200) {
            setCookies(true);
        }
    };

    return ( 
        <div className="row" style={aceptaCookies === false ? {} : { display: 'none' }}>

            <div className="col-md-4 col-sm-12 button-fixed text-white p-3">

                    <h2>Permitir Cookies</h2>

                    <p>
                        Esta web utiliza cookies para mejorar la experiencia del usuario.
                    </p>

                    <Button className="btn btn-danger w-100" size="sm" onClick={aceptarCookies}>
                        Aceptar
                    </Button>
            </div>
        </div>
    );
}

export default Cookies;