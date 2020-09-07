"use strict";

// Internal Modules ----------------------------------------------------------

const BadRequest = require("../errors/BadRequest");
const NotFound = require("../errors/NotFound");
const db = require("../models");
const FacilityServices = require("../services/FacilityServices");
const GuestServices = require("../services/GuestServices");
const RegistrationServices = require("../services/RegistrationServices");
const TemplateServices = require("../services/TemplateServices");

// External Modules ----------------------------------------------------------

const router = require("express").Router();

// Facility Endpoints --------------------------------------------------------

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

    // GET /:id/guests - Find guests by id
    router.get("/:id/guests", async (req, res) => {
        try {
            res.send(await GuestServices.findByFacilityId(req.params.id));
        } catch (err) {
            console.error("FacilityEndpoints.findGuestsByFacilityId error: " +
                JSON.stringify(err, null, 2));
            res.status(500).send(err.message);
        }
    });

    // GET /:id/guests/name/:name - Find guests by id and name segment match
    router.get("/:id/guests/name/:name", async (req, res) => {
        try {
            res.send(await GuestServices.findByFacilityIdAndName
                (req.params.id, req.params.name));
        } catch (err) {
            console.error("FacilityEndpoints.findGuestsByFacilityIdAndName error: " +
                JSON.stringify(err, null, 2));
            res.status(500).send(err.message);
        }
    });

    // GET /:id/guests/nameExact/:firstName/:lastName - Find guests by id and name
    router.get("/:id/guests/nameExact/:firstName/:lastName", async (req, res) => {
        try {
            res.send(await GuestServices.findByFacilityIdAndNameExact
                (req.params.id, req.params.firstName, req.params.lastName));
        } catch (err) {
            console.error("FacilityEndpoints.findGuestsByFacilityIdAndNameExact error: " +
                JSON.stringify(err, null, 2));
            res.status(500).send(err.message);
        }
    });

    // GET /:id/registrations/:registrationDate - Find registrations by id and date
    router.get("/:id/registrations/:registrationDate", async (req, res) => {
        try {
            res.send(await RegistrationServices.findByFacilityIdAndRegistrationDate
                (req.params.id, req.params.registrationDate));
        } catch (err) {
            console.error("FacilityEndpoints.findRegistrationsByFacilityIdAndRegistrationDate error: " +
                JSON.stringify(err, null, 2));
            req.status(500).send(err.message);
        }
    });

    // TODO - generate and remove registrations for a facility+date

    // GET /:id/templates - Find templates by id
    router.get("/:id/templates", async (req, res) => {
        try {
            res.send(await TemplateServices.findByFacilityId(req.params.id));
        } catch (err) {
            console.error("FacilityEndpoints.findTemplatesByFacilityId error: " +
                JSON.stringify(err, null, 2));
            res.status(500).send(err.message);
        }
    });

    // GET /:id/templates/name/:name - Find templates by id and name segment match
    router.get("/:id/templates/name/:name", async (req, res) => {
        try {
            res.send(await TemplateServices.findByFacilityIdAndName
            (req.params.id, req.params.name));
        } catch (err) {
            console.error("FacilityEndpoints.findTemplatesByFacilityIdAndName error: " +
                JSON.stringify(err, null, 2));
            res.status(500).send(err.message);
        }
    });

    // GET /:id/templates/nameExact/:name - Find templates by id and name
    router.get("/:id/templates/nameExact/:name", async (req, res) => {
        try {
            res.send(await TemplateServices.findByFacilityIdAndNameExact
            (req.params.id, req.params.name));
        } catch (err) {
            console.error("FacilityEndpoints.findTemplatesByFacilityIdAndNameExact error: " +
                JSON.stringify(err, null, 2));
            res.status(500).send(err.message);
        }
    });

    // Export Routes ---------------------------------------------------------

    app.use("/api/facilities", router);

}
