import React, { useState } from 'react';

import ayuda from '../../resources/ayuda.json';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

function Ayuda() {

    const [ vistaMenu, setVistaMenu ] = useState('visitante');
    const [ vistaAyuda, setVistaAyuda ] = useState(0);
    const [ textoAyuda, setTextoAyuda ] = useState(ayuda.visitante.textos[0]);

    const [ titulosVisitante, setVisitante ] = useState(ayuda.visitante.titulos);
    const [ titulosHospedador, setHospedador ] = useState(ayuda.hospedador.titulos);

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
        setTextoAyuda(ayuda[menuId].textos[0]);
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
        setTextoAyuda(ayuda[vistaMenu].textos[vistaId]);
    }

    return (
        
        <div className="container-fluid">
            <div className="row">

                <h4 style={{ fontWeight: 'bold' }}>
                    <FontAwesomeIcon icon={faInfoCircle} /> Resuelve tus dudas en el centro de ayuda
                </h4>
                
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
                            {
                                titulosVisitante.map((x, key) => (
                                    <li key={key}>
                                        <button className={key === 0 ? "btn-no-style btn-activo" : "btn-no-style"} onClick={() => { ayudaVista(key) }} id={'btn-visitante-'+key}>
                                            {x}
                                        </button>
                                    </li>
                                ))
                            }
                        </ul>
                </div>}

                {vistaMenu === 'hospedador' &&
                    <div className="col-sm-3">
                        <ul>
                            {
                                titulosHospedador.map((x, key) => (
                                    <li key={key}>
                                        <button className={key === 0 ? "btn-no-style btn-activo" : "btn-no-style"} onClick={() => { ayudaVista(key) }} id={'btn-hospedador-'+key}>
                                            {x}
                                        </button>
                                    </li>
                                ))
                            }
                            
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