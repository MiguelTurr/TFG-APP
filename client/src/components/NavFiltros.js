import React from "react";

import '../css/NavFiltros.css';

import Button from 'react-bootstrap/Button';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartSimple, faCalendarDays, faDollarSign, faHeart, faComputer, faSliders } from '@fortawesome/free-solid-svg-icons';

function NavFiltros() {


    return (
        <>
        <hr/>

        <div className="container-fluid mb-2">

            <div className="row mb-2">

                <div className="col">

                    <strong>Ordenar por:&nbsp;</strong>

                    <div className="btn-group" role="group">
                        
                        <Button className="filtros-botones" size="sm">
                            <FontAwesomeIcon icon={faCalendarDays} /> Fecha
                        </Button>

                        <Button className="filtros-botones" size="sm">
                            <FontAwesomeIcon icon={faChartSimple} /> Relevancia
                        </Button>

                        <Button className="filtros-botones" size="sm">
                            <FontAwesomeIcon icon={faDollarSign} /> Precio
                        </Button>
                    </div>

                </div>

                <div className="col text-center">

                    <Button className="filtros-botones" size="sm">
                        <FontAwesomeIcon icon={faSliders} /> Otros filtros
                    </Button>
                </div>

                <div className="col filtros-derecha">
                    <strong>Ir a:&nbsp;</strong>

                    <div className="btn-group" role="group">
                        
                        <Button className="filtros-botones" size="sm">
                            <FontAwesomeIcon icon={faHeart} /> Favoritos
                        </Button>

                        <Button className="filtros-botones" size="sm">
                            <FontAwesomeIcon icon={faComputer} /> Recomendados
                        </Button>
                    </div>

                </div>
            </div>
        </div>
        </>
    );
}

export default NavFiltros;