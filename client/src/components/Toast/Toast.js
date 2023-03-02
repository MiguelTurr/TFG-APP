import { library, icon } from '@fortawesome/fontawesome-svg-core'
import { faTriangleExclamation, faSquareCheck } from '@fortawesome/free-solid-svg-icons';

library.add(faTriangleExclamation, faSquareCheck);

var alertaActiva = null;
var alertaTimer = null;

export async function crearAlerta(tipo, mensaje, tiempo=2000) {

    if(alertaActiva != null) {
        alertaActiva.remove();
        clearTimeout(alertaTimer);
    }

    var toastPrincipal = document.createElement("div");
    toastPrincipal.classList.add('toast');
    toastPrincipal.style.backgroundColor = tipo === 'error' ? '#ee5f5b' : '#62c462';
    toastPrincipal.style.padding = '5px';
    toastPrincipal.style.fontSize = '17px';
    toastPrincipal.style.textAlign = 'center';
    toastPrincipal.style.color = 'white';
    toastPrincipal.style.fontWeight = 'bold';

    var iconoElement = document.createElement('i');
    var icono;

    if(tipo === 'error') {
        icono = icon({ prefix: 'fa', iconName: 'triangle-exclamation' }).html;

    } else if(tipo === 'exito') {
        icono = icon({ prefix: 'fa', iconName: 'square-check' }).html;
    }

    iconoElement.style.fontSize = '50px';
    iconoElement.innerHTML = icono;

    toastPrincipal.append(iconoElement);

    toastPrincipal.innerHTML += '<br/>' +mensaje;

    document.getElementById('alertasInfo').append(toastPrincipal);
    toastPrincipal.style.display = 'block';

    alertaActiva = toastPrincipal;

    alertaTimer = setTimeout(() => {
        toastPrincipal.remove();
    }, tiempo);
}