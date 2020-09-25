const helpers = require('./iss-cbhell.js');
// const fetchMyIP = helpers.fetchMyIP;
// const fetchCoordsByIP = helpers.fetchCoordsByIP;
// const fetchISSTimes = helpers.fetchISSTimes;
const returnISSTimes = helpers.returnISSTimes;

returnISSTimes(5, (err, humanReadableResults) => {
  if (err) console.log(err);
  else console.log(humanReadableResults);
});

