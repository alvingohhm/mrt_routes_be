const path = require("path");
const createMRTJsonData = require("../utils/generateData");

const dataController = {
  generateJsonFile: async (req, res) => {
    try {
      const dataFolderLoc = path.join(path.resolve("./"), "data");
      const csvFilePathName = path.join(dataFolderLoc, "StationMap.csv");
      const stationsPathName = path.join(dataFolderLoc, "stations.json");
      const interchangePathName = path.join(dataFolderLoc, "interchange.json");

      let result = await createMRTJsonData(
        csvFilePathName,
        stationsPathName,
        interchangePathName
      );

      if ((result = "passed")) {
        return res.status(200).send("ok");
      } else if ((result = "failed")) {
        return res.status(500).send("not ok");
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send("not ok");
    }
  },
};

module.exports = dataController;
