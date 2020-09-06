"use strict";

// Internal Modules ----------------------------------------------------------

const BadRequest = require("../errors/BadRequest");
const NotFound = require("../errors/NotFound");
const db = require("../models");
const TemplateServices = require("../services/TemplateServices");

// External Modules ----------------------------------------------------------

const router = require("express").Router();

module.exports = (app) => {

    // Standard CRUD Endpoints -----------------------------------------------

    // GET / - Find all models
    router.get("/", async(req, res) => {
        try {
            res.send(await TemplateServices.all());
        } catch (err) {
            console.error("TemplateEndpoints.all error: " +
                JSON.stringify(err, null, 2));
            res.status(500).send(err.message);
        }
    });

    // POST / - Insert a new model
    router.post("/", async (req, res) => {
        try {
            res.send(await TemplateServices.insert(req.body));
        } catch (err) {
            if (err instanceof db.Sequelize.ValidationError) {
                res.status(400).send(err.message);
            } else {
                console.error("TemplateEndpoints.insert error: " +
                    JSON.stringify(err, null, 2));
                res.status(500).send(err.message);
            }
        }
    })

    // DELETE /:id - Delete model by id
    router.delete("/:id", async (req, res) => {
        try {
            res.send(await TemplateServices.remove(req.params.id));
        } catch (err) {
            if (err instanceof NotFound) {
                console.status(404).send(err.message);
            } else {
                console.error("TemplateEndpoints.delete error: " +
                    JSON.stringify(err, null, 2));
                res.status(500).send(err.message);
            }
        }
    })

    // GET /:id - Find model by id
    router.get("/:id", async (req, res) => {
        try {
            res.send(await TemplateServices.find(req.params.id));
        } catch (err) {
            if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.log("TemplateEndpoints.find() error: " +
                    JSON.stringify(err, null, 2));
                res.status(500).send(err.message);
            }
        }
    });

    // PUT /:id - Update model by id
    router.put("/:id", async (req, res) => {
        try {
            res.send(await TemplateServices.update(req.params.id, req.body));
        } catch (err) {
            if (err instanceof BadRequest) {
                res.status(400).send(err.message);
            } else if (err instanceof NotFound) {
                res.status(404).send(err.message);
            } else {
                console.log("TemplateEndpoints.update() error: " +
                    JSON.stringify(err, null, 2));
                res.status(500).send(err.message);
            }
        }
    })

    // Export Routes ---------------------------------------------------------
    
    app.use("/api/templates", router);

}
