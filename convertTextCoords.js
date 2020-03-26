var fs = require('fs-extra')
var csv = require('fast-csv')
var path = require('path')
const convert = require('geo-coordinates-parser')

module.exports = async function convertTextCoords(filePath){
  
  let text = await fs.readFile(filePath, "utf8")
  
  let records = []
  let recordCount = 0
  
  //break on newlines
  let lines = text.split('\r\n').filter(string => string.trim()) //remove any blanks too

  lines.forEach(line =>{
    let tabIndex = line.indexOf('\t')
    let commaIndex = line.indexOf(',')
    let openPar = line.indexOf('(') + 1
    let closePar = line.indexOf(')')
    let openBracket = line.indexOf('[') + 1
    let closeBracket = line.indexOf(']')

    if(!tabIndex || tabIndex < 0) {
      tabIndex = 0
    }

    let placeName = line.substring(tabIndex, commaIndex).trim()
    let type = line.substring(openPar, closePar)
    let coords = line.substring(openBracket, closeBracket).replace('Lat: ', '').replace('Long: ', '').replace(';', ',')

    let converted = convert(coords)

    let obj = {
      placeName, 
      type, 
      coords, 
      decimalLat: converted.decimalLatitude,
      decimalLong: converted.decimalLongitude
    }

    records.push(obj)
    recordCount++

  })

  //write out the results
  var ws = fs.createWriteStream(filePath.replace('.txt', '.csv'), { encoding: "utf8" });
 
  ws.on('finish', _ => {
    console.log('conversion finished')
    console.log('Total records: ' + recordCount)
  });

  ws.on('error', err => {
    console.log('error writing results: ' + err.message)
  })

  csv.write(records, { headers: true }).pipe(ws);

}
