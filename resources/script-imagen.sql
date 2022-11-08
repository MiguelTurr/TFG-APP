LOAD DATA LOCAL INFILE '../web_scraper/scrap_img.txt' INTO TABLE alojamientos_img
FIELDS TERMINATED BY '|' LINES TERMINATED BY '\n'
(@col1,@col2,@col3) set myid=@col1,mydecimal=@col3;