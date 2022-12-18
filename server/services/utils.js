const columnasPorPagina = 12;

const serviciosCasas = ['Cocina', 'Wifi', 'Mascotas', 'Aparcamiento', 'Piscina', 'Lavadora', 'Aire', 'Calefaccion', 'Television'];
const totalServicios = serviciosCasas.length - 1;

const fontsDisponibles = ['Segoe UI', 'Arial', 'Times New Roman', 'Helvetica', 'Calibri', 'Georgia', 'Cambria', 'Veranda'];

//

function nombreFotoPerfil(userId, extension) {
    return 'user' +userId+ '-profile.' +extension;
}

function nombreFotoAlojamiento(userId, index, extension) {
    return 'casa_' +userId+ '_' +index+ '.' +extension;
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
        resultado.puedeCancelar = true;

    } else if(estado === 1) {

        const fechaHoy = new Date().getTime();

        if(fechaHoy < fechaFinal.getTime()) {

            resultado.texto = 'Aceptada';
            resultado.color = '#50d932'; // VERDE
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

function queryOrdenar(ordenarTipo) {

    var str_final = '';
    var ordenadoPor = ['fecha', 'desc'];
    
    if (ordenarTipo !== null) {
        ordenadoPor = ordenarTipo.split('-');
    }

    if (ordenadoPor[0] === 'fecha') {
        str_final += 'ORDER BY alo.creadoEn ';

    } else if (ordenadoPor[0] === 'relevancia') {
        str_final += 'ORDER BY alo.visitas ';

    } else if (ordenadoPor[0] === 'precio') {
        str_final += 'ORDER BY alo.precio ';
    }

    str_final += ordenadoPor[1] + ' ';

    return str_final;
}

function queryFiltros(filtros) {
    var str_final = '';

    // PRECIO

    if(filtros.precio_min !== null) {
        str_final += 'AND alo.precio BETWEEN ' +parseInt(filtros.precio_min)+ ' AND ' +parseInt(filtros.precio_max)+ ' ';
    }

    //

    if(filtros.viajeros !== null) {
        str_final += 'AND alo.viajeros>=' +parseInt(filtros.viajeros)+ ' ';
    }

    if(filtros.habitaciones !== null) {
        str_final += 'AND alo.habitaciones>=' +parseInt(filtros.habitaciones)+ ' ';
    }

    if(filtros.camas !== null) {
        str_final += 'AND alo.camas>=' +parseInt(filtros.camas)+ ' ';
    }

    if(filtros.aseos !== null) {
        str_final += 'AND alo.aseos>=' +parseInt(filtros.aseos)+ ' ';
    }

    //

    if(filtros.valoracion !== null && filtros.valoracion > 0) {
        str_final += 'AND alo.valoracionMedia>' +parseInt(filtros.valoracion)+ ' ';
    }  

    //

    return str_final;
}

function queryLimit(contador) {
    return 'LIMIT ' +(contador * columnasPorPagina)+ ',' +columnasPorPagina;
}

module.exports = {
    nombreFotoPerfil,
    nombreFotoAlojamiento,
    boolToInt,
    estadoReserva,
    diasEntreFechas,

    fontsDisponibles,

    serviciosCasas,
    totalServicios,

    queryOrdenar,
    queryLimit,
    queryFiltros,
}