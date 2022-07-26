const { fetchMyIP, fetchCoordsByIP } = require('./iss');
 

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
    console.log(`It worked! Latitude:${location[0]} Longitude${location[1]}`);
  });
});