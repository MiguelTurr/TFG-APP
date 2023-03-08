import React from 'react';
import './Maps.css';

import usePlacesAutocomplete from 'use-places-autocomplete';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faSearch } from '@fortawesome/free-solid-svg-icons';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

function BuscarLugar({ buscar, enviaDireccion }) {

    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            fields: ["address_components", 'geometry']
        },
        debounce: 300,
    });

    const handleSelect =
        ({ description }) => () => {

            const direccion = description;

            setValue(description, false);
            clearSuggestions();

            if (buscar !== undefined) {
                window.location.href = '/alojamiento/buscar?place=' + direccion + '&ordenar=fecha-desc';

            } else {
                enviaDireccion(direccion);
            }
        };

    const renderSuggestions = () =>
        data.map((suggestion) => {

            const {
                place_id,
                structured_formatting: { main_text, secondary_text },
            } = suggestion;

            if(secondary_text === undefined) {
                return( 
                <li key={place_id} onClick={handleSelect(suggestion)} className="suggest-opciones">
                    <FontAwesomeIcon icon={faLocationDot} style={{ color: 'green' }}/>&nbsp;
                    <strong>
                        {main_text}
                    </strong>
                </li>)
            }

            return (
                <li key={place_id} onClick={handleSelect(suggestion)} className="suggest-opciones">
                    <FontAwesomeIcon icon={faLocationDot} style={{ color: 'green' }}/>&nbsp;
                    <strong>
                        {main_text}
                    </strong>
                    ,&nbsp;
                    <small>
                        {secondary_text}
                    </small>
                </li>
            );
        });

    return (

        <Form.Group className="mb-3">

            <div className="input-group">

                <Form.Control
                    className='imput-style shadow-none'
                    type="text"
                    size="sm"
                    placeholder="Escribe un lugar"
                    disabled={!ready}
                    value={value}
                    onChange={(e) => { setValue(e.target.value) }} />

                <Button className="btn-no-style input-group-addon" size="sm">
                    <FontAwesomeIcon icon={faSearch} />
                </Button>

            </div>

            <div className="suggest-container">
                {status === "OK" &&

                    <ul className="suggest-lista">
                        {renderSuggestions()}
                    </ul>
                }
            </div>
        </Form.Group>
    );
}

export default BuscarLugar;
