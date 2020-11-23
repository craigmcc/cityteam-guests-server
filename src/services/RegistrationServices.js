"use strict";

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const Facility = db.Facility;
const Guest = db.Guest;
const Registration = db.Registration;
const Template = db.Template
const MatsList = require("../util/MatsList");

const BadRequest = require("../errors/BadRequest");
const NotFound = require("../errors/NotFound");

const fields = [
    "comments",
    "facilityId",
    "features",
    "guestId",
    "matNumber",
    "paymentAmount",
    "paymentType",
    "registrationDate",
    "showerTime",
    "wakeupTime"
];
const fieldsWithId = [...fields, "id"];

const {
    registrationOrder,
} = require("../util/SortOrders");

// External Modules ----------------------------------------------------------

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
    if ("" === queryParameters["withGuest"]) {
        include.push(Guest);
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
        order: registrationOrder,
    }, queryParameters);
    return await Registration.findAll(options);
}

exports.find = async (registrationId, queryParameters) => {
    let options = appendQueryParameters({}, queryParameters);
    let result = await Registration.findByPk(registrationId, options);
    if (!result) {
        throw new NotFound(`registrationId: Missing Registration ${registrationId}`);
    } else {
        return result;
    }
}

exports.insert = async (data) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        let result = await Registration.create(data, {
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

exports.remove = async (registrationId) => {
    let result = await Registration.findByPk(registrationId);
    if (result == null) {
        throw new NotFound(`id: Missing Registration ${registrationId}`);
    }
    let num = await Registration.destroy({
        where: { id: registrationId }
    });
    if (num !== 1) {
        throw new NotFound(`id: Cannot remove Registration ${registrationId}`);
    }
    return result;
}

exports.update = async (registrationId, data) => {
    let original = await Registration.findByPk(registrationId);
    if (original === null) {
        throw new NotFound(`id: Missing Registration ${registrationId}`);
    }
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        data.id = registrationId;
        let result = await Registration.update(data, {
            fields: fieldsWithId,
            transaction: transaction,
            where: { id: registrationId }
        });
        if (result[0] !== 1) {
            throw new Error("registrationId: Cannot update Registration " + registrationId);
        }
        await transaction.commit();
        transaction = null;
        return await Registration.findByPk(registrationId);
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

exports.assign = async (registrationId, assign) => {

    // NOTE:  Data for an assign does not correspond directly to a model,
    // so we must do our own validations.

    // Look up the original registration
    let registration = await Registration.findByPk(registrationId);
    if (!registration) {
        throw new NotFound(`id: Missing Registration ${registrationId}`);
    }

    // Verify that this registration is either unassigned, or is already
    // assigned to this guest (to allow information updates)
    if (registration.guestId && (registration.guestId !== assign.guestId)) {
        throw new BadRequest(`guestId: Registration is already assigned to someone else`);
    }

    // Assignment data must specify a valid guestId
    let guest = await Guest.findByPk(assign.guestId);
    if (!guest) {
        throw new NotFound(`guestId: Missing Guest ${assign.guestId}`);
    }

    // If unassigned, verify that the specified guest belongs to the
    // same facility as this registration.
    if (!registration.guestId &&
        (guest.facilityId !== registration.facilityId)) {
        throw new BadRequest(`guestId: Guest does not belong to this facility`);
    }

    // If unassigned, check for another assignment for this guest
    // on this registration date
    if (!registration.guestId) {
        let conditions = {
            where: {
                facilityId: registration.facilityId,
                guestId: assign.guestId,
                registrationDate: registration.registrationDate
            }
        }
        let results = await Registration.findAll(conditions);
        if (results.length > 0) {
            throw new BadRequest(`guestId: Guest is already assigned to mat ` +
                `${results[0].matNumber}`);
        }
    }

    // Perform this assignment and return the updated registration
    let data = {
        ...registration.dataValues,
        comments: assign.comments,
        guestId: assign.guestId,
        paymentAmount: assign.paymentAmount,
        paymentType: assign.paymentType,
        showerTime: assign.showerTime,
        wakeupTime: assign.wakeupTime
    }
    return await this.update(registrationId, data);

}

exports.deassign = async (registrationId) => {

    // Look up original Registration and make sure it is assigned
    let original = await Registration.findByPk(registrationId);
    if (!original) {
        throw new NotFound(`id: Missing Registration ${registrationId}`);
    }
    if (!original.guestId) {
        throw new BadRequest(`id: Registration ${registrationId} is not currently assigned`);
    }

    // Remove the assignment information
    let data = {
        ...original.dataValues,
        comments: null,
        guestId: null,
        paymentAmount: null,
        paymentType: null,
        showerTime: null,
        wakeupTime: null
    }
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        data.id = registrationId;
        let result = await Registration.update(data, {
            fields: fieldsWithId,
            transaction: transaction,
            where: { id: registrationId }
        });
        if (result[0] === 0) {
            throw new Error("id: Update did not occur for id " + registrationId);
        }
        await transaction.commit();
        transaction = null;
        return Registration.findByPk(registrationId);
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

exports.generate = async (templateId, registrationDate) => {

    // Look up the requested template and analyze needed mats
    let template = await Template.findByPk(templateId);
    if (!template) {
        throw new NotFound(`templateId: Missing Template ${templateId}`);
    }
    let allMats = new MatsList(template.allMats);
    let handicapMats = template.handicapMats ? new MatsList(template.handicapMats) : null;
    let socketMats = template.socketMats ? new MatsList(template.socketMats) : null;
    let workMats = template.workMats ? new MatsList(template.workMats) : null;

    // Verify that there are no registrations for this combination already
    let conditions = {
        where: {
            facilityId: template.facilityId,
            registrationDate: registrationDate
        }
    }
    let count = await Registration.count(conditions);
    if (count > 0) {
        throw new BadRequest(`registrationDate: There are already ${count} registrations for ${registrationDate}`);
    }

    // Accumulate the requested (unassigned) registrations
    let inputs = [];

    allMats.exploded().forEach(matNumber => {

        let features = "";
        if (handicapMats && handicapMats.isMemberOf(matNumber)) {
            features = features + "H";
        }
        if (socketMats && socketMats.isMemberOf(matNumber)) {
            features = features + "S";
        }
        if (workMats && workMats.isMemberOf(matNumber)) {
            features = features + "W";
        }
        if (work)
        if (features.length === 0) {
            features = null;
        }

        let data = {
            facilityId: template.facilityId,
            features: features,
            guestId: null,
            matNumber: matNumber,
            registrationDate: registrationDate
        }
        inputs.push(data);

    });

    // Persist and return the requested registrations
    let outputs = await Registration.bulkCreate(inputs, {
        fields: fields,
        validate: true
    })
    return outputs;

}

/*
const generateRegistration = async (data, transaction) => {
    return await Registration.create(data, {
        fields: fields,
        transaction: transaction
    });
}
*/

exports.reassign = async (registrationIdFrom, registrationIdTo) => {

    let transaction;
    try {

        // Find from and to registrations, and verify current assignment state
        if (registrationIdFrom === registrationIdTo) {
            throw new BadRequest("registrationIdTo: Cannot reassign to same id ${registrationIdTo}")
        }
        let registrationFrom = await Registration.findByPk(registrationIdFrom);
        if (!registrationFrom) {
            throw new NotFound(`registrationIdFrom: Missing Registration ${registrationIdFrom}`);
        } else if (!registrationFrom.guestId) {
            throw new BadRequest(`registrationIdFrom: Registration ${registrationIdFrom} is not currently assigned`);
        }
        let registrationTo = await Registration.findByPk(registrationIdTo);
        if (!registrationTo) {
            throw new NotFound(`registrationIdTo: Missing Registration ${registrationIdTo}`);
        } else if (registrationTo.guestId) {
            throw new BadRequest(`registrationIdTo: Registration ${registrationIdTo} is already assigned`);
        }

        // Copy the from assign information to the to registration
        registrationTo.comments = registrationFrom.comments;
        registrationTo.guestId = registrationFrom.guestId;
        registrationTo.paymentAmount = registrationFrom.paymentAmount;
        registrationTo.paymentType = registrationFrom.paymentType;
        registrationTo.showerTime = registrationFrom.showerTime;
        registrationTo.wakeupTime = registrationFrom.wakeupTime;

        // Erase the from assign information
        registrationFrom.comments = null;
        registrationFrom.guestId = null;
        registrationFrom.paymentAmount = null;
        registrationFrom.paymentType = null;
        registrationFrom.showerTime = null;
        registrationFrom.wakeupTime = null;

        // Perform both updates in the same transaction
        transaction = await db.sequelize.transaction();
        await Registration.update(registrationFrom.dataValues, {
            fields: fieldsWithId,
            transaction: transaction,
            where: { id: registrationIdFrom }
        });
        await Registration.update(registrationTo.dataValues, {
            fields: fieldsWithId,
            transaction: transaction,
            where: { id: registrationIdTo }
        });

        // Commit the transaction and return the updated to registration
        await transaction.commit();
        transaction = null;
        return Registration.findByPk(registrationIdTo);

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
