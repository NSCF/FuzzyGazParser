var convertCSVCoords = require('./convertCSVCoords')
const convertTextCoords = require('./convertTextCoords')

//var path = "C:/Users/engelbrechti/Google Drive/FBIP Baboon Spiders 2017/Data Mobilization Grant 2016-2017/AMGS July 2015/TrapsValleyCoords.csv"

//if the fuzzyG records are in a CSV already, e.g. if you've done some processing on them already.
//convertCSVCoords(path, 'Coordinates') //the second parameter is the name of the coordinates field

//if the fuzzyG records are just a blob of text copied from the web page
let path = './testcoords.txt'
convertTextCoords(path)
