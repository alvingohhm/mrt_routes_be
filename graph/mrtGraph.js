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
    let destinationStation;
    let visitedBlackList = [];
    visited.add(start);

    //catch edge cases where start or destination is not in station list or not operating
    //if start or destination code is not in the full station list return empty path
    if (!this.adjacencyList[start] || !this.adjacencyList[destination]) {
      return paths;
    }
    //if start or destination is not open return empty paths array
    if (
      !this.adjacencyList[start].isOpen(this.period) ||
      !this.adjacencyList[start].isOpen(this.period)
    ) {
      return paths;
    }

    if (this.adjacencyList[destination]) {
      destinationStation = this.adjacencyList[destination];
    }

    //The destination code should not be track in visted because
    //other path might need to end with the station. If it is a
    //interchange then add the other interchange code to the
    //blacklist
    if (destinationStation.isInterchange()) {
      if (
        destinationStation.name !== "Marina Bay" &&
        destinationStation.name !== "HarbourFront"
      ) {
        visitedBlackList = [
          ...visitedBlackList,
          ...this.getInterChangeByName(destinationStation.name),
        ];
      }
    } else {
      visitedBlackList.push(destinationStation.code);
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
        let stationCode, nextStationCode, nextStation;

        //loop through the completed path till second last in the array to calculate the duration
        for (let i = 0; i < currentPath.length - 1; i++) {
          stationCode = currentPath[i];
          station = this.adjacencyList[stationCode];

          nextStationCode = currentPath[i + 1];
          nextStation = this.adjacencyList[nextStationCode];

          //if current station and next station line is the same then it is a normal station travel
          if (station.line === nextStation.line) {
            //normal duration per station accounted for
            duration += station.duration(this.period);
          } else {
            //if current station and next station line is diff then it is a line transfer
            //need to take care to see if next station is the last station in the path, if it is
            //then that isn't a line trsf
            if (nextStation.code !== destinationStation.code) {
              //line change duration accounted for
              duration += station.lineChange(this.period);
            }
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

  //method to help convert the possible path (which is an array of mrt station code)
  //to more readable action steps for user to follows
  convertPathsToSteps(paths) {
    let currentStationCode, currentStation;
    let nextStationCode, nextStation;
    let results = [];
    let steps = [];
    let duration, path;
    for (const pathObj of paths) {
      duration = pathObj.duration;
      path = pathObj.path;

      //for each path loop thru the station code till second last in the array
      for (let i = 0; i < path.length - 1; i++) {
        currentStationCode = path[i];
        currentStation = this.adjacencyList[currentStationCode];

        nextStationCode = path[i + 1];
        nextStation = this.adjacencyList[nextStationCode];

        //if current station and next station line is the same then it is a normal station travel
        if (currentStation.line === nextStation.line) {
          steps.push(
            `Take ${currentStation.line} line from ${currentStation.name} (${currentStationCode}) to ${nextStation.name} (${nextStationCode})`
          );
        } else {
          //if current station and next station line is diff then it is a line transfer
          //need to take care to see if next station is the last station in the path, if it is
          //then that isn't a line trsf
          if (nextStation.code !== path[path.length - 1]) {
            steps.push(
              `Change from ${currentStation.line} line (${currentStationCode}) to ${nextStation.line} line (${nextStationCode})`
            );
          }
        }
      }
      results.push({
        duration: duration,
        path: steps,
      });
      steps = [];
    }
    return results;
  }
};
