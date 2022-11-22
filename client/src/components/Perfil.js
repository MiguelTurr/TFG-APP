import React, { useEffect } from "react";

import '../css/Perfil.css';

function Perfil() {

    const perfilInfo = async () => {

        const data = await fetch('/perfil', { 
            method: 'GET',
            
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const items = await data.json();

        console.log(items);
    };

    useEffect(() => {
        perfilInfo();
    }, []);

    return (

        <div className="container-fluid">

            <div className="row">

                <div className="col">

                    <button className="btn-no-style btn-activo">
                        Información personal
                    </button>
                </div>

                <div className="col">
                    <button className="btn-no-style">
                        Información personal
                    </button>
                </div>

                <div className="col">
                    <button className="btn-no-style">
                        Información personal
                    </button>
                </div>

            </div>

            <hr/>
            <div className="row">
                
                <div className="col">
                    texto
                </div>

            </div>
        </div>
    );
}

export default Perfil;