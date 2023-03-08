import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import '../../css/NavFiltros.css';
import FiltrosModal from './FiltrosModal';

import Button from 'react-bootstrap/Button';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartSimple, faCalendarDays, faDollarSign, faHeart, faComputer, faSliders, faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';

function NavFiltros({ fav, rec }) {

    const [ordenar, setOrdenar] = useState({ orden: 'fecha', tipo: 'desc' });
    const [flecha, setFlecha] = useState(faArrowDown);

    const [filtros, setShowFiltros] = useState(false);
    const cerrarFiltros = () => setShowFiltros(false);

    const history = useNavigate();

    const location = useLocation();
    const finalLocation = location.pathname;

    if (finalLocation !== '/'
        && finalLocation !== '/home'
        && finalLocation !== '/home') {

        return (<></>);
    }

    const ordenarPor = (cambiarOrden) => {

        var cambiarTipo = 'desc';

        if (ordenar.orden === cambiarOrden) {

            var tipoOrden = ordenar.tipo;

            cambiarTipo = (tipoOrden === 'desc' ? 'asc' : 'desc');

            setOrdenar({ ...ordenar, tipo: cambiarTipo });
            setFlecha(tipoOrden === 'desc' ? faArrowUp : faArrowDown);

        } else {
            setOrdenar({ orden: cambiarOrden, tipo: cambiarTipo });
            setFlecha(faArrowDown);
        }

        //

        var urlFinal = '';

        if (finalLocation === '/' || finalLocation === '/home') {
            urlFinal = '/home?ordenar=' + cambiarOrden + '-' + cambiarTipo;

        } else if (finalLocation === '/buscar') {
            var nuevaURL = finalLocation;
            urlFinal = nuevaURL.substring(0, finalLocation.search('&ordenar')) + '&ordenar=' + cambiarOrden + '-' + cambiarTipo;
        }

        var lenFiltros = finalLocation.search('precio_min');
        if (lenFiltros !== -1) {
            urlFinal += '&' + finalLocation.substring(finalLocation.search('precio_min'), location.length);
        }

        history(urlFinal);
    };

    // MODAL FILTROS

    const abrirFiltros = () => {
        setShowFiltros(true);
    };

    //

    return (
        <>
            <hr />

            <div className="container-fluid mb-2">

                <div className="row mb-2">

                    <div className={window.innerWidth < 600 ? "mb-2 text-center" : "col"}>

                        <Button className="filtros-botones mb-1" size="sm" onClick={() => { ordenarPor('fecha'); }}>
                            <FontAwesomeIcon icon={faCalendarDays} /> Fecha
                            <span style={ordenar.orden === 'fecha' ? {} : { display: 'none' }}>
                                &nbsp;<FontAwesomeIcon icon={flecha} />
                            </span>
                        </Button>

                        &nbsp;

                        <Button className="filtros-botones mb-1" size="sm" onClick={() => { ordenarPor('relevancia'); }}>
                            <FontAwesomeIcon icon={faChartSimple} /> Relevancia
                            <span style={ordenar.orden === 'relevancia' ? {} : { display: 'none' }}>
                                &nbsp;<FontAwesomeIcon icon={flecha} />
                            </span>
                        </Button>

                        &nbsp;

                        <Button className="filtros-botones mb-1" size="sm" onClick={() => { ordenarPor('precio'); }}>
                            <FontAwesomeIcon icon={faDollarSign} /> Precio
                            <span style={ordenar.orden === 'precio' ? {} : { display: 'none' }}>
                                &nbsp;<FontAwesomeIcon icon={flecha} />
                            </span>
                        </Button>

                    </div>

                    <div className={window.innerWidth < 600 ? "mb-2 text-center" : "col text-center"}>

                        <Button className="filtros-botones" size="sm" onClick={abrirFiltros}>
                            <FontAwesomeIcon icon={faSliders} /> Otros filtros
                        </Button>
                    </div>

                    <div className={window.innerWidth < 600 ? "text-center" : "col filtros-derecha"}>

                        <Button className="filtros-botones mb-1" size="sm" onClick={fav}>
                            <FontAwesomeIcon icon={faHeart} /> Favoritos
                        </Button>

                        &nbsp;

                        <Button className="filtros-botones mb-1" size="sm" onClick={rec}>
                            <FontAwesomeIcon icon={faComputer} /> Recomendados
                        </Button>

                    </div>
                </div>

                <FiltrosModal mostrar={filtros} funcionCerrar={cerrarFiltros} />
            </div>
        </>
    );
}

export default NavFiltros;