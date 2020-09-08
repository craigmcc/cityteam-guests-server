"use strict";

// Internal Modules ----------------------------------------------------------

const db = require("./src/models/index");

// External Modules ----------------------------------------------------------

const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");

// Configuration Parameters --------------------------------------------------

let corsOptions = {
    origin: "http://localhost:8081"
};
let PORT = process.env.PORT || 8082;

// Configure Application -----------------------------------------------------

const app = express();
// app.set("json spaces", 2); // Generate pretty JSON in responses
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions));

// Configure Routes ----------------------------------------------------------

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to the CityTeam Guests Server Application"});
    });

require("./src/endpoints/BanEndpoints")(app);
require("./src/endpoints/DevModeEndpoints")(app);
require("./src/endpoints/FacilityEndpoints")(app);
require("./src/endpoints/GuestEndpoints")(app);
require("./src/endpoints/RegistrationEndpoints")(app);
require("./src/endpoints/TemplateEndpoints")(app);

// Start Server --------------------------------------------------------------

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
