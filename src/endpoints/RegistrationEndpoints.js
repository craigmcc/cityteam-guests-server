"use strict";

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const FormatErrorResponse = require("../util/FormatErrorResponse");
const RegistrationServices = require("../services/RegistrationServices");

// External Modules ----------------------------------------------------------

const router = require("express").Router();

// Registration Endpoints -----------------------------------------------------------

module.exports = (app) => {

    // Standard CRUD Endpoints -----------------------------------------------

    // GET / - Find all models
    router.get("/", async(req, res) => {
        try {
            res.send(await RegistrationServices.all(req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "RegistrationServices.all()");
            res.status(status).send(message);
        }
    });

    // POST / - Insert a new model
    router.post("/", async (req, res) => {
        try {
            res.send(await RegistrationServices.insert(req.body));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "RegistrationServices.insert()");
            res.status(status).send(message);
        }
    })

    // DELETE /:registrationId - Delete Registration by registrationId
    router.delete("/:registrationId", async (req, res) => {
        try {
            res.send(await RegistrationServices.remove(req.params.registrationId));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "RegistrationServices.remove()");
            res.status(status).send(message);
        }
    })

    // GET /:registrationId - Find Registration by registrationId
    router.get("/:registrationId", async (req, res) => {
        try {
            res.send(await RegistrationServices.find(req.params.registrationId, req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "RegistrationServices.find()");
            res.status(status).send(message);
        }
    });

    // PUT /:registrationId - Update Registration by registrationId
    router.put("/:registrationId", async (req, res) => {
        // TODO - disallow assigned updates this way?
        try {
            res.send(await RegistrationServices.update(req.params.registrationId, req.body));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "RegistrationServices.update()");
            res.status(status).send(message);
        }
    })

    // Model Specific Endpoints ----------------------------------------------

    // POST /:registrationId/assign - Assign comments/guestId/paymentAmount/paymentType/
    //   showerTime/wakeupTime by registrationId
    router.post("/:registrationId/assign", async (req, res) => {
        try {
            res.send(await RegistrationServices.assign(req.params.registrationId, req.body));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "RegistrationServices.assign()");
            res.status(status).send(message);
        }
    })

    // POST /:registrationId/deassign - Deassign Registration by registrationId
    router.post("/:registrationId/deassign", async (req, res) => {
        try {
            res.send(await RegistrationServices.deassign(req.params.registrationId));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "RegistrationServices.find()");
            res.status(status).send(message);
        }
    })

    // POST /:registrationIdFrom/reassign/:registrationIdTo
    //   - Move assignment from one Registration to another
    router.post("/:registrationIdFrom/reassign/:registrationIdTo", async (req, res) => {
        try {
            res.send(await RegistrationServices.reassign
                (req.params.registrationIdFrom, req.params.registrationIdTo));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "RegistrationServices.reassign()");
            res.status(status).send(message);
        }
    });

    // Export Routes ---------------------------------------------------------

    app.use("/api/registrations", router);

}
