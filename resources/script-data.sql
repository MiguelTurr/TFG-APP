LOAD DATA LOCAL INFILE '../web_scraper/scrap_data.txt' INTO TABLE alojamientos
FIELDS TERMINATED BY '|' LINES TERMINATED BY '\n'
(@col1,@col2,@col3) set myid=@col1,mydecimal=@col3;