

module.exports = function convertCoords(coordsString) {


  var commaSep_re = /.*,.*\s.*,.*/
  if (commaSep_re.test(coordsString)) {
    coordsString = coordsString.replace(/,/g, '.').replace(/\s\s+/g, ' ').replace(' ', ',');
  }

  var dd_re = /(NORTH|SOUTH|[NS])?[\ \t]*([+-]?[0-8]?[0-9](?:[\.,]\d{3,}))[º°]?[\ \t]*(NORTH|SOUTH|[NS])?(?:[\ \t]*[,/][\ \t]*|[\ \t]*)(EAST|WEST|[EW])?[\ \t]*([+-]?[0-1]?[0-9]?[0-9](?:[\.,]\d{3,}))[º°]?[\ \t]*(EAST|WEST|[EW])?/i;
  //degrees minutes seconds with '.' as separator - gives array with 15 values
  var dms_periods = /(NORTH|SOUTH|[NS])?[\ \t]*([+-]?[0-8]?[0-9])[\ \t]*(\.)[\ \t]*([0-5]?[0-9])[\ \t]*(\.)?[\ \t]*((?:[0-5]?[0-9])(?:\.\d{1,3})?)?(NORTH|SOUTH|[NS])?(?:[\ \t]*[,/][\ \t]*|[\ \t]*)(EAST|WEST|[EW])?[\ \t]*([+-]?[0-1]?[0-9]?[0-9])[\ \t]*(\.)[\ \t]*([0-5]?[0-9])[\ \t]*(\.)?[\ \t]*((?:[0-5]?[0-9])(?:\.\d{1,3})?)?(EAST|WEST|[EW])?/i;
  //degrees minutes seconds with words 'degrees, minutes, seconds' as separators (needed because the s of seconds messes with the S of SOUTH) - gives array of 17 values
  var dms_abbr = /(NORTH|SOUTH|[NS])?[\ \t]*([+-]?[0-8]?[0-9])[\ \t]*(D(?:EG)?(?:REES)?)[\ \t]*([0-5]?[0-9])[\ \t]*(M(?:IN)?(?:UTES)?)[\ \t]*((?:[0-5]?[0-9])(?:\.\d{1,3})?)?(S(?:EC)?(?:ONDS)?)?[\ \t]*(NORTH|SOUTH|[NS])?(?:[\ \t]*[,/][\ \t]*|[\ \t]*)(EAST|WEST|[EW])?[\ \t]*([+-]?[0-1]?[0-9]?[0-9])[\ \t]*(D(?:EG)?(?:REES)?)[\ \t]*([0-5]?[0-9])[\ \t]*(M(?:IN)?(?:UTES)?)[\ \t]*((?:[0-5]?[0-9])(?:\.\d{1,3})?)?(S(?:EC)?(?:ONDS)?)[\ \t]*(EAST|WEST|[EW])?/i;
  //everything else - gives array of 17 values 
  var coords_other = /(NORTH|SOUTH|[NS])?[\ \t]*([+-]?[0-8]?[0-9])[\ \t]*([•º°\.:]|D(?:EG)?(?:REES)?)?[\ \t]*,?([0-5]?[0-9](?:\.\d{1,})?)?[\ \t]*(['′’\.:]|M(?:IN)?(?:UTES)?)?[\ \t]*,?((?:[0-5]?[0-9])(?:\.\d{1,3})?)?[\ \t]*(''|′′|["″”\.])?[\ \t]*(NORTH|SOUTH|[NS])?(?:[\ \t]*[,/][\ \t]*|[\ \t]*)(EAST|WEST|[EW])?[\ \t]*([+-]?[0-1]?[0-9]?[0-9])[\ \t]*([•º°\.:]|D(?:EG)?(?:REES)?)?[\ \t]*,?([0-5]?[0-9](?:\.\d{1,})?)?[\ \t]*(['′’\.:]|M(?:IN)?(?:UTES)?)?[\ \t]*,?((?:[0-5]?[0-9])(?:\.\d{1,3})?)?[\ \t]*(''|′′|["″”\.])?[\ \t]*(EAST|WEST|[EW])?/i;
    
  var verbatimLat = "";
  var verbatimLng = "";
  var ddLat = null;
  var ddLng = null; 

  var latdir = "";
  var lngdir = "";
  var match = [];	
  var matchSuccess = false;
  
  function checkMatch(match){ //test if the matched groups arrays are 'balanced'. match is the resulting array
    
    //first remove the empty values from the array
    var filteredMatch = match.filter(function(item){
      if (!item || item == ''){
        return false;
      }
      else {
        return true;
      }
    });
    
    //we need to shift the array because it contains the whole coordinates string in the first item
    filteredMatch.shift();
    
    
    //then check the array length is an even number else exit
    if (filteredMatch.length % 2 > 0) {
      return false;
    }
  
    //regex for testing corresponding values match
    var numerictest = /^[-+]?(\d+|\d+\.\d*|\d*\.\d+)$/; //for testing numeric values
    var stringtest = /[A-Za-z]+/; //strings - the contents of strings are already matched when this is used
    
    
    var halflen = filteredMatch.length/2;
    result = true;
    for (var i = 0; i < halflen; i++) {
      if (numerictest.test(filteredMatch[i]) != numerictest.test(filteredMatch[i + halflen]) || stringtest.test(filteredMatch[i]) != stringtest.test(filteredMatch[i + halflen])) {
        result = false;
        break;
      }
    }
    
    return result;
  }
  

  
  if (dd_re.test(coordsString)){
    match = dd_re.exec(coordsString);
    matchSuccess = checkMatch(match);
    if (matchSuccess){
      ddLat = match[2];
      ddLng = match[5];
      
      //need to fix if there are ','s instead of '.'savePreferences
      if(ddLat.indexOf(',') >= 0) {
        ddLat.indexOf(',') = '.';
      }
      if(ddLng.indexOf(',') >= 0) {
        ddLng.indexOf(',') = '.';
      }
      
      if(match[1]){
        latdir = match[1];
        lngdir = match[4];
      } else if (match[3]){
        latdir = match[3];
        lngdir = match[6];
      }
      verbatimLat = match.slice(1,4).filter(function(n) {return n != undefined}).join('');
      verbatimLng = match.slice(4).filter(function(n) {return n != undefined}).join('');
    }
    else {
      throw new Error('There is a problem reading these coordinates with dd_re')			
    }
    
  }
  else if (dms_periods.test(coordsString)) {
    match = dms_periods.exec(coordsString);
    matchSuccess = checkMatch(match);
    if (matchSuccess){
      ddLat = Math.abs(parseInt(match[2]));
      if (match[4])
        ddLat += match[4]/60;
      if (match[6])
        ddLat += match[6]/3600;
      if (parseInt(match[2]) < 0) //needed to 
        ddLat = -1 * ddLat;
      ddLng = Math.abs(parseInt(match[9]));
      if (match[11])
        ddLng += match[11]/60;
      if (match[13])
        ddLng += match[13]/3600;
      if (parseInt(match[9]) < 0) //needed to 
        ddLng = -1 * ddLng;
      
      if(match[1]){
        latdir = match[1];
        lngdir = match[8];
      } else if (match[7]){
        latdir = match[7];
        lngdir = match[14];
      }
      verbatimLat = match.slice(1,8).filter(function(n) {return n != undefined}).join('');
      verbatimLng = match.slice(8).filter(function(n) {return n != undefined}).join('');
    }
    else {
      throw new Error('There is a problem reading these coordinates with dms_periods')				
    }
  }
  else if (dms_abbr.test(coordsString)) {
    match = dms_abbr.exec(coordsString);
    matchSuccess = checkMatch(match);
    if (matchSuccess){
      ddLat = Math.abs(parseInt(match[2]));
      if (match[4]){
        ddLat += match[4]/60;
        if(!match[3])
          match[3] = ' ';
      }
      if (match[6]) {
        ddLat += match[6]/3600;
        if(!match[5])
          match[5] = ' ';
      }
      if (parseInt(match[2]) < 0) 
        ddLat = -1 * ddLat;
      ddLng = Math.abs(parseInt(match[10]));
      if (match[12]){
        ddLng += match[12]/60;
        if(!match[11])
          match[11] = ' ';
      }
      if (match[14]){
        ddLng += match[14]/3600;
        if(!match[13])
          match[13] = ' ';
      }
      if (parseInt(match[10]) < 0)  
        ddLng = -1 * ddLng;
        
      if(match[1]){
        latdir = match[1];
        lngdir = match[9];
      } else if (match[8]){
        latdir = match[8];
        lngdir = match[16];
      }
      
      verbatimLat = match.slice(1,9).filter(function(n) {return n != undefined}).join('');
      verbatimLng = match.slice(9).filter(function(n) {return n != undefined}).join('');
    }
    else {
      throw new Error('There is a problem reading these coordinates with dms_abbr')			
    }
  }
  else if (coords_other.test(coordsString)) {
    match = coords_other.exec(coordsString);
    matchSuccess = checkMatch(match);
    if (matchSuccess){
      ddLat = Math.abs(parseInt(match[2]));
      if (match[4]){
        ddLat += match[4]/60;
        if(!match[3])
          match[3] = ' ';
      }
      if (match[6]) {
        ddLat += match[6]/3600;
        if(!match[5])
          match[5] = ' ';
      }
      if (parseInt(match[2]) < 0) 
        ddLat = -1 * ddLat;
        
      ddLng = Math.abs(parseInt(match[10]));
      if (match[12]){
        ddLng += match[12]/60;
        if(!match[11])
          match[11] = ' ';
      }
      if (match[14]){
        ddLng += match[14]/3600;
        if(!match[13])
          match[13] = ' ';
      }
      if (parseInt(match[10]) < 0) 
        ddLng = -1 * ddLng;
      
      if(match[1]){
        latdir = match[1];
        lngdir = match[9];
      } else if (match[8]){
        latdir = match[8];
        lngdir = match[16];
      }
      verbatimLat = match.slice(1,9).filter(function(n) {return n != undefined}).join('');
      verbatimLng = match.slice(9).filter(function(n) {return n != undefined}).join('');
    }
    else {
      throw new Error('There is a problem reading these coordinates with coords_other')				
    }
  }
      
        
  //check longitude value - it can be wrong!
  if (Math.abs(ddLng) >=180) {
    throw new Error('Longitude cannot be greater than 180')	
  }
  
  if (matchSuccess && Math.abs(ddLng) < 180){
    
    //make sure the signs and cardinal directions match
    var patt = /S|SOUTH/i;
    if (patt.test(latdir))
      if (ddLat > 0)
        ddLat = -1 * ddLat;
        
    patt = /W|WEST/i;
    if (patt.test(lngdir))
      if (ddLng > 0)
        ddLng = -1 * ddLng;


    return {
      verbatimLatitude: verbatimLat,
      verbatimLongitude: verbatimLng,
      decimalLatitude: ddLat,
      decimalLongitude: ddLng
    }

  }
  else {
    return null
  }

}