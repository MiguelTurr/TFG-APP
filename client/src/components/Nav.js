import React from 'react';
import '../css/Nav.css';

function Nav() {

    return (

        <div className="bg-primary header">

            <table className="table">

                <tbody>
                    <tr>
                        <td className="logo">
                            LOGO
                        </td>

                        <td className="text-center w-25">

                            <div className="form-group">

                                <div className="input-group">

                                    <input 
                                    type="text" 
                                    className="form-control"
                                    placeholder="Destino, lugar" 
                                    aria-label="Recipient's username" 
                                    aria-describedby="button-addon2"/>

                                    <button 
                                    className="btn btn-danger" 
                                    type="button" 
                                    id="button-addon2"
                                    onClick={() => console.log('click')}>Busqueda</button>
                                </div>
                            </div>

                        </td>

                        <td className="derecha">
                            LOGO
                        </td>

                    </tr>
                </tbody>

            </table>

        </div>

    );
}

export default Nav;