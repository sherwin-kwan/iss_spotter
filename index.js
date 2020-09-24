const helpers = require('./iss.js');


helpers.fetchMyIP((err, ipResults) => {
  if (err) {
    console.log(err.message);
  } else {
    helpers.fetchCoordsByIP(ipResults, (err, locationResults) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log(locationResults);
      }
    });
  }
});

