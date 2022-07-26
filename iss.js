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

module.exports = { fetchMyIP, fetchCoordsByIP};