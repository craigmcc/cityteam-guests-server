"use strict";

// Internal Modules ----------------------------------------------------------

const BadRequest = require("../errors/BadRequest");
const NotFound = require("../errors/NotFound");
const db = require("../models");
const FacilityServices = require("../services/FacilityServices");

// External Modules ----------------------------------------------------------

const router = require("express").Router();

module.exports = (app) => {

    // Model Specific Endpoints (no id) --------------------------------------

    // GET /active - Find all facilities that are active
    router.get("/active", async (req, res) => {
        try {
            res.send(await FacilityServices.findByActive());
        } catch (err) {
            console.error("FacilityEndpoints.findByActive error: " +
                JSON.stringify(err, null, 2));
            res.status(500).send(err.message);
        }
    })

    // GET /name/:name - Find all facilities that match the specified name segment
    router.get("/name/:name", async (req, res) => {
        try {
            res.send(await FacilityServices.findByName(req.params.name));
        } catch (err) {
            console.error("FacilityEndpoints.findByName error: " +
                JSON.stringify(err, null, 2));
            res.status(500).send(err.message);
        }
    })

    // GET /nameExact/:name - Find the facility with this name (if any)
    router.get("/nameExact/:name", async (req, res) => {
        try {
            res.send(await FacilityServices.findByNameExact(req.params.name));
        } catch (err) {
            if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.error("FacilityEndpoints.findByName error: " +
                    JSON.stringify(err, null, 2));
                res.status(500).send(err.message);
            }
        }
    })

    // Standard CRUD Endpoints -----------------------------------------------

    // GET / - Find all models
    router.get("/", async(req, res) => {
        try {
            res.send(await FacilityServices.all());
        } catch (err) {
            console.error("FacilityEndpoints.all error: " +
                JSON.stringify(err, null, 2));
            res.status(500).send(err.message);
        }
    });

    // POST / - Insert a new model
    router.post("/", async (req, res) => {
        try {
            res.send(await FacilityServices.insert(req.body));
        } catch (err) {
            if (err instanceof db.Sequelize.ValidationError) {
                res.status(400).send(err.message);
            } else {
                console.error("FacilityEndpoints.insert error: " +
                    JSON.stringify(err, null, 2));
                res.status(500).send(err.message);
            }
        }
    })

    // DELETE /:id - Delete model by id
    router.delete("/:id", async (req, res) => {
        try {
            res.send(await FacilityServices.remove(req.params.id));
        } catch (err) {
            if (err instanceof NotFound) {
                console.status(404).send(err.message);
            } else {
                console.error("FacilityEndpoints.delete error: " +
                    JSON.stringify(err, null, 2));
                res.status(500).send(err.message);
            }
        }
    })

    // GET /:id - Find model by id
    router.get("/:id", async (req, res) => {
        try {
            res.send(await FacilityServices.find(req.params.id));
        } catch (err) {
            if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.log("FacilityEndpoints.find() error: " +
                    JSON.stringify(err, null, 2));
                res.status(500).send(err.message);
            }
        }
    });

    // PUT /:id - Update model by id
    router.put("/:id", async (req, res) => {
        try {
            res.send(await FacilityServices.update(req.params.id, req.body));
        } catch (err) {
            if (err instanceof BadRequest) {
                res.status(400).send(err.message);
            } else if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.log("FacilityEndpoints.update() error: " +
                    JSON.stringify(err, null, 2));
                res.status(500).send(err.message);
            }
        }
    })

    // Model Specific Endpoints ----------------------------------------------

    // Export Routes ---------------------------------------------------------

    app.use("/api/facilities", router);

}
