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
	`residencia` text default 'Sin definir',
	`imgPerfil` varchar(100) NOT NULL default 'default.png',

	


    PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

DELETE FROM `usuarios`;
---INSERT INTO `usuarios` (`activo`, `vertificacion`, `email`, `password`, `nombre`, `apellidos`, `fechaNac`, `telefono`) VALUES
	(1, '', 'manolo@app-tfg.com', 'manolo25', 'Manolo', 'Garcia Sanchez', '10-05-1990', '+34'),	
	(1, '', 'sara@app-tfg.com', 'sarita99', 'Sara', 'Lopez', '20-07-1997', '+35');

----------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `alojamientos` (
    `ID` int NOT NULL AUTO_INCREMENT,
	`usuarioID` int NOT NULL,
	`titulo` varchar(70) NOT NULL,
	`descripcion` varchar(800) NOT NULL,
	`precio` smallint NOT NULL,
	`descuento` float NOT NULL default 0.0,

	`ubicacion` varchar(200) NOT NULL,
	`visitas` int NOT NULL default 0,

	`viajeros` tinyint NOT NULL default 1,
	`habitaciones` tinyint NOT NULL default 1,
	`camas` tinyint NOT NULL default 1,
	`aseos` tinyint NOT NULL default 1,

	`horaEntrada` time NOT NULL,
	`horaSalida` time NOT NULL,

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
	`nombre` varchar(300) NOT NULL,

    CONSTRAINT FK_AlojamientoImagen FOREIGN KEY (alojamientoID) REFERENCES alojamientos(ID),
    PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

DELETE FROM `alojamientos_img`;

----------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `favoritos` (
    `ID` int NOT NULL AUTO_INCREMENT,
	`usuarioID` int NOT NULL,
	`alojamientoID` int NOT NULL,


    CONSTRAINT FK_UsuarioFavorito FOREIGN KEY (usuarioID) REFERENCES usuarios(ID),
    CONSTRAINT FK_AlojamientoFavorito FOREIGN KEY (alojamientoID) REFERENCES alojamientos(ID),
    PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

DELETE FROM `favoritos`;

----------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `valoraciones` (
    `ID` int NOT NULL AUTO_INCREMENT,
	`usuarioID` int NOT NULL,
	`alojamientoID` int NOT NULL,
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

DELETE FROM `valoraciones`;