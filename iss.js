const request = require("request");

/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const fetchMyIP = function(callback) {
  // use request to fetch IP address from JSON API
  request('https://api.ipify.org?format=json', (error, response, body) => {
    let parsedIP = JSON.parse(body).ip;

    // inside the request callback ...
    // error can be set if invalid domain, user is offline, etc.
    if (error) {
      callback(error, null);
      return;
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(msg, null);
      return;
    }

    // if we get here, all's well and we got the data
    callback(error,parsedIP);
  });

};

const fetchCoordsByIP = function(ip, callback) {
  
  request(`http://ipwho.is/${ip}`, (error, response, body) => {
    let location = [];
    let parsedBody = JSON.parse(body);

    if (error) {
      callback(error, null);
      return;
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    if (parsedBody.success === false) {
      callback(Error("Invalid IP address"), null);
      return;
    }

    location.push(parsedBody.latitude);
    location.push(parsedBody.longitude);
    callback(error, location);
  });
};

/**
 * Makes a single API request to retrieve upcoming ISS fly over times the for the given lat/lng coordinates.
 * Input:
 *   - An object with keys `latitude` and `longitude`
 *   - A callback (to pass back an error or the array of resulting data)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly over times as an array of objects (null if error). Example:
 *     [ { risetime: 134564234, duration: 600 }, ... ]
 */
const fetchISSFlyOverTimes = function(coords, callback) {
  // https://iss-pass.herokuapp.com/json/?lat=YOUR_LAT_INPUT_HERE&lon=YOUR_LON_INPUT_HERE

  request(`https://iss-pass.herokuapp.com/json/?lat=${coords[0]}&lon=${coords[1]}`, (error, response, body) => {
    let flyByTimes = [];
    let parsedBody = JSON.parse(body);

    if (error) {
      callback(error, null);
      return;
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode}. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    if (parsedBody.message === "success") {
      flyByTimes = parsedBody.response;
    } else {
      callback(Error("Very Invalid coordinates"), null);
      return;
    }
      
    callback(error, flyByTimes);
  });
};

/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results.
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */
const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      console.log("It didn't work!" , error);
      return;
    }
  
    console.log('It worked! Returned IP:' , ip);
    fetchCoordsByIP(ip, (error, location) => {
      if (error) {
        console.log("We could not fetch the coordinates!" , error);
        return;
      }
      console.log(`It worked! Latitude: ${location[0]} Longitude: ${location[1]}`);
      fetchISSFlyOverTimes(location, (error, flyByTimes) => {
        if (error) {
          console.log("Could not fetch the fly over times!", error);
          return;
        }
        console.log(flyByTimes);
        
        // Need to convert the flybytimes from epoch times to normal dates
        // Next pass at Fri Jun 01 2021 13:01:35 GMT-0700 (Pacific Daylight Time) for 465 seconds!
        let utcSeconds;
        let d = new Date(0); // The 0 there is the key, which sets the date to the epoch
        
        for (const dates of flyByTimes) {
          utcSeconds = dates.risetime;
          //utcSeconds = 1658946723;
          d.setUTCSeconds(utcSeconds);
          callback(error,`Next pass at ${d} for ${dates.duration}`);
        }
      });
    });
  });
};

module.exports = { nextISSTimesForMyLocation};