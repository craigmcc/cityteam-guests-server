"use strict"

// Internal Modules ----------------------------------------------------------

const DevModeServices = require("../services/DevModeServices");

// External Modules ----------------------------------------------------------

const router = require("express").Router();

// DevMode Endpoints ---------------------------------------------------------

module.exports = (app) => {

    // POST /reload - Resynchronize database metadata and reload seed data
    router.post("/reload", async (req, res) => {
        try {
            res.send(await DevModeServices.reload());
        } catch (err) {
            console.error("DevModeEndpoints.reload error: " +
                JSON.stringify(err, null, 2));
            res.status(500).send(err.message);
        }
    })

    // Export Routes ---------------------------------------------------------

    app.use("/api/devmode", router);

}
