let {fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes, nextISSTimesForMyLocation} = require('./iss_promised');

fetchMyIP().then((body) => {
  return fetchCoordsByIP(body);
})
  .then((coords) => {
    return fetchISSFlyOverTimes(coords);
  })
  .then((body) => {
    return nextISSTimesForMyLocation(body);
  })
  .catch((err) => {
    console.error("It didn't work: ", err.message);
  });