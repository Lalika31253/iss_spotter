const request = require('request');

const fetchMyIP = function (callback) {

  const apiURL = 'https://api.ipify.org?format=json';

  // Make a request to the 'ipify' API
  request(apiURL, (error, response, body) => {

    // error can be set if invalid domain, user is offline, etc.
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

    const ip = JSON.parse(body).ip; //extract the IP address
    callback(null, ip); // Call the callback with the IP address
  });
};


const fetchCoordsByIP = function (ip, callback) {

  request(`http://ipwho.is/${ip}`, (error, response, body) => {

    if (error) {
      callback(error, null);
      return;
    }
    // parse the returned body so we can check its information
    const parsedBody = JSON.parse(body);

    if (!parsedBody.success) { // check if "success" is true or not
      const message = `Success status was ${parsedBody.success}. Server message says: ${parsedBody.message} when fetching for IP ${parsedBody.ip}`;
      callback(Error(message), null);
      return;
    }

    const { latitude, longitude } = parsedBody; // extract latitude and longitude 

    callback(null, { latitude, longitude });
  });
};


const fetchISSFlyOverTimes = function (coords, callback) {

  const urlFlyOver = `https://iss-flyover.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`;

  request(urlFlyOver, (error, response, body) => {

    //callback (to pass back an error or the array of resulting data)
    if (error) {
      callback(error, null);
      return;
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const messg = `Status Code ${response.statusCode} when fetching IIS pass times: ${body}`;
      callback(Error(messg), null);
      return;
    }

    const passes = JSON.parse(body).response; //extract the array of passes
    callback(null, passes);
  });
};

const nextISSTimesForMyLocation = function (callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    };

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null)
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });

}

module.exports = { nextISSTimesForMyLocation };

