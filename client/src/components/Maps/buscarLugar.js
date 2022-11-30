import React from 'react';
import './Maps.css';

import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';

import Form from 'react-bootstrap/Form';

function BuscarLugar({ ubicacion }) {

    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            fields: ['geometry']
        },
        debounce: 300,
    });

    const handleSelect =
        ({ description }) =>
            () => {
                setValue(description, false);
                clearSuggestions();

                // Get latitude and longitude via utility functions
                getGeocode({ address: description }).then((results) => {
                    const { lat, lng } = getLatLng(results[0]);
                    console.log("📍 Coordinates: ", { lat, lng });
                });
            };

    const renderSuggestions = () =>
        data.map((suggestion) => {

            const {
                place_id,
                structured_formatting: { main_text, secondary_text },
            } = suggestion;

            return (
                <li key={place_id} onClick={handleSelect(suggestion)} className="lista-opciones">
                    <FontAwesomeIcon icon={faLocationDot} /> - <strong>{main_text}</strong>, <small>{secondary_text}</small>
                </li>
            );
        });

    return (

        <Form.Group className="mb-3">

            <Form.Control
                type="text"
                size="sm"
                placeholder="Escribe un lugar"
                disabled={!ready}
                value={value}
                onChange={(e) => { setValue(e.target.value) }}/>

            {status === "OK" && <ul className="lista-sin-numeros">{renderSuggestions()}</ul>}
        </Form.Group>
    );
}

export default BuscarLugar;
