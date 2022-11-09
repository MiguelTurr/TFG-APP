LOAD DATA LOCAL INFILE '../web_scraper/scrap_data.txt' INTO TABLE alojamientos
FIELDS TERMINATED BY '|' LINES TERMINATED BY '\n'
(@col1,@col2,@col3,@col4,@col5,@col6,@col7,@col8,@col9,@col10,@col11,@col12,@col13,@col14) 
set 
usuarioID=@col1,titulo=@col2,descripcion=@col3,
precio=@col4,ubicacion=@col5,viajeros=@col6,
habitaciones=@col7,camas=@col8,aseos=@col9,
horaEntrada=@col10,horaSalida=@col11,puedeFumar=@col12,puedeFiestas=@col13,servicios=@col14;