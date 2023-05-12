import express from "express";
import { Database } from "./data/database.js";
import { Int32 } from "mongodb";
import { VehicleDetailsList } from "./model/vehicleDetails.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new Database();
let vehicleData = [];
app.get("/data", async (req, res) => {
  try {
    const paramValue = req.body;
    let year = paramValue.year;
    let odoReading = paramValue.odoReading;
    let saleValue = paramValue.saleValue;

    const collectionYears = [];

    const documents = await db.getDocuments();
    documents.forEach((document) => {
      let isValidYear = year == null ? true : document.VEHICLEYEAR == year;
      let isValidSaleValue =
        saleValue == null ? true : document.MAX_SALE_VALUE == saleValue;
      let isValidReading =
        odoReading == null ? true : document.CUR_ODOM_READ == odoReading;
      if (isValidYear && isValidReading && isValidSaleValue) {
        collectionYears.push(document);
      }
    });
    res.send(collectionYears);
  } catch (e) {
    res.status(500).send(`An error occurred ${e}`);
  }
});

// starting the server
app.listen(3001, () => {
  console.log("listening on port 3001");
});
