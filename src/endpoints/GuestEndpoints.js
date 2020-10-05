"use strict";

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const FormatErrorResponse = require("../util/FormatErrorResponse");
const GuestServices = require("../services/GuestServices");

// External Modules ----------------------------------------------------------

const router = require("express").Router();

// Guest Endpoints -----------------------------------------------------------

module.exports = (app) => {

    // Standard CRUD Endpoints -----------------------------------------------

    // GET / - Find all Guests
    router.get("/", async(req, res) => {
        try {
            res.send(await GuestServices.all(req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "GuestServices.all()");
            res.status(status).send(message);
        }
    });

    // POST / - Insert a new Guest
    router.post("/", async (req, res) => {
        try {
            res.send(await GuestServices.insert(req.body));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "GuestServices.insert()");
            res.status(status).send(message);
        }
    })

    // DELETE /:guestId - Delete Guest by guestId
    router.delete("/:guestId", async (req, res) => {
        try {
            res.send(await GuestServices.remove(req.params.guestId));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "GuestServices.remove()");
            res.status(status).send(message);
        }
    })

    // GET /:guestId - Find Guest by guestId
    router.get("/:guestId", async (req, res) => {
        try {
            res.send(await GuestServices.find(req.params.guestId, req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "GuestServices.find()");
            res.status(status).send(message);
        }
    });

    // PUT /:guestId - Update Guest by guestId
    router.put("/:guestId", async (req, res) => {
        try {
            res.send(await GuestServices.update(req.params.guestId, req.body));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "GuestServices.update()");
            res.status(status).send(message);
        }
    })

    // Export Routes ---------------------------------------------------------

    app.use("/api/guests", router);

}
