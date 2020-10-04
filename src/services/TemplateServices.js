"use strict";

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const Facility = db.Facility;
const Template = db.Template;

const BadRequest = require("../errors/BadRequest");
const NotFound = require("../errors/NotFound");

const fields = [
    "allMats",
    "comments",
    "facilityId",
    "handicapMats",
    "name",
    "socketMats",
];
const fieldsWithId = [...fields, "id"];
const templateOrder = [
    ["facilityId", "ASC"],
    ["name", "ASC"],
];

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
            throw new Error(`${queryParameters.limit} is not a number`);
        } else {
            options["limit"] = value;
        }
    }
    if (queryParameters["offset"]) {
        let value = parseInt(queryParameters.offset, 10);
        if (isNaN(value)) {
            throw new Error(`${queryParameters.offset} is not a number`);
        } else {
            options["offset"] = value;
        }
    }

    // Inclusion parameters
    let include = [];
    if ("" === queryParameters["withFacility"]) {
        include.push(Facility);
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
        order: templateOrder
    }, queryParameters);
    return await Template.findAll(options);
}

exports.find = async (templateId, queryParameters) => {
    let options = appendQueryParameters({}, queryParameters);
    let result = await Template.findByPk(templateId, options);
    if (result === null) {
        throw new NotFound(`templateId: Missing Template ${templateId}`);
    } else {
        return result;
    }
}

exports.insert = async (data) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        let result = await Template.create(data, {
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

exports.remove = async (templateId) => {
    let result = await Template.findByPk(templateId);
    if (result == null) {
        throw new NotFound(`templateId: Missing Template ${templateId}`);
    }
    let num = await Template.destroy({
        where: { id: templateId }
    });
    if (num !== 1) {
        throw new NotFound(`templateId: Cannot remove Template ${templateId}`);
    }
    return result;
}

exports.update = async (templateId, data) => {
    let original = await Template.findByPk(templateId);
    if (original === null) {
        throw new NotFound(`templateId: Missing Template ${templateId}`);
    }
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        data.id = templateId;
        let result = await Template.update(data, {
            fields: fieldsWithId,
            transaction: transaction,
            where: { id: templateId }
        });
        if (result[0] === 0) {
            throw new Error("templateId: Cannot update Template " + templateId);
        }
        await transaction.commit();
        transaction = null;
        return Template.findByPk(templateId);
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
