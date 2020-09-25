const helpers = require('./iss');
const returnISSTimes = helpers.returnISSTimes;


const printISSTimes = (timesArray) => {
  // Note: This is a regular function, doesn't return a promise. However, because it's called in a 'then', errors here can still be caught
  // by the promise's catch block
  let output = `According to NASA's data, the International Space Station will appear over your location at these times: \n`
  output += `(Note: The APIs used in this assignment don't give me a time zone, so these will be GMT times) \n\n`;
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
  output += humanReadableResults;
  console.log(output);
}

returnISSTimes(5)
  .then((timesArray) => printISSTimes(timesArray))
  .catch((err) => {
    if (err.statusCode) {
      console.log(`Error: Attempt to retrieve data from an API failed with status code ${err.statusCode}. \n ${err.body}`);
    } else {
      console.log(`${err}, ${err.body}`);
    }
  });





