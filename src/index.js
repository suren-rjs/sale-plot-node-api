import express from "express";
import cors from "cors";
import { Database } from "./data/database.js";
import { TableData } from "./data/table-data.js";
import { Filters } from "./data/filters.js";

const app = express(cors());
const db = new Database();
const tableData = new TableData();
const filters = new Filters();

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
