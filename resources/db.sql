CREATE DATABASE IF NOT EXISTS `app`; /*!40100 DEFAULT CHARACTER SET utf8 */;
USE app;

----------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `usuarios` (
    	`ID` int NOT NULL AUTO_INCREMENT,
	`email` varchar(200) NOT NULL UNIQUE,
	`password` varchar(200) NOT NULL,
	`nombre` varchar(50) NOT NULL,
	`apellidos` varchar(50) NOT NULL,
	`genero` tinyint NOT NULL DEFAULT 0,
	`fechaNac` dattetime NOT NULL,
	`fechaReg` datettime NOT NULL DEFAULT NOW(),
	`telefono` int,

	


    	PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

DELETE FROM `usuarios`;
---INSERT INTO `usuarios` (`email`, `password`, `nombre`, `apellidos`, `fechaNac`) VALUES
	();

----------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `alojamientos` (
    	`ID` int NOT NULL AUTO_INCREMENT,
	`usuarioID` int NOT NULL,
	`titulo` varchar(70) NOT NULL,
	`descripcion` varchar(200) NOT NULL,

	
	
    	CONSTRAINT FK_UsuarioAlojamiento FOREIGN KEY (usuarioID) REFERENCES usuarios(ID),
    	PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

DELETE FROM `alojamientos`;

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