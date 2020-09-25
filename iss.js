const request = require('request-promise-native');
// Unlike iss-cbhell.js, this one uses promises to avoid callback hell.

// This contains three helper functions:
// fetchMyIP finds the user's current IP address
// fetchCoordsByIP receives an IP address and returns a location object
// fetchISSTimes receives location info and returns a series of times when the ISS can be seen

// This is asynchronous code. All data, once retrieved, is passed to callbacks in standard Node (error-first) format
// i.e. two arguments (err, results)

const fetchMyIP = () => {
  // This function uses Ipify API https://www.ipify.org/
  // use request to fetch IP address from JSON API. Returns two arguments to the callback: error first, then the IP address if found
  const url = 'https://api.ipify.org?format=json';
  return request(url);
};

const fetchCoordsByIP = (jsonInput) => {
  // This function uses IP Vigilante API https://www.ipvigilante.com/
  // Do regex match for IP address
  // Takes JSON output by fetchMyIP and returns a new promise which is a location object
  const ipAddress = JSON.parse(jsonInput).ip;
  var validIPV4 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  if (!ipAddress.match(validIPV4)) {
    throw new Error(`${ipAddress} is not a valid IPv4 address.`);
  };
  const url = 'https://ipvigilante.com/' + ipAddress;
  return request(url);
};

const fetchISSTimes = (location, num) => {
  // Uses Open Notify API which connects to NASA's data http://open-notify.org/Open-Notify-API/ISS-Pass-Times/
  const latitude = location.latitude;
  const longitude = location.longitude;
  const numToRetrieve = (num) ? num : 5;
  if (isNaN(Number(latitude)) || isNaN(Number(longitude))) {
    cb(new Error(`Your coordinates do not seem to include a valid latitude and longitude.`));
    return;
  };
  const altitudeString = (location.altitude) ? `&alt=${location.altitude}` : ''; // Altitude is optional for this API
  const url = `http://api.open-notify.org/iss-pass.json?lat=${latitude}&lon=${longitude}${altitudeString}&n=${numToRetrieve}`;
  // Latitude, longitude, altitude, and num (number of ISS passes to retrieve)
  return request(url);
};

const returnISSTimes = (num) => {
  return fetchMyIP()
    .then(fetchCoordsByIP)
    .then((locationResults) => {
      const location = JSON.parse(locationResults).data;
      return fetchISSTimes(location, num);
    })
    .then((ISSPassResults) => {
      return JSON.parse(ISSPassResults).response;
    })
}

module.exports = { fetchMyIP, fetchCoordsByIP, fetchISSTimes, returnISSTimes };