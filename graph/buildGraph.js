const stationsData = require("../data/stations.json");
const Station = require("./station");
const MRTGraph = require("./mrtGraph");

//////////////////////////////////////////////////////
//function to add mrt station data to mrtGraph
//////////////////////////////////////////////////////
function addStationsToGraph(stationsData, mrtGraph) {
  let stationData = null;
  //loop thru each station from the mrt station json file
  for (let i = 0; i < stationsData.length; i++) {
    stationData = stationsData[i];
    let station = new Station(
      stationData["Station Code"],
      stationData["Station Name"],
      stationData["interchange"]
    );
    station.operation.peak = { ...stationData.operation.peak };
    station.operation.night = { ...stationData.operation.night };
    station.operation.nonPeak = { ...stationData.operation.nonPeak };
    station.operation.noPeriod = { ...stationData.operation.noPeriod };

    //add station object to mrtGraph
    mrtGraph.addToGraph(station);
  }
}

//////////////////////////////////////////////////////
//function to connect the related mrt station inside the mrtGraph
//we loop thru the stations.json file, station in the same line are
//line up in series and they are connected to one and another
//////////////////////////////////////////////////////
function connectStations(stationsData, mrtGraph) {
  let currentStation = null;
  let currentStationCode = "";
  let nextStation = null;
  let nextStationCode = "";
  let interchangeStation = null;
  let j = 0;

  //loop thru each station from the mrt station json file
  for (let i = 0; i < stationsData.length; i++) {
    //each loop get the current station
    currentStationCode = stationsData[i]["Station Code"];
    currentStation = mrtGraph.adjacencyList[currentStationCode];

    j = i + 1;
    //find the next station which is the connected neighbour to the current station
    if (j < stationsData.length) {
      nextStationCode = stationsData[j]["Station Code"];
      nextStation = mrtGraph.adjacencyList[nextStationCode];
      //only station in the same line are connected. once next station belong
      //to another line, it will not be connected.
      if (currentStation.line === nextStation.line) {
        if (!currentStation.neighbourExist(nextStationCode)) {
          currentStation.addNeighbour(nextStation);
        }
      }
    }

    //if current station is an interchange, find the other stations
    //with the same station name and connect them together
    if (currentStation.isInterchange()) {
      const interchangeList = mrtGraph.getInterChangeByName(
        currentStation.name
      );
      for (const interchangeCode of interchangeList) {
        if (interchangeCode !== currentStation.code) {
          interchangeStation = mrtGraph.adjacencyList[interchangeCode];
          if (!currentStation.neighbourExist(interchangeCode)) {
            currentStation.addNeighbour(interchangeStation);
          }
        }
      }
    }
  }
}

function buildMrtGraph(stationsData, mrtGraph) {
  addStationsToGraph(stationsData, mrtGraph);
  connectStations(stationsData, mrtGraph);
}

let mrtGraph = new MRTGraph();

buildMrtGraph(stationsData, mrtGraph);
// console.log(mrtGraph.adjacencyList);
module.exports = mrtGraph;
