import express from "express";
import cors from "cors";
import { Database } from "./data/database.js";
import { TableData } from "./data/table-data.js";
import { Filters } from "./data/filters.js";
const app = express(cors());
const db = new Database();
const tableData = new TableData();
const filters = new Filters();
const invalidValues = [undefined, "", "Select All", "undefined"];
Array.prototype.percentile = function (percentile) {
  if (this.length === 0) {
    return null;
  }

  // sort the array
  const sorted = this.slice().sort((a, b) => a - b);

  // find the index of the element at the specified percentile
  const index = Math.floor(percentile / 100 * sorted.length);

  // return the element at the specified percentile
  return sorted[index];
};
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, X-Auth-Token");
  next();
});
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.get("/data", async (req, res) => {
  try {
    const queryParam = req.query;
    let year = queryParam.year;
    let odoReading = queryParam.odoReading;
    let model = queryParam.model;
    let age = queryParam.age;
    const filteredCollections = [];
    const documents = await db.getDocuments();
    documents.forEach(document => {
      let isValidYear = invalidValues.includes(year) ? true : document.VEHICLEYEAR == year;
      let isValidModel = invalidValues.includes(model) ? true : document.MODELNAME == model;
      let isValidReading = invalidValues.includes(odoReading) ? true : document.CUR_ODOM_READ == odoReading;
      let isValidAge = invalidValues.includes(age) ? true : document.DAYSINSTOCK <= age;
      if (isValidYear && isValidReading && isValidModel && isValidAge) {
        filteredCollections.push(document);
      }
    });
    tableData.setData(filteredCollections);
    res.send(tableData);
  } catch (e) {
    res.status(500).send(`An error occurred ${e}`);
  }
});
app.get("/graph-data", async (req, res) => {
  try {
    const queryParam = req.query;
    let year = queryParam.year;
    let odoReading = queryParam.odoReading;
    let model = queryParam.model;
    let type = queryParam.type;
    let age = queryParam.age;
    const filteredCollections = [];
    const documents = await db.getDocuments();
    documents.forEach(document => {
      let isValidYear = invalidValues.includes(year) ? true : document.VEHICLEYEAR == year;
      let isValidModel = invalidValues.includes(model) ? true : document.MODELNAME == model;
      let isValidReading = invalidValues.includes(odoReading) ? true : document.CUR_ODOM_READ == odoReading;
      let isValidAge = invalidValues.includes(age) ? true : document.DAYSINSTOCK <= age;
      if (isValidYear && isValidReading && isValidModel && isValidAge) {
        filteredCollections.push(document);
      }
    });
    let modelNames = [];
    filteredCollections.forEach(document => {
      modelNames.push(document.MODELNAME);
    });
    modelNames = [...new Set(modelNames)];
    let graphData = [];
    modelNames.forEach(name => {
      const collectionOfModel = filteredCollections.filter(doc => doc.MODELNAME == name);
      let graphDataList = [];
      if (type == "odoReading") {
        collectionOfModel.forEach(doc => graphDataList.push(doc.CUR_ODOM_READ));
        let min = Math.min.apply(null, graphDataList);
        let max = Math.max.apply(null, graphDataList);
        let q1 = graphDataList.percentile(25);
        let median = graphDataList.percentile(50);
        let q3 = graphDataList.percentile(75);
        const datasets = [{
          label: "Odo Reading",
          min: min,
          max: max,
          median: median,
          quartile1: q1,
          quartile3: q3
        }];
        graphData.push({
          label: name,
          datasets: datasets
        });
      } else {
        collectionOfModel.forEach(doc => graphDataList.push(doc.MAX_SALE_VALUE));
        let min = Math.min.apply(null, graphDataList);
        let max = Math.max.apply(null, graphDataList);
        let q1 = graphDataList.percentile(25);
        let median = graphDataList.percentile(50);
        let q3 = graphDataList.percentile(75);
        const datasets = [{
          label: "Price",
          min: min,
          max: max,
          median: median,
          quartile1: q1,
          quartile3: q3
        }];
        graphData.push({
          label: name,
          datasets: datasets
        });
      }
    });
    res.send(graphData);
  } catch (e) {
    res.status(500).send(`An error occurred ${e}`);
  }
});
app.get("/filters", async (req, res) => {
  try {
    let years = [];
    let modelList = [];
    let odoReadingList = [];
    const documents = await db.getDocuments();
    documents.forEach(document => {
      years.push(document.VEHICLEYEAR);
      modelList.push(document.MODELNAME);
      odoReadingList.push(document.CUR_ODOM_READ);
    });
    filters.setFilters([...new Set(years)], [...new Set(modelList)], [...new Set(odoReadingList)]);
    res.send(filters);
  } catch (e) {
    res.status(500).send(`An error occurred ${e}`);
  } finally {
    // await db.closeDataBase();
  }
});

// starting the server
app.listen(3001, () => {
  console.log("listening on port 3001");
});