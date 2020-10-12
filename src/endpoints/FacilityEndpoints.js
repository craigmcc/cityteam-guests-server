"use strict";

// Internal Modules ----------------------------------------------------------

const FacilityServices = require("../services/FacilityServices");
const FormatErrorResponse = require("../util/FormatErrorResponse");

// External Modules ----------------------------------------------------------

const router = require("express").Router();

// Facility Endpoints --------------------------------------------------------

module.exports = (app) => {

    // Model Specific Endpoints (no facilityId) ------------------------------

    // GET /active - Find active Facilities
    router.get("/active", async (req, res) => {
        try {
            res.send(await FacilityServices.active(req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "FacilityServices.active()");
            res.status(status).send(message);
        }
    })

    // GET /exact/:name - Find Facility by exact name
    router.get("/exact/:name", async (req, res) => {
        try {
            res.send(await FacilityServices.exact(req.params.name, req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "FacilityServices.exact()");
            res.status(status).send(message);
        }
    })

    // GET /name/:name - Find Facilities by name segment match
    router.get("/name/:name", async (req, res) => {
        try {
            res.send(await FacilityServices.name(req.params.name, req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "FacilityServices.name()");
            res.status(status).send(message);
        }
    })

    // Standard CRUD Endpoints -----------------------------------------------

    // GET / - Find all Facilities
    router.get("/", async(req, res) => {
        try {
            res.send(await FacilityServices.all(req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "FacilityServices.all()");
            res.status(status).send(message);
        }
    });

    // POST / - Insert a new Facility
    router.post("/", async (req, res) => {
        try {
            res.send(await FacilityServices.insert(req.body));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "FacilityServices.insert()");
            res.status(status).send(message);
        }
    })

    // DELETE /:facilityId - Delete Facility by facilityId
    router.delete("/:facilityId", async (req, res) => {
        try {
            res.send(await FacilityServices.remove(req.params.facilityId));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "FacilityServices.remove()");
            res.status(status).send(message);
        }
    })

    // GET /:facilityId - Find Facility by facilityId
    router.get("/:facilityId", async (req, res) => {
        try {
            res.send(await FacilityServices.find(req.params.facilityId, req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "FacilityServices.find()");
            res.status(status).send(message);
        }
    });

    // PUT /:facilityId - Update Facility by facilityId
    router.put("/:facilityId", async (req, res) => {
        try {
            res.send(await FacilityServices.update(req.params.facilityId, req.body));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "FacilityServices.update()");
            res.status(status).send(message);
        }
    })

    // Model Specific Endpoints ----------------------------------------------

    // ***** Facility-Guest Relationships *****

    // GET /:facilityId/guests - Find Guest objects by facilityId
    router.get("/:facilityId/guests", async (req, res) => {
        try {
            res.send(await FacilityServices.guestAll(req.params.facilityId, req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "FacilityServices.guestAll()");
            res.status(status).send(message);
        }
    });

    // GET /:facilityId/guests/exact/:firstName/:lastName - Find guests by facilityId and name
    router.get("/:facilityId/guests/exact/:firstName/:lastName", async (req, res) => {
        try {
            res.send(await FacilityServices.guestExact
                (req.params.facilityId, req.params.firstName, req.params.lastName, req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "FacilityServices.guestExact()");
            res.status(status).send(message);
        }
    });

    // GET /:facilityId/guests/name/:name - Find Guests by facilityId and name segment match
    router.get("/:facilityId/guests/name/:name", async (req, res) => {
        try {
            res.send(await FacilityServices.guestName
                (req.params.facilityId, req.params.name, req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "FacilityServices.guestName()");
            res.status(status).send(message);
        }
    });

    // ***** Facility-Registration Relationships *****

    // GET /:facilityId/registrations - Find Registrations by facilityId
    router.get("/:facilityId/registrations", async (req, res) => {
        try {
            res.send(await FacilityServices.registrationAll
                (req.params.facilityId, req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "FacilityServices.registrationAll()");
            res.status(status).send(message);
        }
    });

    // GET /:facilityId/registrations/:registrationDate/available
    //   - Find available Registrations by facilityId and date
    router.get("/:facilityId/registrations/:registrationDate/available", async (req, res) => {
        try {
            res.send(await FacilityServices.registrationAvailable
                (req.params.facilityId, req.params.registrationDate, req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "FacilityServices.registrationAvailable()");
            res.status(status).send(message);
        }
    });

    // GET /:facilityId/registrations/:registrationDate - Find Registrations by facilityId and date
    router.get("/:facilityId/registrations/:registrationDate", async (req, res) => {
        try {
            res.send(await FacilityServices.registrationDate
                (req.params.facilityId, req.params.registrationDate, req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "FacilityServices.registrationDate()");
            res.status(status).send(message);
        }
    });

    // ***** Facility-Template Relationships *****

    // GET /:facilityId/templates - Find Templates by facilityId
    router.get("/:facilityId/templates", async (req, res) => {
        try {
            res.send(await FacilityServices.templateAll(req.params.facilityId, req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "FacilityServices.templateAll()");
            res.status(status).send(message);
        }
    });

    // GET /:facilityId/templates/exact/:name - Find Templates by facilityId and name
    router.get("/:facilityId/templates/name/:name", async (req, res) => {
        try {
            res.send(await FacilityServices.templateExact
                (req.params.facilityId, req.params.name, req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "FacilityServices.templateExact()");
            res.status(status).send(message);
        }
    });

    // GET /:facilityId/templates/name/:name - Find Templates by facilityId and name segment match
    router.get("/:facilityId/templates/name/:name", async (req, res) => {
        try {
            res.send(await FacilityServices.templateName
                (req.params.facilityId, req.params.name, req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "FacilityServices.templateName()");
            res.status(status).send(message);
        }
    });

    // Export Routes ---------------------------------------------------------

    app.use("/api/facilities", router);

}
