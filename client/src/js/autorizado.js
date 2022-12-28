import { useState } from "react";

export default function useToken() {

    const getAutorizado = () => {
        const autorizado = localStorage.getItem('isLogged');
        return (autorizado === null) ? (false) : (!(autorizado === 'false'));
    };

    const [isLogged, setAutorizado] = useState(getAutorizado());

    const saveAutorizado = (isLogged) => {
        localStorage.setItem('isLogged', isLogged);
        setAutorizado(isLogged);

        if(isLogged === false) {
            window.location.href = '/';
        }
    };

    return {
        setAutorizado: saveAutorizado,
        isLogged
    }
}
