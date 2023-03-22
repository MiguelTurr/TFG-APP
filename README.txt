Se puede usar el siguiente comando de git para clonar el proyecto:

    git clone https://github.com/MiguelTurr/TFG-APP.git nombre_carpeta

Una vez tengamos el proyecto en nuestro ordenador debemos crear el archivo de configuración del servidor para ello nos dirigimos a /server/services/

Aquí dentro crearemos el archivo 'config.js' que tendrá la siguiente información.

    server_hostname, por defecto 'localhost' es la dirección que usará el servidor para atender las peticiones.

    server_port, por defecto 8000 es el puerto que usará el servidor para atender las peticiones.

    mysql_host, por defecto 'localhost' es la localización de donde se encuentra la base de datos.

    mysql_user, el usuario que se usará para concertase a la base de datos.

    mysql_passwordr, la contraseña que se usará para concertase a la base de datos.

    mysql_database, por defecto 'app' es el nombre de la base de datos que se va a usar en la aplicación.

    email_user, correo utilizado para enviar los emails de la aplicación.

    email_password, clave del correo.

    bcrypt_salt, por defecto 10 el salto que se utilizará para encriptar las contraseñas.

    cookie_secret, palabra secreta que se usa para generar los JWT.

    google_api_key, clave para conectarnos con la API de GoogleMaps.

    paypal_client, cliente para utilizar el servicio de PayPal.

    paypal_secret, clave para utilizar el servicio de PayPal.

    comision_porcentaje, por defecto 10, es la comisión que se lleva la aplicación por el alquiler de los alojamientos.

    dev_state, por defecto true es para indicar si nos encontramos en desarrollo.

-----------------------------------------------------------------------------------------------------------------------------

Guardamos el archivo y abrimos dos terminales, una para ejecutar el servidor y otra para ejecutar el cliente. Nos dirigimos en cada caso a:

    cd ./server/
    cd ./client/

Primero debemos ejecutar el cliente para que no haya ningún error, por lo que en la terminal que tenemos dentro de la carpeta del servidor ejecutaremos el siguiente comando:

    node ./server.js

Y en la carpeta del cliente ejecutaremos:

    npm start

Al introducir este comando nos redireccionará a la página principal de la aplicación en nuestro navegador en caso de que no podemos abrir el navegador y colocar en el buscador la dirección que nos indique en la consola, que sería de la forma:

    http://localhost:puerto/

Si además queremos ejecutar los test unitarios, creamos otro terminar y nos dirigimos a la carpeta servidor.

    cd ./server/

Una vez ahí, podemos utilizar el siguiente comando:

    npm test