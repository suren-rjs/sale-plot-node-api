import express from "express";
import cors from "cors";
import { Database } from "./data/database.js";
import { TableData } from "./data/table-data.js";
import { Filters } from "./data/filters.js";

const app = express(cors());
const db = new Database();
const tableData = new TableData();
const filters = new Filters();

Array.prototype.percentile = function (percentile) {
  if (this.length === 0) {
    return null;
  }

  // sort the array
  const sorted = this.slice().sort((a, b) => a - b);

  // find the index of the element at the specified percentile
  const index = Math.floor((percentile / 100) * sorted.length);

  // return the element at the specified percentile
  return sorted[index];
};

app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, Content-Type, X-Auth-Token"
  );
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/data", async (req, res) => {
  try {
    const queryParam = req.query;
    let year = queryParam.year;
    let odoReading = queryParam.odoReading;
    let saleValue = queryParam.saleValue;

    const filteredCollections = [];
    const documents = await db.getDocuments();

    documents.forEach((document) => {
      let isValidYear = [undefined, "", "Select All"].includes(year)
        ? true
        : document.VEHICLEYEAR == year;
      let isValidSaleValue = [undefined, "", "Select All"].includes(saleValue)
        ? true
        : document.MAX_SALE_VALUE == saleValue;
      let isValidReading = [undefined, "", "Select All"].includes(odoReading)
        ? true
        : document.CUR_ODOM_READ == odoReading;
      if (isValidYear && isValidReading && isValidSaleValue) {
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
    let saleValue = queryParam.saleValue;
    let type = queryParam.type;

    const filteredCollections = [];
    const documents = await db.getDocuments();

    documents.forEach((document) => {
      let isValidYear = [undefined, "", "Select All"].includes(year)
        ? true
        : document.VEHICLEYEAR == year;
      let isValidSaleValue = [undefined, "", "Select All"].includes(saleValue)
        ? true
        : document.MAX_SALE_VALUE == saleValue;
      let isValidReading = [undefined, "", "Select All"].includes(odoReading)
        ? true
        : document.CUR_ODOM_READ == odoReading;
      if (isValidYear && isValidReading && isValidSaleValue) {
        filteredCollections.push(document);
      }
    });

    let modelNames = [];

    filteredCollections.forEach((document) => {
      modelNames.push(document.MODELNAME);
    });

    modelNames = [...new Set(modelNames)];

    let graphData = [];

    modelNames.forEach((name) => {
      const collectionOfModel = filteredCollections.filter(
        (doc) => doc.MODELNAME == name
      );
      let graphDataList = [];

      if (type == "odoReading") {
        collectionOfModel.forEach((doc) =>
          graphDataList.push(doc.CUR_ODOM_READ)
        );

        const min = Math.min.apply(null, graphDataList);
        const max = Math.max.apply(null, graphDataList);
        let q1 = graphDataList.percentile(25);
        const median = graphDataList.percentile(50);
        let q3 = graphDataList.percentile(75);

        const datasets = [
          { label: "Price", min: min, max: max, median: median },
        ];
        if (q1 === min && q3 === max) {
          q1 = null;
          q3 = null;
        }

        if (q1 !== null) {
          datasets[0].quartile1 = q1;
        }

        if (q3 !== null) {
          datasets[0].quartile3 = q3;
        }

        graphData.push({
          label: name,
          datasets: datasets,
        });
      } else {
        collectionOfModel.forEach((doc) =>
          graphDataList.push(doc.MAX_SALE_VALUE)
        );

        const min = Math.min.apply(null, graphDataList);
        const max = Math.max.apply(null, graphDataList);
        let q1 = graphDataList.percentile(25);
        const median = graphDataList.percentile(50);
        let q3 = graphDataList.percentile(75);

        const datasets = [
          { label: "Price", min: min, max: max, median: median },
        ];
        if (q1 === min && q3 === max) {
          q1 = null;
          q3 = null;
        }

        if (q1 !== null) {
          datasets[0].quartile1 = q1;
        }

        if (q3 !== null) {
          datasets[0].quartile3 = q3;
        }

        graphData.push({
          label: name,
          datasets: datasets,
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
    let priceList = [];

    const documents = await db.getDocuments();
    documents.forEach((document) => {
      years.push(document.VEHICLEYEAR);
      priceList.push(document.MAX_SALE_VALUE);
    });
    filters.setFilters([...new Set(years)], [...new Set(priceList)]);

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
