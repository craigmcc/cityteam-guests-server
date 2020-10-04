"use strict";

// Internal Modules ----------------------------------------------------------

const BadRequest = require("../errors/BadRequest");
const NotFound = require("../errors/NotFound");
const NotUnique = require("../errors/NotUnique");

// External Modules ----------------------------------------------------------

const ValidationError = require("sequelize");

// Public Functions ----------------------------------------------------------

const FormatErrorResponse = (err, prefix) => {
    if (err instanceof ValidationError) {
        return [ 400, err.message ]; // TODO strip front part?
    } else if (err instanceof BadRequest) {
        return [400, err.message];
    } else if (err instanceof NotFound) {
        return [404, err.message];
    } else if (err instanceof NotUnique) {
        return [409, err.message];
    } else {
        console.error(`${prefix} error: `, err);
        return [500, err.message];
    }
}

module.exports = FormatErrorResponse;
