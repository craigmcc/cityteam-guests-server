"use strict";

// Internal Modules ----------------------------------------------------------

const BadRequest = require("../errors/BadRequest");
const NotFound = require("../errors/NotFound");
const db = require("../models");
const BanServices = require("../services/BanServices");
const GuestServices = require("../services/GuestServices");

// External Modules ----------------------------------------------------------

const router = require("express").Router();

// Guest Endpoints -----------------------------------------------------------

module.exports = (app) => {

    // Standard CRUD Endpoints -----------------------------------------------

    // GET / - Find all models
    router.get("/", async(req, res) => {
        try {
            res.send(await GuestServices.all());
        } catch (err) {
            console.error("GuestEndpoints.all error: " +
                JSON.stringify(err, null, 2));
            res.status(500).send(err.message);
        }
    });

    // POST / - Insert a new model
    router.post("/", async (req, res) => {
        try {
            res.send(await GuestServices.insert(req.body));
        } catch (err) {
            if (err instanceof db.Sequelize.ValidationError) {
                res.status(400).send(err.message);
            } else {
                console.error("GuestEndpoints.insert error: " +
                    JSON.stringify(err, null, 2));
                res.status(500).send(err.message);
            }
        }
    })

    // DELETE /:id - Delete model by id
    router.delete("/:id", async (req, res) => {
        try {
            res.send(await GuestServices.remove(req.params.id));
        } catch (err) {
            if (err instanceof NotFound) {
                console.status(404).send(err.message);
            } else {
                console.error("GuestEndpoints.delete error: " +
                    JSON.stringify(err, null, 2));
                res.status(500).send(err.message);
            }
        }
    })

    // GET /:id - Find model by id
    router.get("/:id", async (req, res) => {
        try {
            res.send(await GuestServices.find(req.params.id));
        } catch (err) {
            if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.log("GuestEndpoints.find() error: " +
                    JSON.stringify(err, null, 2));
                res.status(500).send(err.message);
            }
        }
    });

    // PUT /:id - Update model by id
    router.put("/:id", async (req, res) => {
        try {
            res.send(await GuestServices.update(req.params.id, req.body));
        } catch (err) {
            if (err instanceof BadRequest) {
                res.status(400).send(err.message);
            } else if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.log("GuestEndpoints.update() error: " +
                    JSON.stringify(err, null, 2));
                res.status(500).send(err.message);
            }
        }
    })

    // Model Specific Endpoints ----------------------------------------------

    // GET /:id/bans - Find bans by id
    router.get("/:id/bans", async (req, res) => {
        try {
            res.send(await BanServices.findByGuestId(req.params.id));
        } catch (err) {
            console.error("GuestEndpoints.findBansByGuestId error: " +
                JSON.stringify(err, null, 2));
            res.status(500).send(err.message);
        }
    });

    // Export Routes ---------------------------------------------------------

    app.use("/api/guests", router);

}
