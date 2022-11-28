import React from 'react';
import '../css/Home.css';
import Footer from './Home/Footer';

import { useEffect, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faLocationDot } from '@fortawesome/free-solid-svg-icons'

function Home() {

    useEffect(() => {
        fetchItems();
    }, []);

    const [alojamientos, setAlojamientos] = useState([]);

    const fetchItems = async() => {
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

                        <div className="col-sm-4" key={index}>

                            <img
                                className="img-fluid img-casa"
                                src={x.url}/>

                            <div className="container mb-3 info-casa">

                                <div className="row mt-1">

                                    <div className="col">

                                        <p>
                                            <FontAwesomeIcon icon={faLocationDot} style={{ color: 'green'}} />&nbsp;<strong>{x.ubicacion}</strong>
                                            <br/>
                                            <strong>{x.precio}€</strong> por noche
                                        </p>
                                    </div>

                                    <div className="col derecha-casa">
                                        <FontAwesomeIcon icon={faStar} />&nbsp;
                                        3,5
                                    </div>

                                </div>
                            </div>

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