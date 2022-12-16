CREATE DATABASE IF NOT EXISTS `app`; /*!40100 DEFAULT CHARACTER SET utf8 */;
USE app;

----------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `usuarios` (
    `ID` int NOT NULL AUTO_INCREMENT,
	`activo` tinyint NOT NULL default 0,
	`verificacion` char(50) NOT NULL,
	`email` varchar(200) NOT NULL UNIQUE,
	`password` varchar(70) NOT NULL,
	`passReset` int NOT NULL default 0,
	`nombre` varchar(50) NOT NULL,
	`apellidos` varchar(90) NOT NULL,
	`presentacion` varchar(300) DEFAULT 'Escribe algo para que te conozcan...',
	`genero` tinyint NOT NULL DEFAULT 0,
	`fechaNac` date NOT NULL,
	`fechaReg` datetime NOT NULL DEFAULT NOW(),
	`telefono` varchar(20) NOT NULL,
	`residencia` text NOT NULL default '',
	`trabajo` varchar(70) NOT NULL default '',
	`idiomas` varchar(70) NOT NULL default 'Español',
	`imgPerfil` varchar(100) NOT NULL default 'default.png',
	`recibirCorreos` tinyint NOT NULL default 1,

	


    PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

DELETE FROM `usuarios`;

INSERT INTO `usuarios` (`ID`, `activo`, `verificacion`, `email`, `password`, `nombre`, `apellidos`, `fechaNac`, `telefono`) VALUES
	(1, 1, '', 'manolo@app-tfg.com', '$2a$10$xUG5DUhMOIVXbI1wCT5nKuM0Ua73msM2AxUXyX.YNUH.4IlquSca6', 'Manolo', 'Garcia Sanchez', '1990-05-10', '+34 4707529'),	
	(2, 1, '', 'sara@app-tfg.com', '$2a$10$xUG5DUhMOIVXbI1wCT5nKuM0Ua73msM2AxUXyX.YNUH.4IlquSca6', 'Sara', 'Lopez', '1997-07-20', '+35 0449749'),
	(3, 1, '', 'pepe@app-tfg.com', '$2a$10$xUG5DUhMOIVXbI1wCT5nKuM0Ua73msM2AxUXyX.YNUH.4IlquSca6', 'Pepe', 'González', '1992-07-20', '+35 3133896'),
	(4, 1, '', 'jose@app-tfg.com', '$2a$10$xUG5DUhMOIVXbI1wCT5nKuM0Ua73msM2AxUXyX.YNUH.4IlquSca6', 'Jose', 'Martínez Pérez', '1991-07-22', '+35 8623507'),
	(5, 1, '', 'federico@app-tfg.com', '$2a$10$xUG5DUhMOIVXbI1wCT5nKuM0Ua73msM2AxUXyX.YNUH.4IlquSca6', 'Fede', 'Muñoz Álvarez', '1980-07-15', '+35 9175917');

----------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `alojamientos` (
    `ID` int NOT NULL AUTO_INCREMENT,
	`usuarioID` int NOT NULL,
	`creadoEn` datetime NOT NULL default NOW(),
	`titulo` varchar(70) NOT NULL,
	`descripcion` varchar(2500) NOT NULL,
	`precio` smallint NOT NULL,

	--`oculto` tinyint NOT NULL default 0,

	`descuento` float NOT NULL default 0.0,
	`descuentoHasta` datetime default NULL,

	`ubicacion` varchar(200) NOT NULL,
	`localidad` varchar(70) NOT NULL,
	`provincia` varchar(70) default '',
	`comunidad` varchar(70) NOT NULL,
	`pais` varchar(70) NOT NULL,

	`lat` float NOT NULL,
	`lng` float NOT NULL,
	`imgCantidad` tinyint NOT NULL,

	`visitas` int NOT NULL default 0,
	`valoracionMedia` float NOT NULL default 0,
	`vecesValorado` int NOT NULL default 0,

	`viajeros` tinyint NOT NULL default 1,
	`habitaciones` tinyint NOT NULL default 1,
	`camas` tinyint NOT NULL default 1,
	`aseos` tinyint NOT NULL default 1,

	`horaEntrada` time,
	`horaSalida` time,

	`puedeFumar` tinyint NOT NULL default 0,
	`puedeFiestas` tinyint NOT NULL default 0,
	
	`servicios` int NOT NULL,

    CONSTRAINT FK_UsuarioAlojamiento FOREIGN KEY (usuarioID) REFERENCES usuarios(ID),
    PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

DELETE FROM `alojamientos`;

CREATE TABLE IF NOT EXISTS `alojamientos_img` (
    `ID` int NOT NULL AUTO_INCREMENT,
	`alojamientoID` int NOT NULL,
	`nombre` varchar(70) NOT NULL,

    CONSTRAINT FK_AlojamientoImagen FOREIGN KEY (alojamientoID) REFERENCES alojamientos(ID),
    PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

DELETE FROM `alojamientos_img`;

CREATE TABLE IF NOT EXISTS `alojamientos_valoraciones` (
    `ID` int NOT NULL AUTO_INCREMENT,
	`usuarioID` int NOT NULL,
	`alojamientoID` int NOT NULL,
	`creadaEn` datetime NOT NULL default NOW(),
	`mensaje` varchar(300) NOT NULL,
	`valLlegada` float NOT NULL,
	`valVeracidad` float NOT NULL,
	`valComunicacion` float NOT NULL,
	`valUbicacion` float NOT NULL,
	`valLimpieza` float NOT NULL,
	`valCalidad` float NOT NULL,

    CONSTRAINT FK_UsuarioValoracion FOREIGN KEY (usuarioID) REFERENCES usuarios(ID),
    CONSTRAINT FK_AlojamientoValoracion FOREIGN KEY (alojamientoID) REFERENCES alojamientos(ID),
    PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

DELETE FROM `alojamientos_valoraciones`;

----------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `usuarios_favoritos` (
    `ID` int NOT NULL AUTO_INCREMENT,
	`usuarioID` int NOT NULL,
	`alojamientoID` int NOT NULL,
	`addEn` datetime NOT NULL default NOW(),


    CONSTRAINT FK_UsuarioFavorito FOREIGN KEY (usuarioID) REFERENCES usuarios(ID),
    CONSTRAINT FK_AlojamientoFavorito FOREIGN KEY (alojamientoID) REFERENCES alojamientos(ID),
    PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

ALTER TABLE `usuarios_favoritos` ADD CONSTRAINT UQ_UsuarioID_AlojamientoID UNIQUE(usuarioID, alojamientoID);

DELETE FROM `favoritos`;

----------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `usuarios_valoraciones` (
    `ID` int NOT NULL AUTO_INCREMENT,
	`usuarioID` int NOT NULL,
	`userValoradoID` int NOT NULL,
	`sinLeer` tinyint NOT NULL default 0,
	`creadoEn` datetime NOT NULL default NOW(),
	`tipo` int NOT NULL,
	`mensaje` varchar(300) NOT NULL,


    CONSTRAINT FK_UsuarioValora FOREIGN KEY (usuarioID) REFERENCES usuarios(ID),
    CONSTRAINT FK_UsuarioValorado FOREIGN KEY (userValoradoID) REFERENCES usuarios(ID),
    PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

DELETE FROM `usuarios_valoraciones`;
----------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `usuarios_denuncias` (
    `ID` int NOT NULL AUTO_INCREMENT,
	`usuarioID` int NOT NULL,
	`reportadoID` int NOT NULL,
	`creadoEn` datetime NOT NULL default NOW(),
	`mensaje` varchar(150) NOT NULL,

    CONSTRAINT FK_UsuarioReportante FOREIGN KEY (usuarioID) REFERENCES usuarios(ID),
    CONSTRAINT FK_UsuarioReportado FOREIGN KEY (reportadoID) REFERENCES usuarios(ID),
    PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

DELETE FROM `usuarios_denuncias`;
----------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `usuarios_reservas` (
    `ID` int NOT NULL AUTO_INCREMENT,
	`usuarioID` int NOT NULL,
	`alojamientoID` int NOT NULL,
	`estado` int NOT NULL default 0,
	`creadoEn` datetime NOT NULL default NOW(),
	`fechaEntrada` datetime NOT NULL,
	`fechaSalida` datetime NOT NULL,
	`costeTotal` int NOT NULL,
	`numeroViajeros` tinyint NOT NULL default 1,
	`numeroMascotas` tinyint NOT NULL default 0,
	`valoraEstancia` tinyint NOT NULL default -1,
	`valoraHospedador` tinyint NOT NULL default -1,

    CONSTRAINT FK_UsuarioReserva FOREIGN KEY (usuarioID) REFERENCES usuarios(ID),
    CONSTRAINT FK_AlojamientoReserva FOREIGN KEY (alojamientoID) REFERENCES alojamientos(ID),
    PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

DELETE FROM `usuarios_reservas`;

----------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `usuarios_chats` (
    `ID` int NOT NULL AUTO_INCREMENT,
	`usuario1` int NOT NULL,
	`usuario2` int NOT NULL,
	`nuevosMensajes` tinyint NOT NULL default 1,
	`nuevoEn` datetime NOT NULL default NOW(),

    CONSTRAINT FK_ChatUsuarioUno FOREIGN KEY (usuario1) REFERENCES usuarios(ID),
    CONSTRAINT FK_ChatUsuarioDos FOREIGN KEY (usuario2) REFERENCES usuarios(ID),
    PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

DELETE FROM `usuarios_chats`;

CREATE TABLE IF NOT EXISTS `usuarios_chats_mensajes` (
    `ID` int NOT NULL AUTO_INCREMENT,
	`chatID` int NOT NULL,
	`emisorID` int NOT NULL,
	`creadoEn` datetime NOT NULL default NOW(),
	`mensaje` varchar(150) NOT NULL,


    CONSTRAINT FK_ChatMensaje FOREIGN KEY (chatID) REFERENCES usuarios_chats(ID),
    CONSTRAINT FK_EmisorMensaje FOREIGN KEY (emisorID) REFERENCES usuarios(ID),
    PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

DELETE FROM `usuarios_chats_mensajes`;

----------------------------------------------------------------------------------