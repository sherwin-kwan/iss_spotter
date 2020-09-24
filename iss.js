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
      // This result passed to the callback is a plain ol' IPv4 address as a string. No extra bells or whistles.
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
      // Data here is in an object which contains, among other keys, latitude and longitude
    }
  })
};

const fetchISSTimes = (location, num, cb) => {
  // Uses Open Notify API which connects to NASA's data http://open-notify.org/Open-Notify-API/ISS-Pass-Times/
  const latitude = location.latitude;
  const longitude = location.longitude;
  const numToRetrieve = (num) ? num : 5;
  if (isNaN(Number(latitude)) || isNaN(Number(longitude))) {
    cb(new Error(`Your coordinates do not seem to include a valid latitude and longitude.`));
    return;
  };
  const altitudeString = (location.altitude) ? `&alt=${location.altitude}` : ''; // Altitude is optional for this API
  const url = `http://api.open-notify.org/iss-pass.json?lat=${latitude}&lon=${longitude}${altitudeString}&n=${num}`;
  // Latitude, longitude, altitude, and num (number of ISS passes to retrieve)
  request(url, (err, res, body) => {
    if (err) {
      cb(new Error(`It seems we're experiencing Internet issues.`));
      return;
    };
    if (res.statusCode !== 200) {
      cb(new Error(`Error: Attempt to retrieve ISS pass times failed with status code ${res.statusCode}. \n ${body}`));
    } else {
      cb(null, JSON.parse(body).response);
      // The result here is formatted as an array of objects {duration: <# of seconds>, risetime: <Unix timestamp>}
    }
  })
};

const processISSTimes = (timesArray, cb) => {
  try {
    const humanReadableTimes = timesArray.map((obj => {
      const seconds = obj.duration % 60;
      const minutes = Math.floor(obj.duration / 60);
      const myDate = new Date(obj.risetime * 1000);
      return `${myDate.toUTCString()} for ${minutes} minutes ${seconds} seconds`;
    }));
    let humanReadableResults = '';
    humanReadableTimes.forEach((string) => {
      humanReadableResults += `${string}\n`
    });
    console.log(humanReadableResults);
    cb(null, humanReadableResults);
  } catch (err) {
    cb(err);
  }
}

const returnISSTimes = (num, cb) => {
  fetchMyIP((err, ipResults) => {
    if (err) {
      cb('Error while finding IP address' + err.message);
    } else {
      fetchCoordsByIP(ipResults, (err, locationResults) => {
        if (err) {
          cb('Error while finding your location' + err.message);
        } else {
          fetchISSTimes(locationResults, num, (err, ISSPassResults) => {
            if (err) {
              cb('Error while finding ISS pass times' + err.message);
            } else {
              processISSTimes(ISSPassResults, (err, humanReadableResults) => {
                if (err) {
                  cb(`An error happened when trying to convert NASA's times into human-readable format. ${err.message}`);
                } else {
                  let output = `Your IP address is ${ipResults}\n`;
                  output += `This means you are located in ${locationResults.city_name}, ${locationResults.country_name}, `;
                  output += `latitude ${locationResults.latitude}, longitude ${locationResults.longitude}\n`;
                  output += `According to NASA's data, the International Space Station will appear over your location at these times: \n`
                  output += `(Note: The APIs used in this assignment don't give me a time zone, so these will be GMT times) \n\n`;
                  output += humanReadableResults;
                  cb(null, output);
                }
              })
            }
          });
        }
      });
    }
  });
}

module.exports = { fetchMyIP, fetchCoordsByIP, fetchISSTimes, returnISSTimes };
