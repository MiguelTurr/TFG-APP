import React from 'react';
import '../css/Home.css';
import Footer from './Footer';

import { useEffect, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faLocationDot } from '@fortawesome/free-solid-svg-icons'

function Home() {

    useEffect( () => {
        fetchItems();
    }, []);

    const [prueba, setPrueba] = useState([]);

    const fetchItems = async() => {
        const data = await fetch('/prueba', { method: 'GET' });
        const items = await data.json();
        setPrueba( items.usuarios );
    }

    return(
    <>
        <div className="container-fluid">

            <div className="row">

                {
                    prueba.map((x, index) => (

                        <div className="col-sm-4" key={index}>

                            <img
                                className="img-fluid"
                                src={x.url}/>

                            <div className="container bg-warning mb-3">

                                <div className="row">

                                    <div className="col">

                                        <p>
                                            <FontAwesomeIcon icon={faLocationDot} />&nbsp;<strong>{x.lugar}</strong>
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