"use strict";

// Internal Modules ----------------------------------------------------------

const FormatErrorResponse = require("../util/FormatErrorResponse");
const RegistrationServices = require("../services/RegistrationServices");
const TemplateServices = require("../services/TemplateServices");

// External Modules ----------------------------------------------------------

const router = require("express").Router();

// Template Endpoints --------------------------------------------------------

module.exports = (app) => {

    // Standard CRUD Endpoints -----------------------------------------------

    // GET / - Find all Templates
    router.get("/", async(req, res) => {
        try {
            res.send(await TemplateServices.all(req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "TemplateServices.all()");
            res.status(status).send(message);
        }
    });

    // POST / - Insert a new Template
    router.post("/", async (req, res) => {
        try {
            res.send(await TemplateServices.insert(req.body));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "TemplateServices.insert()");
            res.status(status).send(message);
        }
    })

    // DELETE /:templateId - Delete Template by templateId
    router.delete("/:templateId", async (req, res) => {
        try {
            res.send(await TemplateServices.remove(req.params.templateId));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "TemplateServices.remove()");
            res.status(status).send(message);
        }
    })

    // GET /:templateId - Find Template by templateId
    router.get("/:templateId", async (req, res) => {
        try {
            res.send(await TemplateServices.find(req.params.templateId, req.query));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "TemplateServices.find()");
            res.status(status).send(message);
        }
    });

    // PUT /:templateId - Update model by templateId
    router.put("/:templateId", async (req, res) => {
        try {
            res.send(await TemplateServices.update(req.params.templateId, req.body));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "TemplateServices.update()");
            res.status(status).send(message);
        }
    })

    // Model Specific Endpoints ----------------------------------------------

    // POST /:templateId/registrations/:registrationDate
    // - Generate empty registrations
    router.post("/:templateId/generate/:registrationDate", async (req, res) => {
        try {
            res.send(await RegistrationServices.generate(
                req.params.templateId,
                req.params.registrationDate
            ));
        } catch (err) {
            let [status, message] =
                FormatErrorResponse(err, "RegistrationServices.generate()");
            res.status(status).send(message);
        }
    })

    // Export Routes ---------------------------------------------------------
    
    app.use("/api/templates", router);

}
