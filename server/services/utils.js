function nombreFotoPerfil(userId, extension) {
    return 'user' +userId+ '-profile.' +extension;
}

function nombreFotoAlojamiento(userId, index, extension) {
    return 'casa-' +userId+ '-' +index+ '.' +extension;
}

function boolToInt(value) {
    return value === 'false' ? 0 : 1;
}

module.exports = {
    nombreFotoPerfil,
    nombreFotoAlojamiento,
    boolToInt,
}