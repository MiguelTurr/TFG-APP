import React, { useState, useEffect } from "react";

function UserValoraciones() {

    const [valVista, setValVista] = useState('hechas');

    const cambiarVista = (tipoId) => {
        setValVista(tipoId);
    };

    //
 
    return (

        <div className="container-fluid mb-5">
            
            <div className="row">
                <div className="col">

                    <button className={valVista === 'hechas' ? "btn-no-style btn-activo" : "btn-no-style"} onClick={() => { cambiarVista('hechas') }} id="btn-visitante">
                        Hechas
                    </button>

                    <span className="vista-separador">/</span>

                    <button className={valVista === 'recibidas' ? "btn-no-style btn-activo" : "btn-no-style"} onClick={() => { cambiarVista('recibidas') }} id="btn-hospedador">
                        Recibidas
                    </button>

                    <span className="vista-separador">/</span>

                    <button className={valVista === 'alojamientos' ? "btn-no-style btn-activo" : "btn-no-style"} onClick={() => { cambiarVista('alojamientos') }} id="btn-hospedador">
                        Alojamientos
                    </button>
                </div>
            </div>

            <hr/>
        </div>
    );
}

export default UserValoraciones;