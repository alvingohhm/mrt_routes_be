const CSVToJSON = require("csvtojson");
const fs = require("fs");

//////////////////////////////////////////////////////////////////
//function to get data from csv and convert into json format
//inputFileName - location to csv file
//return data in csv into json format
//////////////////////////////////////////////////////////////////
const getStationsData = async (inputFileName) => {
  return await CSVToJSON().fromFile(inputFileName);
};

//////////////////////////////////////////////////////////////////
//function to get mrt interchange station data from mrt stations data
//output from getStationsData function
//
//stationsData - mrt stations data output from getStationsData function
//return all the interchange mrt station data
//////////////////////////////////////////////////////////////////
const getInterchangeData = async (stationsData) => {
  return await stationsData
    .filter((loop1Element, loop1Index) =>
      stationsData.some(
        (loop2Element, loop2Index) =>
          loop2Element["Station Name"] === loop1Element["Station Name"] &&
          loop2Index !== loop1Index
      )
    )
    .sort((a, b) =>
      a["Station Name"] > b["Station Name"]
        ? 1
        : b["Station Name"] > a["Station Name"]
        ? -1
        : 0
    );
};

//////////////////////////////////////////////////////////////////////////
//function to add interchange property (ie. interchange: true) to existing
//mrt stations data output from getStationsData function
//
//stationsData - mrt stations data output from getStationsData function
//interchangeData - interchange mrt station data output from getInterchangeData
//return all mrt stations data with property indicatinf whether mrt station is an interchange
//////////////////////////////////////////////////////////////////
const addInterchangeProperty = async (stationsData, interchangeData) => {
  return await stationsData.map((station) => {
    let found = interchangeData.findIndex((element) => {
      return element["Station Name"] === station["Station Name"];
    });
    if (found !== -1) {
      station.interchange = true;
    } else {
      station.interchange = false;
    }
    return station;
  });
};

//////////////////////////////////////////////////////////////////////////
//function to add all the operation property to existing
//mrt stations data output from getStationsData function. These property
//is used for calculation duration and check whether mrt station opening at
//certain period of the day.
//
//stationsData - mrt stations data output from getStationsData function
//return all mrt stations data with peak, night, nonPeak and noPeriod property
//////////////////////////////////////////////////////////////////
const addOperationProperty = async (stationsData) => {
  return await stationsData.map((station) => {
    station.operation = {};
    stationCode = station["Station Code"].substr(0, 2);
    let peak = {};
    let night = {};
    let nonPeak = {};
    let noPeriod = {};

    switch (true) {
      case stationCode === "NS" || stationCode === "NE":
        peak.duration = 12;
        peak.open = true;
        peak.lineChange = 15;

        night.duration = 10;
        night.open = true;
        night.lineChange = 10;

        nonPeak.duration = 10;
        nonPeak.open = true;
        nonPeak.lineChange = 10;

        noPeriod.duration = 1;
        noPeriod.open = true;
        noPeriod.lineChange = -1;
        break;
      case stationCode === "CG" || stationCode === "CE":
        peak.duration = 10;
        peak.open = true;
        peak.lineChange = 15;

        night.duration = 0;
        night.open = false;
        night.lineChange = 0;

        nonPeak.duration = 10;
        nonPeak.open = true;
        nonPeak.lineChange = 10;

        noPeriod.duration = 1;
        noPeriod.open = true;
        noPeriod.lineChange = -1;
        break;
      case stationCode === "DT":
        peak.duration = 10;
        peak.open = true;
        peak.lineChange = 15;

        night.duration = 0;
        night.open = false;
        night.lineChange = 0;

        nonPeak.duration = 8;
        nonPeak.open = true;
        nonPeak.lineChange = 10;

        noPeriod.duration = 1;
        noPeriod.open = true;
        noPeriod.lineChange = -1;
        break;
      case stationCode === "TE":
        peak.duration = 10;
        peak.open = true;
        peak.lineChange = 15;

        night.duration = 8;
        night.open = true;
        night.lineChange = 10;

        nonPeak.duration = 8;
        nonPeak.open = true;
        nonPeak.lineChange = 10;

        noPeriod.duration = 1;
        noPeriod.open = true;
        noPeriod.lineChange = -1;
        break;
      default:
        peak.duration = 10;
        peak.open = true;
        peak.lineChange = 15;

        night.duration = 10;
        night.open = true;
        night.lineChange = 10;

        nonPeak.duration = 10;
        nonPeak.open = true;
        nonPeak.lineChange = 10;

        noPeriod.duration = 1;
        noPeriod.open = true;
        noPeriod.lineChange = -1;
        break;
    }
    station.operation.peak = { ...peak };
    station.operation.night = { ...night };
    station.operation.nonPeak = { ...nonPeak };
    station.operation.noPeriod = { ...noPeriod };

    return station;
  });
};

//////////////////////////////////////////////////////////////////////////
//function to create 2 json file: 1) Mrt Station data and 2)Mrt Interchange Data
//inputFileName - location to raw csv file
//stationsDataOutputFileName - location to output the mrt station data file
//interchangeDataOutputFileName - location to output the mrt Interchange station data file
//////////////////////////////////////////////////////////////////////////
const createMRTJsonData = async (
  inputFileName,
  stationsDataOutputFileName,
  interchangeDataOutputFileName
) => {
  try {
    //read stations data from csv file and convert to json format
    const stationsData = await getStationsData(inputFileName);

    //generate mrt interchange json data
    const interchangeData = await getInterchangeData(stationsData);

    //write mrt interchange json data to location specify
    fs.writeFileSync(
      interchangeDataOutputFileName,
      JSON.stringify(interchangeData, null, 4)
    );

    //update the mrt station data with interchange property
    const stations_interchangeData = await addInterchangeProperty(
      stationsData,
      interchangeData
    );

    //update the mrt station data with operation property
    const finalStationsData = await addOperationProperty(
      stations_interchangeData
    );

    // write the final mrt station data file to location specify
    fs.writeFileSync(
      stationsDataOutputFileName,
      JSON.stringify(finalStationsData, null, 4)
    );
    return "passed";
  } catch (err) {
    console.log(err);
    return "failed";
  }
};

module.exports = createMRTJsonData;
