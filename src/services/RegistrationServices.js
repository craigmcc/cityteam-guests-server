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
    let result = await Registration.findByPk(id, {
        include: {
            model: Guest
        },
    });
    if (result === null) {
        throw new NotFound(`id: Missing Registration ${id}`);
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

// TODO - assign(registrationId, assignData) goes somewhere

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
