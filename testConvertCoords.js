var convertCoords = require('./convertCoords')

var testCoords = [
'50°4\'17.698\"north, 14°24\'2.826\"east',
'50d4m17.698N 14d24m2.826E',
'40:26:46N,79:56:55W',
'40:26:46.302N 79:56:55.903W',
'40°26′47″N 79°58′36″W',
'40d 26′ 47″ N 79d 58′ 36″ W',
'40.446195N 79.948862W',
'40,446195° 79,948862°',
'40° 26.7717, -79° 56.93172',
'40.446195, -79.948862'
]

var errors = false;

for (var coord of testCoords) {
  try {
    var res = convertCoords(coord) //assignment so we dont print
  }
  catch(err) {
    errors = true;
    console.log('Could not convert ' + coord + ': ' + err.message)
  }

}

if (!errors) {
console.log('finished with no errors')
}