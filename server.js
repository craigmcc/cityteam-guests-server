"use strict";

// Internal Modules ----------------------------------------------------------

const db = require("./src/models/index");

// External Modules ----------------------------------------------------------

const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");

// Configuration Parameters --------------------------------------------------

// TODO - support remote access as well when appropriate
let corsOptions = {
    origin: "http://localhost:8081"
};
let PORT = process.env.PORT || 8082;

// Configure Application -----------------------------------------------------

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions));

// Configure Routes ----------------------------------------------------------

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to the CityTeam Guests Server Application"});
    });

// TODO - Configure Routes
require("./src/endpoints/DevModeEndpoints")(app);
require("./src/endpoints/FacilityEndpoints")(app);
require("./src/endpoints/TemplateEndpoints")(app);

// Start Server --------------------------------------------------------------

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
