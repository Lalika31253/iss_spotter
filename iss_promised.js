const request = require('request-promise-native');

const fetchMyIP = function () { //fetch personal IP adress 
  return request('https://api.ipify.org?format=json');
};


const fetchCoordsByIP = function (body) {
  const ip = JSON.parse(body).ip; //extract the ip from its JSON string
  return request(`http://ipwho.is/${ip}`); //use the extracted IP to get lat/lon
};


const fetchISSFlyOverTimes = function (body) {
  const { latitude, longitude } = JSON.parse(body); // extract latitude and longitude from the response body
  return request(`https://iss-flyover.herokuapp.com/json/?lat=${latitude}&lon=${longitude}`);
};


const nextISSTimesForMyLocation = function () {
  return fetchMyIP()
    .then(fetchCoordsByIP)
    .then(fetchISSFlyOverTimes)
    .then((data) => {
      const { response } = JSON.parse(data); //extract response data from nextISSTimesForMyLocation
      return response;
    });
};

module.exports = { nextISSTimesForMyLocation };
