-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-12-2022 a las 15:30:19
-- Versión del servidor: 10.4.20-MariaDB
-- Versión de PHP: 8.0.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `app`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alojamientos`
--

CREATE TABLE `alojamientos` (
  `ID` int(11) NOT NULL,
  `usuarioID` int(11) NOT NULL,
  `creadoEn` datetime NOT NULL DEFAULT current_timestamp(),
  `titulo` varchar(70) NOT NULL,
  `descripcion` varchar(2500) DEFAULT NULL,
  `precio` smallint(6) NOT NULL,
  `precioAnterior` smallint(6) DEFAULT NULL,
  `ubicacion` varchar(200) NOT NULL,
  `localidad` varchar(70) NOT NULL,
  `provincia` varchar(70) NOT NULL DEFAULT '''''',
  `comunidad` varchar(70) NOT NULL DEFAULT '''''',
  `pais` varchar(70) NOT NULL DEFAULT '''''',
  `lat` float NOT NULL DEFAULT 0,
  `lng` float NOT NULL DEFAULT 0,
  `imgCantidad` tinyint(4) NOT NULL DEFAULT 0,
  `visitas` int(11) NOT NULL DEFAULT 0,
  `valoracionMedia` float NOT NULL DEFAULT 0,
  `vecesValorado` int(11) NOT NULL DEFAULT 0,
  `viajeros` tinyint(4) NOT NULL DEFAULT 1,
  `habitaciones` tinyint(4) NOT NULL DEFAULT 1,
  `camas` tinyint(4) NOT NULL DEFAULT 1,
  `aseos` tinyint(4) NOT NULL DEFAULT 1,
  `horaEntrada` time DEFAULT NULL,
  `horaSalida` time DEFAULT NULL,
  `puedeFumar` tinyint(4) NOT NULL DEFAULT 0,
  `puedeFiestas` tinyint(4) NOT NULL DEFAULT 0,
  `servicios` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `alojamientos`
--

INSERT INTO `alojamientos` (`ID`, `usuarioID`, `creadoEn`, `titulo`, `descripcion`, `precio`, `precioAnterior`, `ubicacion`, `localidad`, `provincia`, `comunidad`, `pais`, `lat`, `lng`, `imgCantidad`, `visitas`, `valoracionMedia`, `vecesValorado`, `viajeros`, `habitaciones`, `camas`, `aseos`, `horaEntrada`, `horaSalida`, `puedeFumar`, `puedeFiestas`, `servicios`) VALUES
(1, 9, '2022-12-30 20:30:34', 'Durmiendo entre arboles/cabañas con encanto Rioja', 'La ubicación de las cabañas es única, ya que estando en plena naturaleza donde solo se oyen los sonidos relajantes de pájaros y arboles, están a la vez muy cerca de todos los servicios para poder hacer  actividades y conocer los sitios más bonitos de la Rioja.<br>Saliendo de las cabañas puedes ir andando por la ruta verde del  Oja-Tiron pasando por una preciosa cascada, viñas y bosques hasta Haro (4 km).<br>En esta zona son famosos los atardeceres, con cielos rojizos difíciles de olvidar.', 116, NULL, 'Anguciana, La Rioja, España', 'Anguciana', 'La Rioja', 'La Rioja', 'España', 42.5738, -2.90075, 5, 348, 0, 0, 4, 1, 3, 1, '10:00:00', '20:00:00', 1, 1, 511),
(2, 4, '2022-12-15 20:30:34', 'La Cabaña del Pico de la Miel', 'A 35 minutos de Madrid, ubicada en la urbanización Pradera del Amor en el Berrueco, y muy cerca de la A-1 y La Cabrera. Muy cercano al pantano del Atazar y a los pueblos negros de Guadalajara, así como del valle del Lozoya  y del parque nacional de Guadarrama. Se pueden hacer actividades como senderismo, escalada, rutas a caballo, piragüismos', 406, 197, 'El Berrueco, Comunidad de Madrid, España', 'El Berrueco', 'Madrid', 'Comunidad de Madrid', 'España', 40.8893, -3.56292, 5, 254, 1.25, 2, 6, 2, 3, 1, NULL, NULL, 0, 0, 297),
(3, 1, '2022-11-30 20:30:34', 'Cabaña en el bosque', 'Escribe una descripción...', 65, NULL, 'Hornedo, Cantabria, España', 'Hornedo', 'Cantabria', 'Cantabria', 'España', 43.3658, -3.62944, 5, 134, 0, 0, 2, 1, 1, 1, NULL, NULL, 0, 0, 288),
(4, 4, '2022-11-30 20:30:34', '\"Rivendell\", la casa de madera de la montaña', 'Vall de Laguar es un valle activo que produce cerezas, aceitunas, almendras y naranjas. Se compone de tres pueblos conocidos localmente como pueblo de dalt (arriba - Benimaurell), d \'enmidg (Fleix - medio) y baix (Campell - fondo). Por la mañana temprano se puede escuchar las campanas de la  iglesia sonando en sucesión por el valle a través de los tres pueblos.', 75, NULL, 'Alicante, Comunidad Valenciana, España', 'Alicante (Alacant)', 'Alicante', 'Comunidad Valenciana', 'España', 38.346, -0.490685, 5, 75, 3.55, 3, 3, 1, 2, 1, NULL, NULL, 0, 0, 288),
(8, 1, '2022-11-30 20:30:34', 'chalet cerca de todo en paz', 'Escribe una descripción...', 95, NULL, 'Labenne, Nouvelle-Aquitaine, Francia', 'Labenne', 'Landas', 'Nueva Aquitania', 'Francia', 43.5922, -1.42657, 5, 6, 0, 0, 6, 2, 5, 1, NULL, NULL, 0, 0, 493),
(9, 3, '2022-11-30 20:30:34', 'Cabaña madera D fines de semana', 'Terreno rural rodeado de pinos', 60, NULL, 'Cenicientos, Comunidad de Madrid, España', 'Cenicientos', 'Madrid', 'Comunidad de Madrid', 'España', 40.2625, -4.46581, 5, 15, 0, 0, 3, 2, 2, 1, NULL, NULL, 0, 0, 356),
(11, 3, '2022-11-30 20:30:34', 'Casa  Alegria con piscina privada y cerca del mar', 'La zona en la que se encuentra la casa es un lugar muy tranquilo con pocos vecinos, rodeada de campo con arboles frutales. <br>Tiene buen acceso a través de la carretera N340<br>Situada a dos minutos de la playa (en coche). La playa mas cercana a la casa es la llamada playa Madrid prácticamente desierta durante los días entre semana.<br> A cinco del pueblo de Almayate donde encontraras todo lo que necesites (restaurantes, y diferentes comercios).Y a unos ocho minutos de la siempre turística  Torre del Mar donde podrás disfrutar en la multitud de restaurantes y chiringuitos típicos de la costa del sol, o simplemente pasear por el paseo junto al mar.<br>En la zona es prácticamente virgen sin construir, donde podrás pasear por los diferentes senderos y disfrutar de las inmejorables vistas al mar y a las montañas.<br>Al oeste encontramos Rincón de la Victoria, Málaga capital, Torremolinos, Fuengirola, Marbella y Ronda. Al este La caleta con su puerto, Frigiliana, Nerja los acantilados de Maro, La Herradura y multitud de pueblos típicos y con encanto andaluz.<br>Situada a 1 hora de Granada (Sierra Nevada), Córdoba y a unas dos horas del resto de provincias de Andalucía.', 70, NULL, 'Vélez-Málaga, Andalucía, España', 'Vélez-Málaga', 'Málaga', 'Andalucía', 'España', 36.7799, -4.10056, 5, 6, 0, 0, 4, 2, 3, 1, NULL, NULL, 0, 0, 440),
(12, 2, '2022-11-30 20:30:34', 'La Casa de Madera', 'La Casa de Madera se encuentra en el borde de la Reserva de la Biosfera de Urdaibai, y a unos 20 minutos en coche de los principales lugares de interés (centro de Bilbao, playas, Guernica, Reserva de la Biosfera, Camino de Santiago Norte ...).<br><br>Está situado en un barrio muy tranquilo, en el corazón de Vizcaya. La casa está rodeada de 1 hectáreas de terreno, por lo que no se garantizan distracciones. Se encuentra a 15 minutos de la plaza principal de Arrieta caminando.', 300, NULL, 'Arrieta, Euskadi, España', 'Arrieta', 'Vizcaya', 'País Vasco', 'España', 43.3417, -2.76897, 5, 4, 0, 0, 12, 4, 9, 3, NULL, NULL, 0, 0, 481),
(13, 1, '2022-11-30 20:30:34', 'Chalet de Madera pensado para tu bienestar', 'Ambiente único, exclusivo y discreto', 110, NULL, 'El Cuervo, Andalucía, España', 'El Cuervo', 'Sevilla', 'Andalucía', 'España', 36.8528, -6.03852, 5, 5, 0, 0, 4, 2, 4, 1, NULL, NULL, 0, 0, 444),
(14, 1, '2022-11-30 20:30:34', 'Gîtes Etxerria Iparla', 'Escribe una descripción...', 85, NULL, 'Saint-Étienne-de-Baïgorry, Nouvelle-Aquitaine, Francia', 'Saint-Étienne-de-Baïgorry', 'Pirineos Atlánticos', 'Nueva Aquitania', 'Francia', 43.1752, -1.34747, 5, 3, 0, 0, 4, 2, 3, 1, NULL, NULL, 0, 0, 488),
(16, 3, '2022-11-30 20:30:34', 'Casita camino viejo', 'Casa aislada en montaña,a dos Km. del pueblo mas cercano en zona protegida.', 110, NULL, 'Aigües, Comunidad Valenciana, España', 'Aguas de Busot', 'Alicante', 'Comunidad Valenciana', 'España', 38.5009, -0.363655, 5, 63, 0, 0, 2, 1, 1, 1, NULL, NULL, 0, 0, 437),
(17, 4, '2022-11-30 20:30:34', 'Niño mayor Saralex, Val d \'Armen 1600m Valais Alpes', 'Eison la Crettaz es un pequeño y auténtico pueblo valais en la parroquia de St. Martin en el tranquilo, salvaje y gentil Val d \'Hérens.<br>El valle cuenta con 4 zonas de esquí y esquí de fondo (ambos a unos 30 minutos en coche del granero), 85 km de pistas de raquetas de nieve y muchas otras actividades de invierno. <br>En verano puedes practicar senderismo, ciclismo, montañismo, escalada en roca, parapente, etc. y si tienes suerte incluso puedes ver una pelea de vacas Eringer.', 161, NULL, 'Saint-Martin, Valais, Suiza', 'Saint-Martin', 'Distrito de Hérens', 'Cantón del Valais', 'Suiza', 46.1733, 7.44332, 5, 5, 0, 0, 5, 1, 3, 1, NULL, NULL, 0, 0, 296),
(19, 3, '2022-11-30 20:30:34', 'Cabaña alpina con vistas de ensueño del Valle del Alto Valais', 'Alp tranquilo con fantásticas vistas. La mejor región para practicar senderismo y excursiones de esquí/raquetas de nieve. <br><br>Nuestro hotel de montaña está en las inmediaciones y ofrece la posibilidad de utilizar la zona de bienestar por un pequeño recargo. (Sauna/hidromasaje) Hierfür ist eine Voranmeldung nötig.<br><br>Alp tranquilo con unas vistas impresionantes. Ubicación privilegiada para practicar senderismo, raquetas de nieve y excursiones de esquí.', 183, NULL, 'Ernen, Wallis, Suiza', 'Ernen', 'Distrito de Goms', 'Cantón del Valais', 'Suiza', 46.3985, 8.14577, 5, 2, 0, 0, 6, 2, 5, 1, NULL, NULL, 0, 0, 481),
(21, 1, '2022-11-30 20:30:34', 'Casa de campo cerca del Chemin des Dames', 'Escribe una descripción...', 69, NULL, 'Corbeny, Hauts-de-France, Francia', 'Corbeny', 'Aisne', 'Alta Francia', 'Francia', 49.4623, 3.82248, 5, 1, 0, 0, 4, 0, 2, 1, NULL, NULL, 0, 0, 492),
(23, 2, '2022-11-30 20:30:34', 'Chalet des plátanos. Entre  \"Alsacia y Vosgos\".', 'Chalet situado en los Vosgos y a 1 km de L’Alsace. Ubicación ideal para muchas visitas.<br>Tranquilidad asegurada pero tiendas a 3 km de distancia (panadería tradicional + panadería artesanal, carnicería, pequeño supermercado), encontrarás muchos productos locales.<br>Restaurantes<br>Oficina de correos, médico, farmacia', 100, NULL, 'La Grande-Fosse, Grand Est, Francia', 'La Grande-Fosse', 'Vosgos', 'Gran Este', 'Francia', 48.3397, 7.06868, 5, 1, 0, 0, 8, 3, 6, 2, NULL, NULL, 0, 0, 428),
(24, 4, '2022-11-30 20:30:34', 'La cabane à Montmorillon', 'La cabaña está situada cerca de Montmorillon, cuyo pintoresco casco antiguo, \"Cité de l \'Ecrit\" (librerías, artesanos, restaurantes), está a poca distancia a pie (menos de media hora).<br><br>Desde la cabaña se puede hacer senderismo a través del Sendero Gardour. <br><br>- Un rico patrimonio para descubrir en el sitio y en los alrededores: Abadía de San Savin clasificado como Patrimonio de la Humanidad por la UNESCO, iglesias románicas, ciudad medieval de Chauvigny, pueblo clasificado como Angles sur l \'Anglin ...<br>- Civaux a 20 minutos: balneo, bolos, Planète des crocodiles&nbsp;<br>- Parc Naturel de la Brenne a 45 minutos<br>- Kayak, escalada al CPA Lathus a 20 minutos<br>- Poitiers y Futuroscope a menos de 1 hora, Limoges y Tours a 1,30', 86, NULL, 'Montmorillon, Nouvelle-Aquitaine, Francia', 'Montmorillon', 'Vienne', 'Nueva Aquitania', 'Francia', 46.42, 0.868048, 5, 4, 0, 0, 2, 1, 1, 1, NULL, NULL, 0, 0, 416),
(25, 2, '2022-11-30 20:30:34', 'Chalet Nougat - Ovo Network', 'Escribe una descripción...', 833, NULL, 'Manigod, Haute Savoie, Francia', 'Manigod', 'Alta Saboya', 'Auvernia-Ródano-Alpes', 'Francia', 45.8612, 6.36914, 5, 0, 0, 0, 14, 6, 14, 6, NULL, NULL, 0, 0, 505),
(26, 1, '2022-11-30 20:30:34', 'Chalet alpino tradicional de madera, vista del monte Blanco', 'El chalet está situado entre Chamonix y Les Praz, una zona residencial y tranquila de la montaña. En las inmediaciones encontrarás el río, que puedes recorrer a pie hasta llegar a la ciudad, así como un lago. Les Praz está a cinco minutos a pie, donde puedes tomar un café o una baguette, y Chamonix, a 20 minutos a pie o a tres minutos en coche, tiene una animada vida nocturna con muchos restaurantes tradicionales de Saboya, after-ski, bares, cafeterías, tiendas y mucho más.', 175, NULL, 'Chamonix-Mont-Blanc, Auvernia-Ródano-Alpes, Francia', 'Chamonix-Mont-Blanc', 'Alta Saboya', 'Auvernia-Ródano-Alpes', 'Francia', 45.9237, 6.86943, 5, 0, 0, 0, 5, 2, 5, 1, NULL, NULL, 0, 0, 288),
(27, 3, '2022-11-30 20:30:34', 'Chalet Weidhus - Chalet privado en Toplage', 'Ambiente tranquilo en muy buen barrio. En el centro del pueblo de Saanenmöser, a unos 15 minutos a pie, hay una pequeña tienda, dos tiendas de esquí, un remonte principal de la región y varios hoteles. Todas las demás tiendas para las necesidades diarias se puede llegar en unos minutos en coche en los vecinos Schönried, Gstaad o Zweisimmen.<br>En buenas condiciones de nieve, incluso se puede esquiar desde el chalet hasta la estación del valle del Rellerli.', 145, NULL, 'Saanenmöser, Cantón de Berna, Suiza', 'Saanen', 'Obersimmental', 'Cantón de Berna', 'Suiza', 46.5151, 7.30543, 5, 2, 0, 0, 6, 2, 8, 1, NULL, NULL, 0, 0, 488),
(33, 3, '2022-11-30 20:30:34', 'Burgihitta - Alojamiento alpino en la naturaleza virgen', 'Experiencia a 1800 metros sobre el nivel del mar. M. Naturaleza pura. Flora y fauna en un entorno prístino.<br>Relájese del estrés diario.<br>Recargue energías en hermosas caminatas, experimente en la vida real lo que sólo sabe de las imágenes. Montañas cubiertas de nieve, prados alpinos florecientes, gamuzas pastando, jugando marmotas y mucho más...', 163, NULL, 'Bettmeralp, Valais, Suiza', 'Bettmeralp', 'Raron District', 'Cantón del Valais', 'Suiza', 46.3905, 8.06188, 5, 0, 0, 0, 6, 1, 4, 1, NULL, NULL, 0, 0, 352),
(34, 3, '2022-11-30 20:30:34', 'La cabaña de troncos del Vilaró', '- VEN PREPARADO: Vidrà tiene una pequeña tienda donde puedes encontrar lo esencial, por eso te recomendamos que llegues a las cabañas con todo lo que necesitas. <br>- Estamos en medio del invernadero de Milany. Vidrà está a unos 4 km por pista forestal. Hay 2 caminos para llegar a la finca de Vilaró. Son caminos forestales. Se puede llegar a ellos con coches normales, pero no son muy bajos y conducir con cuidado. RECOMANEM SUV o 4X4.<br>- A la cabana *S\'HI ARRIBA A PEU*<br>Aparcareu a la finca i en 2 min a peu per un corriol arribeu a la vostra llar! Recomendamos calzado de montaña cómodo, linterna(delantera) y parche trasero.<br>-Agua POTABLE: El agua de la cabaña se puede utilizar para cocinar pero recomendamos agua embotellada para beber.<br>- Tendrás sábanas y toallas<br>- Para los temerarios hay una gorgona NATURAL PRIVADA para refrescarse.<br>- No PREPARAMOS EL DESAYUNO. <br>- Piensa en el Vilaró como una finca autosostenible. La energía es con paneles solares y el agua nos llega con un sistema hidráulico (RAM) de agua proveniente de la mina.<br> **Exigimos el uso responsable de los recursos**<br>(¡los utensilios con resistencias eléctricas son los mayores enemigos de las placas! ¡Secadores de pelo y una mejor plancha en casa! )<br>Para obtener información sobre la zona... ¡pregunte! ¡Las opciones son infinitas!<br>Si tienes alguna pregunta, no dudes en ponerte en contacto con nosotros. <br>¡Salud y hasta pronto!', 150, NULL, 'Vidra, Catalunya, España', 'Vidrà', 'Girona', 'Cataluña', 'España', 42.1239, 2.31015, 5, 0, 0, 0, 4, 2, 4, 1, NULL, NULL, 0, 0, 352),
(36, 4, '2022-11-30 20:30:34', 'Un hito, una verdadera experiencia Heidi', 'La casa está al final de un camino sin salida. Los alrededores son tranquilos pero no aislados. Hay muchos caminos para caminar.', 117, NULL, 'Vouvry, Valais, Suiza', 'Vouvry', 'Distrito de Monthey', 'Cantón del Valais', 'Suiza', 46.3364, 6.89101, 5, 1, 0, 0, 8, 3, 3, 2, NULL, NULL, 0, 0, 489),
(37, 4, '2022-11-30 20:30:34', 'Anty \'s Pond: Davy Crockett\' s Hut', 'Estamos a 4 km de un negocio y la ciudad de Remiremont en un nido verde entre estanque , prado y bosque.  Muchas rutas de senderismo prometen bonitos paseos.', 72, NULL, 'Saint-Nabord, Grand Est, Francia', 'Saint-Nabord', 'Vosgos', 'Gran Este', 'Francia', 48.0472, 6.57831, 5, 0, 0, 0, 2, 1, 1, 0, NULL, NULL, 0, 0, 352),
(38, 3, '2022-11-30 20:30:34', 'Lujo con mejores vistas - Precios especiales de verano', 'Nuestro apartamento está situado en el centro del valle de Lauterbrunnen.<br>A 10 minutos a pie se encuentra en el centro de Lauterbrunnen.<br>Allí encontrarás un supermercado, algunos buenos restaurantes y bares tradicionales y muchas tiendas diferentes.<br><br>Lauterbrunnen es un pequeño pueblo alpino. Forma parte del patrimonio mundial de la UNESCO jungfrau y es conocida por sus numerosas cascadas, espectaculares paredes rocosas macizas y la impresionante naturaleza. <br>El \"Top of Europe\" en el Jungfraujoch, el \"James Bond World\" en el Schilthorn e Interlaken la famosa ciudad suiza entre los dos hermosos lagos están a la vuelta de la esquina.', 221, NULL, 'Lauterbrunnen, Bern, Suiza', 'Lauterbrunnen', 'Interlaken-Oberhasli District', 'Cantón de Berna', 'Suiza', 46.5935, 7.9091, 5, 1, 0, 0, 4, 1, 2, 1, NULL, NULL, 0, 0, 425),
(39, 5, '2022-11-30 20:30:34', 'LE CHALET, un vrai petit nid !!!', 'estamos cerca del circo de Gavarnie (7kms), pero también otras pequeñas maravillas que podemos mostrarte. Nuestra pequeña área tiene sólo unas pocas casas, pero a 2 km encontrará todas las comodidades.', 74, NULL, 'Gèdre, Occitanie, Francia', 'Gavarnie-Gèdre', 'Altos Pirineos', 'Occitania', 'Francia', 42.7864, 0.019136, 5, 0, 0, 0, 2, 1, 1, 0, NULL, NULL, 0, 0, 424),
(42, 3, '2022-11-30 20:30:34', 'Wonderful Kientaler Bijou - vista de Blümlisalp', 'El chalet tiene vistas directas y sin obstáculos del Blümlisalp y otros picos (Hoechstflue, Gerihorn, etc.). El chalet es \"ideal\" para los amantes de la naturaleza, excursionistas y personas que buscan algo aislado...', 193, NULL, 'Reichenbach im Kandertal, Bern, Suiza', 'Reichenbach im Kandertal', 'Frutigen-Niedersimmental', 'Cantón de Berna', 'Suiza', 46.6254, 7.69405, 5, 0, 0, 0, 3, 2, 2, 1, NULL, NULL, 0, 0, 480),
(43, 1, '2022-11-30 20:30:34', 'Encantador chalet de montaña con vistas', 'El Col des Bagenelles alcanza los 905m, transición entre el Val d \'Argent y el valle de Kaysersberg en el país de Welche. La cabaña está debajo de la carretera de la cresta, que llega al paso. Es un vestigio de la Primera Guerra Mundial y hoy una ruta turística que reúne los diferentes pasos de los Vosgos. A veces animado los fines de semana en el clima cálido, el sitio sigue siendo muy virgen en comparación con los otros pases de Vosgian y siempre muy tranquilo durante la semana y la noche.<br>Es la base perfecta para explorar la región, tanto la naturaleza de Vosgian como el viñedo y sus pueblos más bellos en Navidad.<br><br>El aparcamiento da la bienvenida a los excursionistas  con una magnífica vista del lado sur hacia el lago blanco o el lado norte en la Val d \'Argent.<br><br>Casa rural contigua con terraza.<br><br>En verano: innumerables caminatas de cualquier nivel con almuerzo en las casas de campo en las alturas o castillos sobre el viñedo. Paseos en bicicleta eléctrica (alquileres posibles en las inmediaciones). Actividades en el Lago Blanco con trineos de verano para niños, ciclismo todoterreno, escalada de árboles.<br>Lake Gerardmer balneario.<br>Visite los viñedos de Alsacia, el castillo de Haut Koenisgbourg, volerie de águila, etc... ver fotos.<br><br>En invierno, si hay nieve (905m), la estación de Les Bagenelles está equipada con pistas de trineo y pistas de esquí de fondo (route des crêtes) adyacentes al chalet. Esquí alpino con 3 pistas y remonte a 300m. Salida del esquí de fondo en el chalet.<br>Mapa de las huellas en las fotos.<br><br>Estación de esquí del lago blanco 900/1200 a pocos minutos en coche, verano e invierno (esquí, ciclismo de montaña, escalada de árboles, trineo de verano...).<br><br>Los pueblos de los viñedos Kaysersberg, Ammerschwihr, Riquewihr, Ribeauvillé y sus mercados de Navidad, la Ruta del Vino y la ciudad de Colmar están a 20 minutos.<br><br>Supermercado a 15 minutos en las minas de Sainte Marie aux o Kaysersberg, producto local de la temporada a 10 minutos en coche en Hachimette.', 152, NULL, 'Le Bonhomme, Grand Est, Francia', 'Le Bonhomme', 'Alto Rin', 'Gran Este', 'Francia', 48.1719, 7.1163, 5, 0, 0, 0, 6, 3, 4, 1, NULL, NULL, 0, 0, 416),
(44, 2, '2022-11-30 20:30:34', 'Jacuzzi LaPauseEnSoi Cabane Lève-Tôt Vue Pyrénées', 'El pueblo de Ponlat-Taillebourg está a 30 minutos de la frontera española, a 1 hora de Toulouse y Pau, a 30 minutos de Tarbes y a 50 minutos de Lourdes. Se puede llegar a las estaciones de esquí en 1 hora (por ejemplo: Le Mourtis a los 40 min, Nistos a los 25 min..). <br>Si eres un entusiasta del golf, puedes practicar a 5 minutos de distancia. Estarás a 5 minutos del aeródromo para deslizarte. La Base Náutica de Montréjeau está a 5 minutos en coche de Paddel o Pedalo. <br>A los 15 min, ir a nadar en una piscina natural y orgánica \'Les\' Ô cybelles \'. Puedes visitar Saint Bertrand de Comminges, las cuevas prehistóricas de Gargas, la pequeña Amazonía de los Pirineos...<br>La cabaña está rodeada por un gran bosque donde se puede acceder a varias caminatas y bicicletas de montaña.', 190, NULL, 'Ponlat-Taillebourg, Occitanie, Francia', 'Ponlat-Taillebourg', 'Alto Garona', 'Occitania', 'Francia', 43.1095, 0.600134, 5, 0, 0, 0, 2, 1, 1, 1, NULL, NULL, 0, 0, 416);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alojamientos_img`
--

CREATE TABLE `alojamientos_img` (
  `ID` int(11) NOT NULL,
  `alojamientoID` int(11) NOT NULL,
  `nombre` varchar(300) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `alojamientos_img`
--

INSERT INTO `alojamientos_img` (`ID`, `alojamientoID`, `nombre`) VALUES
(1, 1, 'casa_1_0.jpg'),
(2, 1, 'casa_1_1.jpg'),
(3, 1, 'casa_1_2.jpg'),
(4, 1, 'casa_1_3.jpg'),
(5, 1, 'casa_1_4.jpg'),
(6, 2, 'casa_2_0.jpg'),
(7, 2, 'casa_2_1.jpg'),
(8, 2, 'casa_2_2.jpg'),
(9, 2, 'casa_2_3.jpg'),
(10, 2, 'casa_2_4.jpg'),
(11, 3, 'casa_3_0.jpg'),
(12, 3, 'casa_3_1.jpg'),
(13, 3, 'casa_3_2.jpg'),
(14, 3, 'casa_3_3.jpg'),
(15, 3, 'casa_3_4.jpg'),
(16, 4, 'casa_4_0.jpg'),
(17, 4, 'casa_4_1.jpg'),
(18, 4, 'casa_4_2.jpg'),
(19, 4, 'casa_4_3.jpg'),
(20, 4, 'casa_4_4.jpg'),
(36, 8, 'casa_8_0.jpg'),
(37, 8, 'casa_8_1.jpg'),
(38, 8, 'casa_8_2.jpg'),
(39, 8, 'casa_8_3.jpg'),
(40, 8, 'casa_8_4.jpg'),
(41, 9, 'casa_9_0.jpg'),
(42, 9, 'casa_9_1.jpg'),
(43, 9, 'casa_9_2.jpg'),
(44, 9, 'casa_9_3.jpg'),
(45, 9, 'casa_9_4.jpg'),
(51, 11, 'casa_11_0.jpg'),
(52, 11, 'casa_11_1.jpg'),
(53, 11, 'casa_11_2.jpg'),
(54, 11, 'casa_11_3.jpg'),
(55, 11, 'casa_11_4.jpg'),
(56, 12, 'casa_12_0.jpg'),
(57, 12, 'casa_12_1.jpg'),
(58, 12, 'casa_12_2.jpg'),
(59, 12, 'casa_12_3.jpg'),
(60, 12, 'casa_12_4.jpg'),
(61, 13, 'casa_13_0.jpg'),
(62, 13, 'casa_13_1.jpg'),
(63, 13, 'casa_13_2.jpg'),
(64, 13, 'casa_13_3.jpg'),
(65, 13, 'casa_13_4.jpg'),
(66, 14, 'casa_14_0.jpg'),
(67, 14, 'casa_14_1.jpg'),
(68, 14, 'casa_14_2.jpg'),
(69, 14, 'casa_14_3.jpg'),
(70, 14, 'casa_14_4.jpg'),
(76, 16, 'casa_16_0.jpg'),
(77, 16, 'casa_16_1.jpg'),
(78, 16, 'casa_16_2.jpg'),
(79, 16, 'casa_16_3.jpg'),
(80, 16, 'casa_16_4.jpg'),
(81, 17, 'casa_17_0.jpg'),
(82, 17, 'casa_17_1.jpg'),
(83, 17, 'casa_17_2.jpg'),
(84, 17, 'casa_17_3.jpg'),
(85, 17, 'casa_17_4.jpg'),
(91, 19, 'casa_19_0.jpg'),
(92, 19, 'casa_19_1.jpg'),
(93, 19, 'casa_19_2.jpg'),
(94, 19, 'casa_19_3.jpg'),
(95, 19, 'casa_19_4.jpg'),
(101, 21, 'casa_21_0.jpg'),
(102, 21, 'casa_21_1.jpg'),
(103, 21, 'casa_21_2.jpg'),
(104, 21, 'casa_21_3.jpg'),
(105, 21, 'casa_21_4.jpg'),
(111, 23, 'casa_23_0.jpg'),
(112, 23, 'casa_23_1.jpg'),
(113, 23, 'casa_23_2.jpg'),
(114, 23, 'casa_23_3.jpg'),
(115, 23, 'casa_23_4.jpg'),
(116, 24, 'casa_24_0.jpg'),
(117, 24, 'casa_24_1.jpg'),
(118, 24, 'casa_24_2.jpg'),
(119, 24, 'casa_24_3.jpg'),
(120, 24, 'casa_24_4.jpg'),
(121, 25, 'casa_25_0.jpg'),
(122, 25, 'casa_25_1.jpg'),
(123, 25, 'casa_25_2.jpg'),
(124, 25, 'casa_25_3.jpg'),
(125, 25, 'casa_25_4.jpg'),
(126, 26, 'casa_26_0.jpg'),
(127, 26, 'casa_26_1.jpg'),
(128, 26, 'casa_26_2.jpg'),
(129, 26, 'casa_26_3.jpg'),
(130, 26, 'casa_26_4.jpg'),
(131, 27, 'casa_27_0.jpg'),
(132, 27, 'casa_27_1.jpg'),
(133, 27, 'casa_27_2.jpg'),
(134, 27, 'casa_27_3.jpg'),
(135, 27, 'casa_27_4.jpg'),
(161, 33, 'casa_33_0.jpg'),
(162, 33, 'casa_33_1.jpg'),
(163, 33, 'casa_33_2.jpg'),
(164, 33, 'casa_33_3.jpg'),
(165, 33, 'casa_33_4.jpg'),
(166, 34, 'casa_34_0.jpg'),
(167, 34, 'casa_34_1.jpg'),
(168, 34, 'casa_34_2.jpg'),
(169, 34, 'casa_34_3.jpg'),
(170, 34, 'casa_34_4.jpg'),
(176, 36, 'casa_36_0.jpg'),
(177, 36, 'casa_36_1.jpg'),
(178, 36, 'casa_36_2.jpg'),
(179, 36, 'casa_36_3.jpg'),
(180, 36, 'casa_36_4.jpg'),
(181, 37, 'casa_37_0.jpg'),
(182, 37, 'casa_37_1.jpg'),
(183, 37, 'casa_37_2.jpg'),
(184, 37, 'casa_37_3.jpg'),
(185, 37, 'casa_37_4.jpg'),
(186, 38, 'casa_38_0.jpg'),
(187, 38, 'casa_38_1.jpg'),
(188, 38, 'casa_38_2.jpg'),
(189, 38, 'casa_38_3.jpg'),
(190, 38, 'casa_38_4.jpg'),
(191, 39, 'casa_39_0.jpg'),
(192, 39, 'casa_39_1.jpg'),
(193, 39, 'casa_39_2.jpg'),
(194, 39, 'casa_39_3.jpg'),
(195, 39, 'casa_39_4.jpg'),
(206, 42, 'casa_42_0.jpg'),
(207, 42, 'casa_42_1.jpg'),
(208, 42, 'casa_42_2.jpg'),
(209, 42, 'casa_42_3.jpg'),
(210, 42, 'casa_42_4.jpg'),
(211, 43, 'casa_43_0.jpg'),
(212, 43, 'casa_43_1.jpg'),
(213, 43, 'casa_43_2.jpg'),
(214, 43, 'casa_43_3.jpg'),
(215, 43, 'casa_43_4.jpg'),
(216, 44, 'casa_44_0.jpg'),
(217, 44, 'casa_44_1.jpg'),
(218, 44, 'casa_44_2.jpg'),
(219, 44, 'casa_44_3.jpg'),
(220, 44, 'casa_44_4.jpg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alojamientos_valoraciones`
--

CREATE TABLE `alojamientos_valoraciones` (
  `ID` int(11) NOT NULL,
  `usuarioID` int(11) NOT NULL,
  `alojamientoID` int(11) NOT NULL,
  `creadaEn` datetime NOT NULL DEFAULT current_timestamp(),
  `sinLeer` tinyint(4) NOT NULL DEFAULT 0,
  `mensaje` varchar(300) NOT NULL,
  `valLlegada` float NOT NULL,
  `valVeracidad` float NOT NULL,
  `valComunicacion` float NOT NULL,
  `valUbicacion` float NOT NULL,
  `valLimpieza` float NOT NULL,
  `valCalidad` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `alojamientos_valoraciones`
--

INSERT INTO `alojamientos_valoraciones` (`ID`, `usuarioID`, `alojamientoID`, `creadaEn`, `sinLeer`, `mensaje`, `valLlegada`, `valVeracidad`, `valComunicacion`, `valUbicacion`, `valLimpieza`, `valCalidad`) VALUES
(1, 9, 4, '2022-12-10 04:26:11', 1, 'bonito lugar muy agradable gente', 3, 4, 2, 4, 5, 6),
(2, 1, 4, '2022-12-05 04:26:11', 1, 'Muy chulo pero un poco sucio', 2, 3, 4, 5, 2.5, 2),
(3, 2, 4, '2022-12-10 10:14:11', 1, 'Lugar súper lindo y relajante con todo lo que necesitábamos . Excelente ubicación cerca de pinhao y peso de Regua. El anfitrión fue muy atento y servicial.', 2, 4, 5, 3, 1, 0),
(17, 9, 3, '2022-12-11 06:02:51', 0, 'Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools', 0, 0, 0, 0, 0, 0),
(19, 9, 2, '2022-12-11 07:34:38', 1, 'Una nueva valoración para probar que funciona todo bien ole ole ole', 5, 5, 5, 5, 5, 5),
(20, 9, 2, '2022-12-11 07:38:20', 1, 'Nueva valoración para probar que todo funciona correctamente', 5, 5, 5, 5, 5, 4.9),
(21, 9, 2, '2022-12-11 08:45:14', 1, 'Otra prueba de valoracion a ver si se suma bien xd', 0, 0, 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `ID` int(11) NOT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT 0,
  `verificacion` varchar(80) NOT NULL,
  `email` varchar(200) NOT NULL,
  `password` varchar(200) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellidos` varchar(90) NOT NULL,
  `genero` tinyint(4) NOT NULL DEFAULT 0,
  `presentacion` varchar(300) NOT NULL DEFAULT 'Escribe algo para que te conozcan...',
  `fechaNac` date NOT NULL,
  `fechaReg` datetime NOT NULL DEFAULT current_timestamp(),
  `telefono` varchar(20) NOT NULL,
  `trabajo` varchar(70) NOT NULL,
  `idiomas` varchar(70) NOT NULL DEFAULT 'Español',
  `residencia` varchar(200) NOT NULL DEFAULT '',
  `imgPerfil` varchar(100) NOT NULL DEFAULT 'default.png',
  `passReset` int(11) NOT NULL DEFAULT 0,
  `recibirCorreos` tinyint(4) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`ID`, `activo`, `verificacion`, `email`, `password`, `nombre`, `apellidos`, `genero`, `presentacion`, `fechaNac`, `fechaReg`, `telefono`, `trabajo`, `idiomas`, `residencia`, `imgPerfil`, `passReset`, `recibirCorreos`) VALUES
(1, 1, '', 'manolo@app-tfg.com', '$2a$10$xUG5DUhMOIVXbI1wCT5nKuM0Ua73msM2AxUXyX.YNUH.4IlquSca6', 'Manolo', 'Garcia Sanchez', 0, 'Escribe algo para que te conozcan...', '1992-04-07', '2022-11-30 18:56:46', '+34 4707529', '', 'Español', '', 'default.png', 0, 1),
(2, 1, '', 'sara@app-tfg.com', '$2a$10$xUG5DUhMOIVXbI1wCT5nKuM0Ua73msM2AxUXyX.YNUH.4IlquSca6', 'Sara', 'Lopez', 1, 'Escribe algo para que te conozcan...', '1994-05-25', '2022-11-30 18:56:46', '+35 0449749', '', 'Español', '', 'user2-profile.jpg', 0, 1),
(3, 1, '', 'pepe@app-tfg.com', '$2a$10$xUG5DUhMOIVXbI1wCT5nKuM0Ua73msM2AxUXyX.YNUH.4IlquSca6', 'Pepe', 'González', 0, 'Escribe algo para que te conozcan...', '2000-08-18', '2022-11-30 18:56:46', '+35 3133896', '', 'Español', '', 'default.png', 0, 1),
(4, 1, '', 'jose@app-tfg.com', '$2a$10$xUG5DUhMOIVXbI1wCT5nKuM0Ua73msM2AxUXyX.YNUH.4IlquSca6', 'Jose', 'Martínez Pérez', 0, 'aaasasasasas', '1995-02-14', '2022-11-30 18:56:46', '+43 8623510', 'Ingeniero informático', 'Español, Inglés, Francés, Portugués, Chino', 'Valladolid, España', 'user4-profile.jpg', 0, 1),
(5, 1, '', 'federico@app-tfg.com', '$2a$10$xUG5DUhMOIVXbI1wCT5nKuM0Ua73msM2AxUXyX.YNUH.4IlquSca6', 'Fede', 'Muñoz Álvarez', 0, 'Escribe algo para que te conozcan...', '1993-01-30', '2022-11-30 18:56:46', '+35 9175917', '', 'Español', '', 'default.png', 0, 1),
(9, 1, '$2a$10$xUG5DUhMOIVXbI1wCT5nKuM0Ua73msM2AxUXyX.YNUH.4IlquSca6', 'p@g', '$2b$10$Q2M63bJwiQIS0KWg7Cuqte7qzTyXvteMYgXonbRq8OVKGq200BQoO', 'Juan', 'Sanchez lopez', 0, 'Pruebasasa', '1996-12-09', '2022-11-14 18:44:00', '+22 2121212', 'Ingeniero informático', 'Español, Inglés, Francés, Portugués', 'Zamora, Ecuador', 'user9-profile.jpg', 0, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_chats`
--

CREATE TABLE `usuarios_chats` (
  `ID` int(11) NOT NULL,
  `usuario1` int(11) NOT NULL,
  `usuario2` int(11) NOT NULL,
  `nuevosMensajes` tinyint(4) NOT NULL DEFAULT 1,
  `nuevoEn` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `usuarios_chats`
--

INSERT INTO `usuarios_chats` (`ID`, `usuario1`, `usuario2`, `nuevosMensajes`, `nuevoEn`) VALUES
(1, 1, 9, 3, '2022-12-12 09:43:31'),
(2, 9, 4, 5, '2022-12-12 12:38:52'),
(3, 1, 2, 2, '2022-12-12 09:41:14'),
(4, 9, 3, 2, '2022-12-12 11:56:55'),
(6, 9, 2, 1, '2022-12-12 12:03:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_chats_mensajes`
--

CREATE TABLE `usuarios_chats_mensajes` (
  `ID` int(11) NOT NULL,
  `chatID` int(11) NOT NULL,
  `emisorID` int(11) NOT NULL,
  `creadoEn` datetime NOT NULL DEFAULT current_timestamp(),
  `mensaje` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `usuarios_chats_mensajes`
--

INSERT INTO `usuarios_chats_mensajes` (`ID`, `chatID`, `emisorID`, `creadoEn`, `mensaje`) VALUES
(1, 1, 9, '2022-12-12 05:44:08', 'prueba prube prueba prueba'),
(2, 2, 4, '2022-12-12 05:44:46', 'envia mensaje para probar'),
(3, 2, 4, '2022-12-12 05:51:25', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'),
(4, 3, 1, '2022-12-12 08:26:34', 'prueba prueba prueba prueba'),
(5, 1, 9, '2022-12-12 09:42:57', 'asdsdafafsfas'),
(6, 1, 9, '2022-12-12 09:43:31', 'prueba de mensaje'),
(7, 2, 9, '2022-12-12 09:51:34', 'nuevomensaje de prueba'),
(8, 2, 4, '2022-12-12 10:14:50', 'mensaje q envia otroa  ver si sale bien'),
(9, 2, 9, '2022-12-12 10:17:18', 'envia mensaje'),
(10, 4, 9, '2022-12-12 11:56:31', 'nuevo mensaje nuevo chat'),
(11, 4, 9, '2022-12-12 11:56:55', 'prueba prueba prueba'),
(12, 6, 9, '2022-12-12 12:03:15', 'aaaaaaaaaaa'),
(13, 2, 9, '2022-12-12 12:16:19', 'mensajes mas largos'),
(14, 2, 9, '2022-12-12 12:16:24', 'lalalalaa'),
(15, 2, 9, '2022-12-12 12:16:27', 'asasadasd'),
(16, 2, 9, '2022-12-12 12:38:52', 'nananananana');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_denuncias`
--

CREATE TABLE `usuarios_denuncias` (
  `ID` int(11) NOT NULL,
  `usuarioID` int(11) NOT NULL,
  `reportadoID` int(11) NOT NULL,
  `creadoEn` datetime NOT NULL DEFAULT current_timestamp(),
  `mensaje` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `usuarios_denuncias`
--

INSERT INTO `usuarios_denuncias` (`ID`, `usuarioID`, `reportadoID`, `creadoEn`, `mensaje`) VALUES
(1, 9, 4, '2022-12-10 09:24:51', 'sadasdadasasa'),
(2, 9, 4, '2022-12-10 09:25:17', 'sadasdadasasa'),
(3, 9, 4, '2022-12-10 09:25:38', 'asdafafasfa');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_favoritos`
--

CREATE TABLE `usuarios_favoritos` (
  `ID` int(11) NOT NULL,
  `usuarioID` int(11) NOT NULL,
  `alojamientoID` int(11) NOT NULL,
  `addEn` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `usuarios_favoritos`
--

INSERT INTO `usuarios_favoritos` (`ID`, `usuarioID`, `alojamientoID`, `addEn`) VALUES
(1, 9, 2, '2022-12-01 02:31:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_reservas`
--

CREATE TABLE `usuarios_reservas` (
  `ID` int(11) NOT NULL,
  `usuarioID` int(11) NOT NULL,
  `alojamientoID` int(11) NOT NULL,
  `estado` int(11) NOT NULL DEFAULT 0,
  `creadoEn` datetime NOT NULL DEFAULT current_timestamp(),
  `fechaEntrada` datetime NOT NULL,
  `fechaSalida` datetime NOT NULL,
  `costeTotal` int(11) NOT NULL,
  `valoraEstancia` tinyint(4) NOT NULL DEFAULT -1,
  `valoraHospedador` tinyint(4) NOT NULL DEFAULT -1
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `usuarios_reservas`
--

INSERT INTO `usuarios_reservas` (`ID`, `usuarioID`, `alojamientoID`, `estado`, `creadoEn`, `fechaEntrada`, `fechaSalida`, `costeTotal`, `valoraEstancia`, `valoraHospedador`) VALUES
(1, 9, 2, 2, '2022-12-10 12:16:05', '2022-12-04 12:15:08', '2022-12-06 12:15:08', 200, 20, 2),
(2, 2, 2, 0, '2022-12-10 12:16:05', '2022-12-21 12:15:08', '2023-01-03 12:15:08', 500, -1, -1),
(3, 9, 4, 1, '2022-12-10 12:16:05', '2022-12-15 12:15:08', '2022-12-30 12:15:08', 200, -1, -1),
(4, 9, 4, -1, '2022-12-10 12:16:05', '2022-12-15 12:15:08', '2022-12-30 12:15:08', 200, -1, -1),
(5, 9, 2, 2, '2022-12-10 12:16:05', '2022-12-04 12:15:08', '2022-12-06 12:15:08', 200, 21, -1),
(6, 9, 3, 1, '2022-12-15 12:28:25', '2022-12-10 00:00:00', '2022-12-15 00:00:00', 260, -1, -1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_valoraciones`
--

CREATE TABLE `usuarios_valoraciones` (
  `ID` int(11) NOT NULL,
  `usuarioID` int(11) NOT NULL,
  `userValoradoID` int(11) NOT NULL,
  `sinLeer` tinyint(4) NOT NULL DEFAULT 0,
  `creadoEn` datetime NOT NULL DEFAULT current_timestamp(),
  `tipo` int(11) NOT NULL,
  `mensaje` varchar(300) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `usuarios_valoraciones`
--

INSERT INTO `usuarios_valoraciones` (`ID`, `usuarioID`, `userValoradoID`, `sinLeer`, `creadoEn`, `tipo`, `mensaje`) VALUES
(1, 5, 4, 1, '2022-12-10 08:39:41', 0, 'Muy majo, cuando se fue de la vivienda dejaron todo muy limpio un amor'),
(2, 4, 9, 1, '2022-12-11 08:24:17', 0, 'PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA PRUEBA ');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alojamientos`
--
ALTER TABLE `alojamientos`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `FK_UsuarioAlojamiento` (`usuarioID`);

--
-- Indices de la tabla `alojamientos_img`
--
ALTER TABLE `alojamientos_img`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `FK_AlojamientoImagen` (`alojamientoID`);

--
-- Indices de la tabla `alojamientos_valoraciones`
--
ALTER TABLE `alojamientos_valoraciones`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `FK_UsuarioValoracion` (`usuarioID`),
  ADD KEY `FK_AlojamientoValoracion` (`alojamientoID`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `usuarios_chats`
--
ALTER TABLE `usuarios_chats`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `FK_ChatUsuarioUno` (`usuario1`),
  ADD KEY `FK_ChatUsuarioDos` (`usuario2`);

--
-- Indices de la tabla `usuarios_chats_mensajes`
--
ALTER TABLE `usuarios_chats_mensajes`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `FK_ChatMensaje` (`chatID`),
  ADD KEY `FK_EmisorMensaje` (`emisorID`);

--
-- Indices de la tabla `usuarios_denuncias`
--
ALTER TABLE `usuarios_denuncias`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `FK_UsuarioReportante` (`usuarioID`),
  ADD KEY `FK_UsuarioReportado` (`reportadoID`);

--
-- Indices de la tabla `usuarios_favoritos`
--
ALTER TABLE `usuarios_favoritos`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `UQ_UsuarioID_AlojamientoID` (`usuarioID`,`alojamientoID`),
  ADD KEY `FK_AlojamientoFavorito` (`alojamientoID`);

--
-- Indices de la tabla `usuarios_reservas`
--
ALTER TABLE `usuarios_reservas`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `FK_UsuarioReserva` (`usuarioID`),
  ADD KEY `FK_AlojamientoReserva` (`alojamientoID`);

--
-- Indices de la tabla `usuarios_valoraciones`
--
ALTER TABLE `usuarios_valoraciones`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `FK_UsuarioValora` (`usuarioID`),
  ADD KEY `FK_UsuarioValorado` (`userValoradoID`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alojamientos`
--
ALTER TABLE `alojamientos`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT de la tabla `alojamientos_img`
--
ALTER TABLE `alojamientos_img`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=230;

--
-- AUTO_INCREMENT de la tabla `alojamientos_valoraciones`
--
ALTER TABLE `alojamientos_valoraciones`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `usuarios_chats`
--
ALTER TABLE `usuarios_chats`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `usuarios_chats_mensajes`
--
ALTER TABLE `usuarios_chats_mensajes`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `usuarios_denuncias`
--
ALTER TABLE `usuarios_denuncias`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuarios_favoritos`
--
ALTER TABLE `usuarios_favoritos`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `usuarios_reservas`
--
ALTER TABLE `usuarios_reservas`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `usuarios_valoraciones`
--
ALTER TABLE `usuarios_valoraciones`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `alojamientos`
--
ALTER TABLE `alojamientos`
  ADD CONSTRAINT `FK_UsuarioAlojamiento` FOREIGN KEY (`usuarioID`) REFERENCES `usuarios` (`ID`);

--
-- Filtros para la tabla `alojamientos_img`
--
ALTER TABLE `alojamientos_img`
  ADD CONSTRAINT `FK_AlojamientoImagen` FOREIGN KEY (`alojamientoID`) REFERENCES `alojamientos` (`ID`);

--
-- Filtros para la tabla `alojamientos_valoraciones`
--
ALTER TABLE `alojamientos_valoraciones`
  ADD CONSTRAINT `FK_AlojamientoValoracion` FOREIGN KEY (`alojamientoID`) REFERENCES `alojamientos` (`ID`),
  ADD CONSTRAINT `FK_UsuarioValoracion` FOREIGN KEY (`usuarioID`) REFERENCES `usuarios` (`ID`);

--
-- Filtros para la tabla `usuarios_chats`
--
ALTER TABLE `usuarios_chats`
  ADD CONSTRAINT `FK_ChatUsuarioDos` FOREIGN KEY (`usuario2`) REFERENCES `usuarios` (`ID`),
  ADD CONSTRAINT `FK_ChatUsuarioUno` FOREIGN KEY (`usuario1`) REFERENCES `usuarios` (`ID`);

--
-- Filtros para la tabla `usuarios_chats_mensajes`
--
ALTER TABLE `usuarios_chats_mensajes`
  ADD CONSTRAINT `FK_ChatMensaje` FOREIGN KEY (`chatID`) REFERENCES `usuarios_chats` (`ID`),
  ADD CONSTRAINT `FK_EmisorMensaje` FOREIGN KEY (`emisorID`) REFERENCES `usuarios` (`ID`);

--
-- Filtros para la tabla `usuarios_denuncias`
--
ALTER TABLE `usuarios_denuncias`
  ADD CONSTRAINT `FK_UsuarioReportado` FOREIGN KEY (`reportadoID`) REFERENCES `usuarios` (`ID`),
  ADD CONSTRAINT `FK_UsuarioReportante` FOREIGN KEY (`usuarioID`) REFERENCES `usuarios` (`ID`);

--
-- Filtros para la tabla `usuarios_favoritos`
--
ALTER TABLE `usuarios_favoritos`
  ADD CONSTRAINT `FK_AlojamientoFavorito` FOREIGN KEY (`alojamientoID`) REFERENCES `alojamientos` (`ID`),
  ADD CONSTRAINT `FK_UsuarioFavorito` FOREIGN KEY (`usuarioID`) REFERENCES `usuarios` (`ID`);

--
-- Filtros para la tabla `usuarios_reservas`
--
ALTER TABLE `usuarios_reservas`
  ADD CONSTRAINT `FK_AlojamientoReserva` FOREIGN KEY (`alojamientoID`) REFERENCES `alojamientos` (`ID`),
  ADD CONSTRAINT `FK_UsuarioReserva` FOREIGN KEY (`usuarioID`) REFERENCES `usuarios` (`ID`);

--
-- Filtros para la tabla `usuarios_valoraciones`
--
ALTER TABLE `usuarios_valoraciones`
  ADD CONSTRAINT `FK_UsuarioValora` FOREIGN KEY (`usuarioID`) REFERENCES `usuarios` (`ID`),
  ADD CONSTRAINT `FK_UsuarioValorado` FOREIGN KEY (`userValoradoID`) REFERENCES `usuarios` (`ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
