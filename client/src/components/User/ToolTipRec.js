
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

function TriggerExample() {

    const favInfo = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            Aquí se te mostrarán alojamientos nuevos que te puedan interesar.<br/>Puedes desactivar esta opción en tu perfil.
        </Tooltip>
    );

    return (
        <OverlayTrigger
            placement="right"
            delay={{ show: 250, hide: 400 }}
            overlay={favInfo}
        >
            <FontAwesomeIcon icon={faInfoCircle} />
        </OverlayTrigger>
    );
}

export default TriggerExample;