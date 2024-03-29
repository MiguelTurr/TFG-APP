const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const mysql = require("./services/mysql.js");

const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const { server_hostname, server_port, cookie_secret } = require('./services/config.js');

//

const server = express();

server.use(express.json({ limit: '50mb' }));
server.use(express.urlencoded({ extended: true, limit: '50mb' }));
server.use(express.static('imagenes'));

server.use(express.json());
server.use(cookieParser(
    //secret: your_secret,
));

server.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST']
}));

server.use(fileUpload());

//

server.listen(server_port, function () {
    console.log(`El servidor se está ejecutando en http://${server_hostname}:${server_port}/`);
});

//

const comprobarToken = (req, _, next) => {

    const token = req.cookies.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, cookie_secret);
            req.userId = decoded.id;
            req.userRol = decoded.isAdmin;

            mysql.query('UPDATE usuarios SET ultimaConexion=NOW() WHERE ID=? LIMIT 1', decoded.id);

        } catch (err) {
            console.log(err);
        }
    }

    next();
};

//

const scanner = require('sonarqube-scanner');

scanner(
  {
    serverUrl : '',
    token : "",
    options: {
      'sonar.projectName': 'My App',
      'sonar.projectDescription': 'Description for "My App" project...',
      'sonar.sources': 'routes',
      'sonar.tests': 'test'
    }
  },
  () => process.exit()
)

//

server.use('/home', comprobarToken, require('./routes/home'));
server.use('/buscar', comprobarToken, require('./routes/buscar'));
server.use('/filtrar', comprobarToken, require('./routes/filtrar'));
server.use('/cookies', require('./routes/cookies'));

server.use('/cuenta', require('./routes/cuenta'));

server.use('/perfil', comprobarToken, require('./routes/perfil'));
server.use('/perfil/favoritos', comprobarToken, require('./routes/perfil-favoritos'));
server.use('/perfil/recomendados', comprobarToken, require('./routes/perfil-recomendados'));
server.use('/perfil/notificaciones', comprobarToken, require('./routes/perfil-notificaciones'));

server.use('/perfil/mis-alojamientos', comprobarToken, require('./routes/perfil-alojamientos'));
server.use('/perfil/mis-reservas', comprobarToken, require('./routes/perfil-reservas'));
server.use('/perfil/mis-ganancias', comprobarToken, require('./routes/perfil-ganancias'));
server.use('/perfil/mis-valoraciones', comprobarToken, require('./routes/perfil-valoraciones'));
server.use('/perfil/mis-chats', comprobarToken, require('./routes/perfil-chats'));

server.use('/usuario', require('./routes/usuario-ver'));
server.use('/usuario/denunciar', comprobarToken, require('./routes/usuario-denunciar'));
server.use('/usuario/valorar', comprobarToken, require('./routes/usuario-valorar'));

server.use('/alojamiento', comprobarToken, require('./routes/alojamiento-ver'));
server.use('/alojamiento/imagen', require('./routes/alojamiento-imagen'));
server.use('/alojamiento/reservar', comprobarToken, require('./routes/alojamiento-reservar'));
server.use('/alojamiento/valorar', comprobarToken, require('./routes/alojamiento-valorar'));

server.use('/admin', comprobarToken, require('./routes/admin'));
server.use('/admin/alojamientos', comprobarToken, require('./routes/admin-alojamientos'));
server.use('/admin/usuarios', comprobarToken, require('./routes/admin-usuarios'));
server.use('/admin/reportes', comprobarToken, require('./routes/admin-reportes'));