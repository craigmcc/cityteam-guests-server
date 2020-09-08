"use strict";

// Internal Modules ----------------------------------------------------------

const BadRequest = require("../errors/BadRequest");
const NotFound = require("../errors/NotFound");
const db = require("../models");
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
const Guest = db.Guest;
const Registration = db.Registration;

// External Modules ----------------------------------------------------------

// Standard CRUD Methods -----------------------------------------------------

exports.all = async () => {
    let conditions = {
        order: [
            ["facilityId", "ASC"],
            ["registrationDate", "ASC"],
            ["matNumber", "ASC"]
        ]
    }
    return await Registration.findAll(conditions);
}

exports.find = async (id) => {
    let results = await Registration.findAll({
        include: {
            model: Guest
        },
        where: {
            id: id
        }
    });
    if (results.length === 0) {
        throw new NotFound(`id: Missing Registration ${id}`);
    } else {
        return results[0];
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
        throw err;
    }
}

exports.remove = async (id) => {
    let result = await Registration.findByPk(id);
    if (result == null) {
        throw new NotFound(`id: Missing Registration ${id}`);
    }
    let num = await Registration.destroy({
        where: { id: id }
    });
    if (num !== 1) {
        throw new NotFound(`id: Cannot remove Registration ${id}`);
    }
    return result;
}

exports.update = async (id, data) => {
    let original = await Registration.findByPk(id);
    if (original === null) {
        throw new NotFound(`id: Missing Registration ${id}`);
    }
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        data.id = id;
        let result = await Registration.update(data, {
            fields: fieldsWithId,
            transaction: transaction,
            where: { id: id }
        });
        if (result[0] === 0) {
            throw new Error("id: Update did not occur for id " + id);
        }
        await transaction.commit();
        transaction = null;
        return Registration.findByPk(id);
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

exports.assign = async (id, assign) => {

    // NOTE:  Data for an assign does not correspond directly to a model,
    // so we must do our own validations.

    // Look up the original registration
    let registration = await Registration.findByPk(id);
    if (!registration) {
        throw new NotFound(`id: Missing Registration ${id}`);
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
//    console.log("Updating with " + JSON.stringify(data, null, 2));
    return await this.update(id, data);

}

exports.deassign = async (id) => {

    let original = await Registration.findByPk(id);
    if (!original) {
        throw new NotFound(`id: Missing Registration ${id}`);
    }
    if (!original.guestId) {
        throw new BadRequest(`id: Registration ${id} is not currently assigned`);
    }

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
        data.id = id;
        let result = await Registration.update(data, {
            fields: fieldsWithId,
            transaction: transaction,
            where: { id: id }
        });
        if (result[0] === 0) {
            throw new Error("id: Update did not occur for id " + id);
        }
        await transaction.commit();
        transaction = null;
        return Registration.findByPk(id);
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

exports.findByFacilityIdAndRegistrationDate = async (facilityId, registrationDate) => {

    let conditions = {
        include: {
            model: Guest
        },
        order: [
            ["facilityId", "ASC"],
            ["registrationDate", "ASC"],
            ["matNumber", "ASC"]
        ],
        where: {
            facilityId: facilityId,
            registrationDate: registrationDate
        }
    }

    return await Registration.findAll(conditions);

}

exports.findByGuestId = async (guestId) => {

    let conditions = {
        include: {
            model: Guest
        },
        order: [
            ["facilityId", "ASC"],
            ["registrationDate", "ASC"],
            ["matNumber", "ASC"]
        ],
        where: {
            guestId: guestId
        }
    }

    return await Registration.findAll(conditions);

}
