import React from "react";
import { useParams } from "react-router-dom";

function Comparar() {

    const { id } = useParams();
    
    //

    return (
        <div className="container-fluid">
            <div className="row">
                <h1>
                    COMPARAR
                </h1>
            </div>
        </div>
    );
}

export default Comparar;