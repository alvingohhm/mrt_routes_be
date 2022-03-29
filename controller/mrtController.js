const moment = require("moment");
const jsonMessages = require("../utils/jsonMessages");
const stationsData = require("../data/stations.json");
const mrtGraph = require("../graph/buildGraph");

const mrtController = {
  getAllRoutes: (req, res) => {
    try {
      const { start = null, destination = null } = req.query;
      const { time = null, steps = null } = req.query;

      let timeSelected, daySelected, peakStartMorn, peakEndMorn;
      let peakStartEve,
        peakEndEve,
        nightStart,
        nightEnd,
        smallHrStart,
        smallHrEnd,
        getDate;
      let period;
      if (!start || !destination) {
        res.status(400).json(jsonMessages("no", "missing query parameter", []));
      }

      if (time) {
        //setting up all the constraint time and day
        getDate = time.split("T")[0];
        timeSelected = moment(time);
        daySelected = moment(time).format("d");
        peakStartMorn = moment(getDate + "T" + "06:00");
        peakEndMorn = peakStartMorn.clone().add(3, "hours");
        peakStartEve = peakStartMorn.clone().add(12, "hours");
        peakEndEve = peakStartEve.clone().add(3, "hours");
        smallHrStart = peakStartMorn.clone().subtract(6, "hours");
        smallHrEnd = peakStartMorn.clone();
        nightStart = peakEndEve.clone().add(1, "hours");
        nightEnd = nightStart.clone().add(2, "hours");
        //if overcome all constraint then it is not peak and night so
        //must be nonPeak. Start of period with nonPeak
        period = "nonPeak";

        //condition to test for peak hour
        //peak hour (6am-9am & 6pm-9pm) (Mon - fri)
        if (
          (timeSelected.isBetween(
            peakStartMorn,
            peakEndMorn,
            undefined,
            "[]"
          ) ||
            timeSelected.isBetween(
              peakStartEve,
              peakEndEve,
              undefined,
              "[]"
            )) &&
          daySelected > 0 &&
          daySelected < 6
        ) {
          period = "peak";
        }

        //condition to test for night hour
        //night hour (10pm-6am) (Mon - Sun)
        if (
          timeSelected.isBetween(smallHrStart, smallHrEnd, undefined, "[)") ||
          timeSelected.isBetween(nightStart, nightEnd, undefined, "[)")
        ) {
          period = "night";
        }
      } else {
        period = "noPeriod";
      }

      mrtGraph.period = period;
      const paths = mrtGraph.getPossiblePaths(start, destination);
      const results = mrtGraph.convertPathsToSteps(paths);

      if (paths.length > 0) {
        if (steps) {
          res.status(200).json(jsonMessages("yes", "", results));
        } else {
          res.status(200).json(jsonMessages("yes", "", paths));
        }
      } else {
        res
          .status(200)
          .json(
            jsonMessages("yes", "no routes found between the 2 stations", [])
          );
      }
    } catch (err) {
      console.log(err);
    }
  },

  getAllStationsName: (req, res) => {
    try {
      const mrtStations = stationsData.map((station) => {
        return {
          [station[
            "Station Code"
          ]]: `(${station["Station Code"]}) - ${station["Station Name"]}`,
        };
      });
      if (mrtStations.length > 0) {
        res.status(200).json(jsonMessages("yes", "", mrtStations));
      } else {
        res
          .status(500)
          .json(
            jsonMessages("no", "system having trouble getting mrt stations", [])
          );
      }
    } catch (err) {
      console.log(err);
    }
  },
};

module.exports = mrtController;
