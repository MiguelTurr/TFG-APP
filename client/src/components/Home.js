import React from 'react';
import '../css/Home.css';
import Footer from './Home/Footer';

import { useLocation} from "react-router-dom";
import { useEffect, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faLocationDot, faHeart } from '@fortawesome/free-solid-svg-icons';

import Card from 'react-bootstrap/Card';

function Home() {

    const location = useLocation();
    const params = new URLSearchParams(location.search);

    useEffect(() => {
        fetchItems(params.get("ordenar"));
    }, [location.search]);

    const [alojamientos, setAlojamientos] = useState([]);

    const fetchItems = async (orden) => {

        console.log(orden); // CAMBIAR QUERY CON ORDENAR

        const data = await fetch('/home', { method: 'GET' });
        const items = await data.json();

        if(items.respuesta === 'err_db') {

        } else if(items.respuesta === 'correcto') {
            setAlojamientos(items.alojamientos);
        }
    }

    return(
    <>
        <div className="container-fluid">

            <div className="row">

                {
                    alojamientos.map((x, index) => (

                        <div className="col-sm-3" key={index}>

                            <Card className="container-casa mb-3 h-100">

                                 <img
                                    className="card-img-top"
                                    src={x.url}/>

                                <Card.Body className="card-body info-casa">

                                    <div className="row">

                                        <div className="col">

                                            <p>
                                                <FontAwesomeIcon icon={faLocationDot} style={{ color: 'green'}} />&nbsp;<strong>{x.ubicacion}</strong>
                                                <br/>
                                                <strong>{x.precio}€</strong> por noche
                                            </p>
                                        </div>

                                        <div className="col derecha-casa">
                                            <FontAwesomeIcon icon={faStar} />&nbsp;3,5
                                            <br/>
                                            <FontAwesomeIcon icon={faHeart} style={{ color: 'green' }} />
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>

                    ))
                }
            </div>
        </div>

        <Footer />  
    </>
    );
}

export default Home;