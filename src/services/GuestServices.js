"use strict";

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const Facility = db.Facility;
const Guest = db.Guest;
const Registration = db.Registration;

const BadRequest = require("../errors/BadRequest");
const NotFound = require("../errors/NotFound");

const fields = [
    "comments",
    "facilityId",
    "firstName",
    "lastName",
];
const fieldsWithId = [...fields, "id"];

const {
    guestOrder, registrationOrder,
} = require("../util/SortOrders");

// External Modules ----------------------------------------------------------

const Op = db.Sequelize.Op;

// Private Methods -----------------------------------------------------------

let appendQueryParameters = (options, queryParameters) => {

    if (!queryParameters) {
        return options;
    }

    // Pagination parameters
    if (queryParameters["limit"]) {
        let value = parseInt(queryParameters.limit, 10);
        if (isNaN(value)) {
            throw new Error(`limit: ${queryParameters.limit} is not a number`);
        } else {
            options["limit"] = value;
        }
    }
    if (queryParameters["offset"]) {
        let value = parseInt(queryParameters.offset, 10);
        if (isNaN(value)) {
            throw new Error(`offset: ${queryParameters.offset} is not a number`);
        } else {
            options["offset"] = value;
        }
    }

    // Inclusion parameters
    let include = [];
    if ("" === queryParameters["withFacility"]) {
        include.push(Facility);
    }
    if ("" === queryParameters["withRegistrations"]) {
        include.push(Registration);
    }
    if (include.length > 0) {
        options["include"] = include;
    }

    // Return result
    return options;

}

// Standard CRUD Methods -----------------------------------------------------

exports.all = async (queryParameters) => {
    let options = appendQueryParameters({
        order: guestOrder,
    }, queryParameters);
    return await Guest.findAll(options);
}

exports.find = async (guestId, queryParameters) => {
    let options = appendQueryParameters({}, queryParameters);
    let result = await Guest.findByPk(guestId, options);
    if (!result) {
        throw new NotFound(`guestId: Missing Guest ${guestId}`);
    } else {
        return result;
    }
}

exports.insert = async (data) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        let result = await Guest.create(data, {
            fields: fields,
            transaction: transaction
        });
        await transaction.commit();
        return result;
    } catch (err) {
        if (transaction) {
            await transaction.rollback();
        }
        if (err instanceof db.Sequelize.ValidationError) {
            throw new BadRequest(err.message);
        } else {
            throw err;
        }
    }
}

exports.remove = async (guestId) => {
    let result = await Guest.findByPk(guestId);
    if (!result) {
        throw new NotFound(`guestId: Missing Guest ${guestId}`);
    }
    let num = await Guest.destroy({
        where: { id: guestId }
    });
    if (num !== 1) {
        throw new NotFound(`guestId: Cannot remove Guest ${guestId}`);
    }
    return result;
}

exports.update = async (guestId, data) => {
    let original = await Guest.findByPk(guestId);
    if (!original) {
        throw new NotFound(`guestId: Missing Guest ${guestId}`);
    }
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        data.id = guestId;
        let result = await Guest.update(data, {
            fields: fieldsWithId,
            transaction: transaction,
            where: { id: guestId }
        });
        if (result[0] !== 1) {
            throw new Error("guestId: Cannot update Guest " + guestId);
        }
        await transaction.commit();
        transaction = null;
        return Guest.findByPk(guestId);
    } catch (err) {
        if (transaction) {
            await transaction.rollback();
        }
        if (err instanceof db.Sequelize.ValidationError) {
            throw new BadRequest(err.message);
        } else {
            throw err;
        }
    }
}

// Model Specific Methods ----------------------------------------------------

// ***** Registration Lookups *****

exports.registrationAll = async (guestId, queryParameters) => {
    let guest = await Guest.findByPk(guestId);
    if (!guest) {
        throw new NotFound(`guestId: Missing Guest ${guestId}`);
    }
    let options = appendQueryParameters({
        order: registrationOrder,
    }, queryParameters);
    return await guest.getRegistrations(options);
}
