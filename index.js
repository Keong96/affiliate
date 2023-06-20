const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require('cors')
const app = express();
const PORT = process.env.PORT || 8081;
const qrcode = require('qrcode');
require('dotenv').config();

const config = {
  connectionString:
    "postgres://affiliatedb_mw06_user:qD1jGsmK0vInKh6CBvQNMxB6xYXTriHw@dpg-ci8vjgd9aq0dcs9ifq60-a.singapore-postgres.render.com/affiliatedb_mw06?ssl=true",
};

const { Client } = require('pg');
const { constants } = require("buffer");
const client = new Client(config);
client.connect()

app.use(cors())
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false, parameterLimit:50000 }));

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});

app.get('/', async (req, res) => {
  res.status(200).send("OK");
})