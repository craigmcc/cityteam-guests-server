"use strict";

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const Facility = db.Facility;
const Guest = db.Guest;
const Registration = db.Registration;
const Template = db.Template;

const BadRequest = require("../errors/BadRequest");
const NotFound = require("../errors/NotFound");

const fields = [
    "active",
    "address1",
    "address2",
    "city",
    "email",
    "name",
    "phone",
    "state",
    "zipCode",
]
const fieldsWithId = [...fields, "id"];

const {
    facilityOrder, guestOrder, registrationOrder, templateOrder,
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
    if ("" === queryParameters["withGuest"]) {
        include.push(Guest); // for registrationDate() only
    }
    if ("" === queryParameters["withGuests"]) {
        include.push(Guest);
    }
    if ("" === queryParameters["withRegistrations"]) {
        include.push(Registration);
    }
    if ("" === queryParameters["withTemplates"]) {
        include.push(Template);
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
        order: facilityOrder
    }, queryParameters);
    return await Facility.findAll(options);
}

exports.find = async (facilityId, queryParameters) => {
    let options = appendQueryParameters({}, queryParameters);
    let result = await Facility.findByPk(facilityId, options);
    if (!result) {
        throw new NotFound(`facilityId: Missing Facility ${facilityId}`);
    } else {
        return result;
    }
}

exports.insert = async (data) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        let result = await Facility.create(data, {
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

exports.remove = async (facilityId) => {
    let result = await Facility.findByPk(facilityId);
    if (!result) {
        throw new NotFound(`facilityId: Missing Facility ${facilityId}`);
    }
    let num = await Facility.destroy({
        where: { id: facilityId }
    });
    if (num !== 1) {
        throw new NotFound(`facilityId: Cannot remove Facility ${facilityId}`);
    }
    return result;
}

exports.update = async (facilityId, data) => {
    let original = await Facility.findByPk(facilityId);
    if (!original) {
        throw new NotFound(`facilityId: Missing Facility ${facilityId}`);
    }
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        data.id = facilityId;
        let result = await Facility.update(data, {
            fields: fieldsWithId,
            transaction: transaction,
            where: { id: facilityId }
        });
        if (result[0] === 0) {
            throw new Error("facilityId: Cannot update Facility " + facilityId);
        }
        await transaction.commit();
        transaction = null;
        return Facility.findByPk(facilityId);
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

// ***** Facility Lookups *****

exports.active = async (queryParameters) => {
    let options = appendQueryParameters({
        order: facilityOrder,
        where: { active: true }
    }, queryParameters);
    return await Facility.findAll(options);
}

exports.exact = async (name, queryParameters) => {
    let options = appendQueryParameters({
        order: facilityOrder,
        where: {
            name: name,
        }
    }, queryParameters);
    let results = await Facility.findAll(options);
    if (results.length > 0) {
        return results[0];
    } else {
        throw new NotFound(`name: Missing Facility '${name}'`)
    }
}

exports.name = async (name, queryParameters) => {
    let options = appendQueryParameters({
        order: facilityOrder,
        where: {
            name: { [Op.iLike]: `%${name}%` }
        }
    }, queryParameters);
    return await Facility.findAll(options);
}

// ***** Facility-Guest Relationships (One:Many) *****

exports.guestAll = async (facilityId, queryParameters) => {
    let facility = await Facility.findByPk(facilityId);
    if (!facility) {
        throw new NotFound(`facilityId: Missing Facility ${facilityId}`);
    }
    let options = appendQueryParameters({
        order: guestOrder,
    }, queryParameters);
    return await facility.getGuests(options);
}

exports.guestExact = async (facilityId, firstName, lastName, queryParameters) => {
    let facility = await Facility.findByPk(facilityId);
    if (!facility) {
        throw new NotFound(`facilityId: Missing Facility ${facilityId}`);
    }
    let options = appendQueryParameters({
        order: guestOrder,
        where: {
            firstName: firstName,
            lastName: lastName,
        }
    }, queryParameters);
    let results = await facility.getGuests(options);
    if (results.length !== 1) {
        throw new NotFound(`name: Missing Guest '${firstName} ${lastName}'`);
    }
    return results[0];
}

exports.guestName = async (facilityId, name, queryParameters) => {
    let facility = await Facility.findByPk(facilityId);
    if (!facility) {
        throw new NotFound(`facilityId: Missing Facility ${facilityId}`);
    }
    let options = appendQueryParameters({
        order: guestOrder,
        where: {
            [Op.or]: {
                firstName: {[Op.iLike]: `%${name}%`},
                lastName: {[Op.iLike]: `%${name}%`}
            }
        }
    }, queryParameters);
    return await facility.getGuests(options);
}

// ***** Facility-Registration Relationships (One:Many) *****

exports.registrationAll = async (facilityId, queryParameters) => {
    let facility = await Facility.findByPk(facilityId);
    if (!facility) {
        throw new NotFound(`facilityId: Missing Facility ${facilityId}`);
    }
    let options = appendQueryParameters({
        order: registrationOrder,
    }, queryParameters);
    return await facility.getRegistrations(options);
}

exports.registrationAvailable = async (facilityId, registrationDate, queryParameters) => {
    let facility = await Facility.findByPk(facilityId);
    if (!facility) {
        throw new NotFound(`facilityId: Missing Facility ${facilityId}`);
    }
    let options = appendQueryParameters({
        order: registrationOrder,
        where: {
            guestId: {
                [Op.eq]: null
            },
            registrationDate: registrationDate
        }
    }, queryParameters);
    return await facility.getRegistrations(options);
}

exports.registrationDate = async (facilityId, registrationDate, queryParameters) => {
    let facility = await Facility.findByPk(facilityId);
    if (!facility) {
        throw new NotFound(`facilityId: Missing Facility ${facilityId}`);
    }
    let options = appendQueryParameters({
        order: registrationOrder,
        where: {
            registrationDate: registrationDate
        }
    }, queryParameters);
    return await facility.getRegistrations(options);
}

// ***** Facility-Template Relationships (One:Many) *****

exports.templateAll = async (facilityId, queryParameters) => {
    let facility = await Facility.findByPk(facilityId);
    if (!facility) {
        throw new NotFound(`facilityId: Missing Facility ${facilityId}`);
    }
    let options = appendQueryParameters({
        order: templateOrder,
    }, queryParameters);
    return await facility.getTemplates(options);
}

exports.templateExact = async (facilityId, name, queryParameters) => {
    let facility = await Facility.findByPk(facilityId);
    if (!facility) {
        throw new NotFound(`facilityId: Missing Facility ${facilityId}`);
    }
    let options = appendQueryParameters({
        order: templateOrder,
        where: {
            name: name,
        }
    }, queryParameters);
    let results = await facility.getTemplates(options);
    if (results.length !== 1) {
        throw new NotFound(`name: Missing Template '${name}'`);
    }
    return results[0];
}

exports.templateName = async (facilityId, name, queryParameters) => {
    let facility = await Facility.findByPk(facilityId);
    if (!facility) {
        throw new NotFound(`facilityId: Missing Facility ${facilityId}`);
    }
    let options = appendQueryParameters({
        order: templateOrder,
        where: {
            name: { [Op.iLike]: `%${name}%` }
        }
    }, queryParameters);
    return await facility.getGuests(options);
}

