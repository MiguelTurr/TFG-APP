import { useState } from "react";

export default function useToken() {

    const getAutorizado = () => {
        const autorizado = localStorage.getItem('autorizado');
        return (autorizado == null) ? (false) : (!(autorizado == 'false'));
    };

    const [autorizado, setAutorizado] = useState(getAutorizado());

    const saveAutorizado = autorizado => {
        localStorage.setItem('autorizado', autorizado);
        setAutorizado(autorizado);
    };

    return {
        setAutorizado: saveAutorizado,
        autorizado
    }
}