"use strict";

// Internal Modules ----------------------------------------------------------

const BadRequest = require("../errors/BadRequest");
const NotFound = require("../errors/NotFound");
const db = require("../models");
const fields = [
    "comments",
    "facilityId",
    "firstName",
    "lastName",
];
const fieldsWithId = [...fields, "id"];
const Guest = db.Guest;

// External Modules ----------------------------------------------------------

const Op = db.Sequelize.Op;

// Standard CRUD Methods -----------------------------------------------------

exports.all = async () => {
    let conditions = {
        order: [
            ["facilityId", "ASC"],
            ["lastName", "ASC"],
            ["firstName", "ASC"]
        ]
    }
    return await Guest.findAll(conditions);
}

exports.find = async (id) => {
    let result = await Guest.findByPk(id);
    if (result === null) {
        throw new NotFound(`id: Missing Guest ${id}`);
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
        throw err;
    }
}

exports.remove = async (id) => {
    let result = await Guest.findByPk(id);
    if (result == null) {
        throw new NotFound(`id: Missing Guest ${id}`);
    }
    let num = await Guest.destroy({
        where: { id: id }
    });
    if (num !== 1) {
        throw new NotFound(`id: Cannot remove Guest ${id}`);
    }
    return result;
}

exports.update = async (id, data) => {
    let original = await Guest.findByPk(id);
    if (original === null) {
        throw new NotFound(`id: Missing Guest ${id}`);
    }
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        data.id = id;
        let result = await Guest.update(data, {
            fields: fieldsWithId,
            transaction: transaction,
            where: { id: id }
        });
        if (result[0] === 0) {
            throw new Error("id: Update did not occur for id " + id);
        }
        await transaction.commit();
        transaction = null;
        return Guest.findByPk(id);
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

exports.findByFacilityId = async (facilityId) => {

    let conditions = {
        order: [
            ["facilityId", "ASC"],
            ["lastName", "ASC"],
            ["firstName", "ASC"]
        ],
        where: {
            facilityId: facilityId,
        }
    }

    return await Guest.findAll(conditions);

}

exports.findByFacilityIdAndName = async (facilityId, name) => {

    let conditions = {
        order: [
            ["facilityId", "ASC"],
            ["lastName", "ASC"],
            ["firstName", "ASC"]
        ],
        where: {
            facilityId: facilityId,
            [Op.or]: {
                firstName: {[Op.iLike]: `%${name}%`},
                lastName: {[Op.iLike]: `%${name}%`}
            }
        }
    }

    return await Guest.findAll(conditions);

}

exports.findByFacilityIdAndNameExact = async (facilityId, firstName, lastName) => {

    let conditions = {
        order: [
            ["facilityId", "ASC"],
            ["lastName", "ASC"],
            ["firstName", "ASC"]
        ],
        where: {
            facilityId: facilityId,
            lastName: lastName,
            firstName: firstName
        }
    }

    let results = await Guest.findAll(conditions);
    if (results.length > 0) {
        return results[0];
    } else {
        throw new NotFound(`name: Missing name '${firstName} ${lastName}'`);
    }

}
