import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import '../css/NavFiltros.css';
import FiltrosModal from './Navegacion/FiltrosModal';

import Button from 'react-bootstrap/Button';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartSimple, faCalendarDays, faDollarSign, faHeart, faComputer, faSliders, faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';

function NavFiltros({ fav, rec }) {

    const [ordenar, setOrdenar] = useState({ orden: 'fecha', tipo: 'desc' });
    const [flecha, setFlecha] = useState(faArrowDown);

    const [filtros, setShowFiltros] = useState(false);
    const cerrarFiltros = () => setShowFiltros(false);

    const history = useNavigate();

    const location = window.location.href;
    const finalLocation = location.substring('http://localhost:3000/'.length);

    if(finalLocation !== ''
        && finalLocation.includes('home') === false
        && finalLocation.includes('buscar') === false) {

        return (<></>);
    }

    const ordenarPor = (cambiarOrden) => {

        var cambiarTipo = 'desc';

        if(ordenar.orden === cambiarOrden) {

            var tipoOrden = ordenar.tipo;

            cambiarTipo = (tipoOrden === 'desc' ? 'asc' : 'desc');

            setOrdenar({...ordenar , tipo: cambiarTipo });
            setFlecha(tipoOrden === 'desc' ? faArrowUp : faArrowDown);

        } else {
            setOrdenar({ orden: cambiarOrden, tipo: cambiarTipo });
            setFlecha(faArrowDown);
        }

        //

        if(finalLocation === '' || finalLocation.includes('home') === true) {
            history('/home?ordenar=' +cambiarOrden+ '-' +cambiarTipo);

        } else if(finalLocation.includes('buscar') === true) {
            
            var nuevaURL = finalLocation;
            nuevaURL = nuevaURL.substring(0, finalLocation.search('&ordenar'))+ '&ordenar=' +cambiarOrden+ '-' +cambiarTipo;
            history(nuevaURL);
        }
    };

    // MODAL FILTROS

    const abrirFiltros = () => {
        setShowFiltros(true);
    };

    //

    return (
        <>
        <hr/>

        <div className="container-fluid mb-2">

            <div className="row mb-2">

                <div className={window.innerWidth < 600 ? "mb-4" : "col"}>

                    <strong>Ordenar por:&nbsp;</strong>

                    <div className="btn-group" role="group">
                        
                        <Button className="filtros-botones" size="sm" onClick={() => { ordenarPor('fecha'); }}>
                            <FontAwesomeIcon icon={faCalendarDays} /> Fecha 
                            <span style={ordenar.orden === 'fecha' ? {} : { display: 'none' } }>
                                &nbsp;<FontAwesomeIcon icon={flecha} />
                            </span>
                        </Button>

                        <Button className="filtros-botones" size="sm" onClick={() => { ordenarPor('relevancia'); }}>
                            <FontAwesomeIcon icon={faChartSimple} /> Relevancia
                            <span style={ordenar.orden === 'relevancia' ? {} : { display: 'none' } }>
                                &nbsp;<FontAwesomeIcon icon={flecha} />
                            </span>
                        </Button>

                        <Button className="filtros-botones" size="sm" onClick={() => { ordenarPor('precio'); }}>
                            <FontAwesomeIcon icon={faDollarSign} /> Precio
                            <span style={ordenar.orden === 'precio' ? {} : { display: 'none' } }>
                                &nbsp;<FontAwesomeIcon icon={flecha} />
                            </span>
                        </Button>
                    </div>

                </div>

                <div className={window.innerWidth < 600 ? "mb-4" : "col text-center"}>

                    <Button className="filtros-botones" size="sm" onClick={abrirFiltros}>
                        <FontAwesomeIcon icon={faSliders} /> Otros filtros
                    </Button>
                </div>

                <div className={window.innerWidth < 600 ? "" : "col filtros-derecha"}>
                    <strong>Ir a:&nbsp;</strong>

                    <div className="btn-group" role="group">
                        
                        <Button className="filtros-botones" size="sm" onClick={() => { fav() }}>
                            <FontAwesomeIcon icon={faHeart} /> Favoritos
                        </Button>

                        <Button className="filtros-botones" size="sm" onClick={() => { rec() }}>
                            <FontAwesomeIcon icon={faComputer} /> Recomendados
                        </Button>
                    </div>

                </div>
            </div>
            
            <FiltrosModal mostrar={filtros} funcionCerrar={cerrarFiltros} />
        </div>
        </>
    );
}

export default NavFiltros;