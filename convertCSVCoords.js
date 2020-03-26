var fs = require('fs')
var csv = require('fast-csv')
var path = require('path')
var convertCoords = require('geo-coordinates-parser')

module.exports = function convertCSVCoords(filePath, coordinatesStringField){

  var filePath = path.resolve(process.cwd(), filePath);
  var stream = fs.createReadStream(filePath, {encoding: 'utf-8'});


  var dataArray = []
  var recordCount = 0;
  var conversionCount = 0;
  var csvStream = csv({ headers: true })
    .on("data", function(data){
      dataArray.push(data)
      recordCount++;
    })
    .on("end", function(){
      console.log("done reading data");

      if (dataArray.some(item => !item.hasOwnProperty(coordinatesStringField))) {
        throw new Error('csv values lack a coordinates field called ' + coordinatesStringField)
      }

      for (var rec of dataArray) {
        try {
          var coords = convertCoords(rec[coordinatesStringField])
          rec.verbatimLatitude = coords.verbatimLatitude
          rec.verbatimLontigude = coords.verbatimLongitude
          rec.decimalLatitude = coords.decimalLatitude
          rec.decimalLongitude = coords.decimalLongitude
          conversionCount++;
        }
        catch(err) {
          console.log('Could not convert this coordinate: ' + rec[coordinatesStringField])
          rec.coordConversionNote = 'Could not convert this coordinate'
          continue
        }

      }

      var ext = path.extname(filePath)
      var newFileName = filePath.replace(ext, '') + '_coordsconverted' + ext

      var ws = fs.createWriteStream(newFileName, { encoding: "utf8" });
 
      ws.on('finish', _ => {
        console.log('conversion finished')
        console.log('Total records: ' + recordCount)
        console.log('Total coordinates converted: ' + conversionCount)
      });

      csv.write(dataArray, { headers: true }).pipe(ws);
        
    });

    console.log('reading csv')
  stream.pipe(csvStream);
}

