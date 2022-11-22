import React, { useState } from "react";

import './Toast.css';

import Toast from 'react-bootstrap/Toast';
import Button from "react-bootstrap/Button";

function CrearAlerta() {

    const [show, changeShow] = useState(false);

    return (
        <>
            <Toast show={show} onClose={() => changeShow(false)}>
                <Toast.Body>Preuabs</Toast.Body>
            </Toast>

            <Button onClick={() => changeShow(true)}>
                Boton
            </Button>
        </>
    );
}

export default CrearAlerta;