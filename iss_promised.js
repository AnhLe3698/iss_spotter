// iss_promised.js
const request = require('request-promise-native');

const fetchMyIP = function() {
  return request('https://api.ipify.org?format=json');
};

const fetchCoordsByIP = function(body) {
  let parsedBody = JSON.parse(body);
  let ip = parsedBody.ip;
  return request(`http://ipwho.is/${ip}`);
};

const fetchISSFlyOverTimes = function(response) {
  let coords = [];
  let parsedBody = JSON.parse(response);

  coords.push(parsedBody.latitude);
  coords.push(parsedBody.longitude);
  return request(`https://iss-pass.herokuapp.com/json/?lat=${coords[0]}&lon=${coords[1]}`);
};

const nextISSTimesForMyLocation = function(body) {
  let flyByTimes = [];
  let parsedBody = JSON.parse(body);
  if (parsedBody.message === "success") {
    flyByTimes = parsedBody.response;
  }
  let utcSeconds;
  let d = new Date(0); // The 0 there is the key, which sets the date to the epoch
        
  for (const dates of flyByTimes) {
    utcSeconds = dates.risetime;
    //utcSeconds = 1658946723;
    d.setUTCSeconds(utcSeconds);
    console.log(`Next pass at ${d} for ${dates.duration}`);
  }
  
};
module.exports = { fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes, nextISSTimesForMyLocation };