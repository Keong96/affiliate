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
    "postgres://weddingappdb_user:EZNc8dlGCJ8ACJIkc7KlQfnwW4YR7rf9@dpg-cg3jcmd269v3bpaqiphg-a.singapore-postgres.render.com/weddingappdb?ssl=true",
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