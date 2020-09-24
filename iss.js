// This contains three helper functions:
// fetchMyIP finds the user's current IP address
// fetchCoordsByIP receives an IP address and returns a location object
// fetchISSTimes receives location info and returns a series of times when the ISS can be seen

// This is asynchronous code. All data, once retrieved, is passed to callbacks in standard Node (error-first) format
// i.e. two arguments (err, results)

const request = require('request');

const fetchMyIP = (cb) => {
  // This function uses Ipify API https://www.ipify.org/
  // use request to fetch IP address from JSON API. Returns two arguments to the callback: error first, then the IP address if found
  const url = 'https://api.ipify.org?format=json';
  request(url, (err, res, body) => {
    if (err) {
      cb(new Error(`It seems we're experiencing Internet issues.`));
      return;
    }
    if (res.statusCode !== 200) {
      cb(new Error(`Error: Attempt to retrieve IP address failed with status code ${res.statusCode}. \n ${body}`));
    } else {
      cb(null, JSON.parse(body).ip);
    }
  });
};

const fetchCoordsByIP = (ipAddress, cb) => {
  // This function uses IP Vigilante API https://www.ipvigilante.com/
  // Do regex match for IP address
  var validIPV4 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  if (!ipAddress.match(validIPV4)) {
    cb(new Error(`${ipAddress} is not a valid IPv4 address.`));
    return;
  }
  const url = 'https://ipvigilante.com/' + ipAddress;
  request(url, (err, res, body) => {
    if (err) {
      cb(new Error(`It seems we're experiencing Internet issues.`));
      return;
    }
    if (res.statusCode !== 200) {
      cb(new Error(`Error: Location could not be retrieved for IP address ${ipAddress}. Failed with status code ${res.statusCode}. \n ${body}`));
    } else {
      const data = JSON.parse(body).data;
      cb(null, data);
    }
  })
};

const fetchISSTimes = (location, cb) => {
  // Uses Open Notify API which connects to NASA's data http://open-notify.org/Open-Notify-API/ISS-Pass-Times/
  try {
    const latitude = location.latitude;
    const longitude = location.longitude;
    const altitudeString = (location.altitude) ? `&alt=${location.altitude}` : ''; // Altitude is optional for this API
    const url = `http://api.open-notify.org/iss-pass.json?lat=${latitude}&lon=${longitude}${altitudeString}`;
  } catch (err) {
    cb(new Error(`Your coordinates do not seem to include a valid latitude and longitude.`));
  }
}


module.exports = { fetchMyIP, fetchCoordsByIP };
