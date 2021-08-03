const axios = require('axios');

const url = 'http://api.coxauto-interview.com/api';

// Retrieve datasetID
async function getDatasetId() {
  try {
    const { data } = await axios.get(`${url}/datasetId`);
    return data.datasetId;
  } catch (e) {
    console.error(e);
  }
}

// Retrieve all vehicles based on datasetID
async function getAllVehicles(datasetID) {
  try {
    const { data } = await axios.get(`${url}/${datasetID}/vehicles`);
    return data.vehicleIds;
  } catch (e) {
    console.error(e);
  }
}

// Retrieve information about a vehicle
async function getVehicle(datasetID, vehicleID) {
  try {
    const { data } = await axios.get(`${url}/${datasetID}/vehicles/${vehicleID}`);
    return data;
  } catch (e) {
    console.error(e);
  }
}

// Retrive information about a dealer
async function getDealer(datasetID, dealerID) {
  try {
    const { data } = await axios.get(`${url}/${datasetID}/dealers/${dealerID}`);
    return data;
  } catch (e) {
    console.error(e);
  }
}

// Remove duplicates from array of objects
function removeDuplicates(arr) {
  return [...new Set(arr.map(s => JSON.stringify(s)))]
    .map(s => JSON.parse(s));
}

// Post to answer endpoint
async function postAnswer(datasetID, answer) {
  try {
    const { data } = await axios.post(`${url}/${datasetID}/answer`, answer, {
      headers: {
        'content-type': 'application/json'
      }
    });
    return data;
  } catch (e) {
    console.error(e);
  }
}

// Main function (IIFE)
(async () => {
  const datasetID = await getDatasetId();
  const vehicleList = await getAllVehicles(datasetID);
  const vehicleInfo = await Promise.all(vehicleList.map(v => getVehicle(datasetID, v)));
  const dealerIDs = await Promise.all(vehicleInfo.map(v => getDealer(datasetID, v.dealerId)));
  const filteredDealers = removeDuplicates(dealerIDs);

  // Construct return object for POST request
  const returnJSON = {};

  returnJSON.dealers = [];
  for (let i in filteredDealers) {
    returnJSON.dealers.push(filteredDealers[i]);
    returnJSON.dealers[i].vehicles = [];
    for (let j in vehicleInfo) {
      if (filteredDealers[i].dealerId === vehicleInfo[j].dealerId) {
        returnJSON.dealers[i].vehicles.push(vehicleInfo[j]);
      }
    }
  }

  // Submit answer
  const answer = await postAnswer(datasetID, returnJSON);
  console.log(answer);
})();