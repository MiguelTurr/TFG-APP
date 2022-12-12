function nombreFotoPerfil(userId, extension) {
    return 'user' +userId+ '-profile.' +extension;
}

function nombreFotoAlojamiento(userId, index, extension) {
    return 'casa-' +userId+ '-' +index+ '.' +extension;
}

function boolToInt(value) {
    return value === 'false' ? 0 : 1;
}

function estadoReserva(estado, fechaFinal) {
    var resultado = {};

    if(estado === -1) {
        resultado.texto = 'Cancelado';
        resultado.color = '#ff2c2c'; // ROJO
        resultado.puedeValorar = false;

    } else if(estado === 0) {
        resultado.texto = 'En revisión';
        resultado.color = '#ff962c'; // NARANJA
        resultado.puedeValorar = false;

    } else if(estado === 1) {

        const fechaHoy = new Date().getTime();

        if(fechaHoy < fechaFinal.getTime()) {

            resultado.texto = 'Aceptada';
            resultado.color = '#00fa35'; // VERDE
            resultado.puedeValorar = false;

        } else {

            resultado.texto = 'Sin valorar';
            resultado.color = '#476cff'; // AZUL
            resultado.puedeValorar = true;
        }

    } else if(estado === 2) {
        resultado.texto = 'Valorada';
        resultado.color = '#c22bff'; // MORADO
        resultado.puedeValorar = false;
    }

    return resultado;
}

function diasEntreFechas(inicio, final) {
    return (final - inicio) / (1000 * 60 * 60 * 24);
}

module.exports = {
    nombreFotoPerfil,
    nombreFotoAlojamiento,
    boolToInt,
    estadoReserva,
    diasEntreFechas
}