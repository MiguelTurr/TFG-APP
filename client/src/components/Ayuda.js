import React, { useState } from 'react';

import ayuda from '../resources/ayuda.json';

function Ayuda() {

    const [ vistaMenu, setVistaMenu ] = useState('visitante');
    const [ vistaAyuda, setVistaAyuda ] = useState(0);
    const [ textoAyuda, setTextoAyuda ] = useState(ayuda.visitante[0]);

    const cambiarVista = (menuId) => {

        if(vistaMenu == menuId) {
            return;
        }

        var addClass = document.getElementById('btn-'+menuId);
        var removeClass = document.getElementById('btn-'+vistaMenu);

        addClass.classList.add('btn-activo');
        removeClass.classList.remove('btn-activo');

        setVistaMenu(menuId);
        setVistaAyuda(0);
        setTextoAyuda(ayuda[menuId][0]);
    }

    const ayudaVista = (vistaId) => {
        if(vistaAyuda == vistaId) {
            return;
        }

        var addClass = document.getElementById('btn-'+vistaMenu+'-'+vistaId);
        var removeClass = document.getElementById('btn-'+vistaMenu+'-'+vistaAyuda);

        addClass.classList.add('btn-activo');
        removeClass.classList.remove('btn-activo');

        setVistaAyuda(vistaId);
        setTextoAyuda(ayuda[vistaMenu][vistaId]);
    }

    return (
        
        <div className="container-fluid">
            <div className="row">
                <h3>
                      Resuelve tus dudas en el centro de ayuda
                </h3>
                
            </div>
            <hr/>

            <div className="row">

                <div className="col">
                    <button className="btn-no-style btn-activo" onClick={() => { cambiarVista('visitante') }} id="btn-visitante">
                        Visitante
                    </button>

                    <span className="vista-separador">/</span>

                    <button className="btn-no-style" onClick={() => { cambiarVista('hospedador') }} id="btn-hospedador">
                        Hospedador
                    </button>
                </div>

            </div>

            <hr/>
            <div className="row">
                
                {vistaMenu === 'visitante' &&
                    <div className="col-sm-3">
                        <ul>
                            <li>
                                <button className="btn-no-style btn-activo" onClick={() => { ayudaVista(0) }}  id="btn-visitante-0">
                                    Métodos de pago
                                </button>
                            </li>
                            <li>
                                <button className="btn-no-style" onClick={() => { ayudaVista(1) }}  id="btn-visitante-1">
                                    Cancelar reserva
                                </button>
                            </li>
                        </ul>
                </div>}

                {vistaMenu === 'hospedador' &&
                    <div className="col-sm-3">
                        <ul>
                            <li>
                                <button className="btn-no-style btn-activo" onClick={() => { ayudaVista(0) }}  id="btn-hospedador-0">
                                    Reseña mala
                                </button>
                            </li>
                            <li>

                                <button className="btn-no-style" onClick={() => { ayudaVista(1) }}  id="btn-hospedador-1">
                                    No he recibido un pago
                                </button>
                            </li>
                        </ul>
                    </div>}
                    
                <div className="col separador-izquierda">
                    {textoAyuda}
                </div>

            </div>
        </div>
    );
}

export default Ayuda;