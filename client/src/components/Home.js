import React from 'react';
import '../css/Home.css';
import { useEffect, useState } from 'react';

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

        <div className="container-fluid">

            <div className="row">

                {
                    prueba.map((x, index) => (

                        <div className="col-sm-4" key={index}>

                            <img
                                className="img-fluid"
                                src={x.url}/>

                            <div className="container bg-warning mb-3 text-center text-white">

                                {x.nombre}
                            </div>

                        </div>

                    ))
                }
            </div>
        </div>
    );
}

export default Home;