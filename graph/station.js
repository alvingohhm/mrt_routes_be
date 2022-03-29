/////////////////////////////////////////////////////////////
//Station class that use to define each mrt station
//name - name of the mrt station ie. Jurong East
//code - mrt code for the station  ie. NS1
//line - which line the mrt station is in ie. NS
//interchange - tells whether the mrt station is an interchange ie. true
//operation - define the operating condition in each period of the day
/////////////////////////////////////////////////////////////
module.exports = class Station {
  constructor(code, name, interchange) {
    this.name = name;
    this.code = code;
    this.line = code.substr(0, 2);
    this.interchange = interchange;
    this.neighbour = [];
    this.operation = {
      peak: {},
      night: {},
      nonPeak: {},
      noPeriod: {},
    };
  }

  //check whether the mrt station is open given a particular period of the day
  isOpen(period) {
    return this.operation[period]["open"];
  }

  //check the duration take to travel to this station
  //duration varies depend on the period of the day
  duration(period) {
    return this.operation[period]["duration"];
  }

  //check the linechange duration take to travel to an interchange station
  //duration varies depend on the period of the day
  lineChange(period) {
    return this.operation[period]["lineChange"];
  }

  //check if this station is an interchange
  isInterchange() {
    return this.interchange;
  }

  //add neighbour station connected to this station
  addNeighbour(station) {
    this.neighbour.push(station);
    station.neighbour.push(this);
  }

  //check if specific mrt station is a neighbour of this station
  neighbourExist(stationCode) {
    const neighboursLabel = this.getNeighboursLabel();
    return neighboursLabel.includes(stationCode);
  }

  //get an array of neighbour connected to this station in mrt code
  //ie. [NS1, NS3]
  getNeighboursLabel() {
    return this.neighbour.map((station) => {
      return station.code;
    });
  }
};
