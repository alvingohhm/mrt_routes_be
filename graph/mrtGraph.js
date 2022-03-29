/////////////////////////////////////////////////////////////
//MRTGraph class that use store all the Mrt Stations node (station class)
//it include methods to transverse across the connected stations
/////////////////////////////////////////////////////////////
module.exports = class MRTGraph {
  //adjacencyList: used for keeping track all the station
  //period (default to noPeriod): allow us to set the period when performing the getPossiblePaths
  //so that the correct duration calculation will apply
  constructor() {
    this.adjacencyList = {};
    this.period = "noPeriod";
  }

  //method to add station to the adjacencyList
  addToGraph(station) {
    if (!this.adjacencyList[station.code])
      this.adjacencyList[station.code] = station;
  }

  //method to get a list of interchange stationCode that have the same name
  //ie. getInterChangeByName("Bayfront") => will return ["CE1","DT16"]
  getInterChangeByName(stationName) {
    const result = [];
    for (const stationCode in this.adjacencyList) {
      if (this.adjacencyList[stationCode].name === stationName) {
        result.push(stationCode);
      }
    }
    return result;
  }

  //using bfs to explore the various path from start to destination
  getPossiblePaths(start, destination) {
    const paths = [];
    const visited = new Set();
    const queue = [[start]];
    const destinationStation = this.adjacencyList[destination];
    let visitedBlackList = null;
    visited.add(start);

    //if destination is not open return empty paths array
    if (!destinationStation.isOpen(this.period)) {
      return paths;
    }

    //The destination code should not be track in visted because
    //other path might need to end with the station. If it is a
    //interchange then add the other interchange code to the
    //blacklist
    if (destinationStation.isInterchange()) {
      visitedBlackList = this.getInterChangeByName(destinationStation.name);
    } else {
      visitedBlackList = [destinationStation.code];
    }

    //each time a new path is exploring it will be added to the queue
    //below code will run till queue is empty
    while (queue.length) {
      //FIFO queue. The queue keep track of the various path exploring by bfs.
      //dequeue the first path out, then check that the last station of the path match the destination
      const currentPath = queue.shift();
      const currentStationCode = currentPath[currentPath.length - 1];
      let station = null;
      let neighbours = null;

      //if the last station of the dequeue path match the destination then we have a completed path
      if (currentStationCode === destination) {
        let duration = 0;
        let stationCode = "";

        //loop through the completed path to calculate the duration
        for (let i = 0; i < currentPath.length; i++) {
          stationCode = currentPath[i];
          station = this.adjacencyList[stationCode];

          //if a station is an interchange, we get the next station in the path and compare
          //if next station is an interchange and the line is different from the current station
          //then there is a line transfer going on.
          //for the last station, even if different line we need to check if both station
          //have the same name ie. DT12 and NE7 both are Little India. if that the case, there isn't a
          //line trsf as DT12/NE7 is the destination
          let j = i + 1;
          if (station.isInterchange()) {
            if (j < currentPath.length) {
              let nextStation = this.adjacencyList[currentPath[j]];
              if (
                nextStation.isInterchange() &&
                nextStation.line !== station.line
              ) {
                if (nextStation.name !== destinationStation.name) {
                  //line change duration accounted for
                  duration += station.lineChange(this.period);
                }
              } else {
                //normal duration per station accounted for
                duration += station.duration(this.period);
              }
            }
          } else {
            //normal duration per station accounted for
            duration += station.duration(this.period);
          }
        }

        //push a completed path to paths as an object with "duration" as key which facilitate sorting
        paths.push({
          duration: duration,
          path: currentPath,
        });
      } else {
        //if path hasn't complete, then get the neighbour of the last station in the path
        station = this.adjacencyList[currentStationCode];
        neighbours = station.neighbour;
        //loop thru each neighbour and add them to the queue
        for (const neighbour of neighbours) {
          if (!visited.has(neighbour.code) && neighbour.isOpen(this.period)) {
            queue.push([...currentPath, neighbour.code]);
            if (!visitedBlackList.includes(neighbour.code)) {
              visited.add(neighbour.code);
            }
          }
        }
      }
    }

    let sortedPaths = paths.sort((a, b) => {
      return a.duration - b.duration;
    });

    if (sortedPaths.length > 3) {
      return sortedPaths.slice(0, 3);
    } else {
      return sortedPaths;
    }
  }
};
