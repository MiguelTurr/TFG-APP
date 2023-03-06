import React from "react";

import icons from '../../resources/icons.json';

function ChatIconos({ show, pulsarIcono }) {

    if(show === false) return;

    return (
        <div style={{ position: 'relative' }}>
    
            <div className="icon-list">

                {
                    icons.map((x, index) => (
                        <span key={index}>
                            <span className="icon" onClick={() => { pulsarIcono(x.icon) }}>
                                {x.icon}
                            </span>
                            {(index+1) % 5 === 0 ? <br/> : ''}
                        </span>
                    ))
                }
            </div>
        </div>
    )
}

export default ChatIconos;