"use strict";

// Internal Modules ----------------------------------------------------------

const BadRequest = require("../errors/BadRequest");
const NotFound = require("../errors/NotFound");
const db = require("../models");
const fields = [
    "active",
    "banFrom",
    "banTo",
    "comments",
    "guestId",
];
const fieldsWithId = [...fields, "id"];
const Ban = db.Ban;

// External Modules ----------------------------------------------------------

const Op = db.Sequelize.Op;

// Standard CRUD Methods -----------------------------------------------------

exports.all = async () => {
    let conditions = {
        order: [
            ["guestId", "ASC"],
            ["banFrom", "ASC"],
        ]
    }
    return await Ban.findAll(conditions);
}

exports.find = async (id) => {
    let result = await Ban.findByPk(id);
    if (result === null) {
        throw new NotFound(`id: Missing Ban ${id}`);
    } else {
        return result;
    }
}

exports.insert = async (data) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        let result = await Ban.create(data, {
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
    let result = await Ban.findByPk(id);
    if (result == null) {
        throw new NotFound(`id: Missing Ban ${id}`);
    }
    let num = await Ban.destroy({
        where: { id: id }
    });
    if (num !== 1) {
        throw new NotFound(`id: Cannot remove Ban ${id}`);
    }
    return result;
}

exports.update = async (id, data) => {
    let original = await Ban.findByPk(id);
    if (original === null) {
        throw new NotFound(`id: Missing Ban ${id}`);
    }
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        data.id = id;
        let result = await Ban.update(data, {
            fields: fieldsWithId,
            transaction: transaction,
            where: { id: id }
        });
        if (result[0] === 0) {
            throw new Error("id: Update did not occur for id " + id);
        }
        await transaction.commit();
        transaction = null;
        return await Ban.findByPk(id);
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

exports.findByGuestId = async (guestId) => {

    let conditions = {
        order: [
            ["guestId", "ASC"],
            ["banFrom", "ASC"]
        ],
        where: {
            guestId: guestId
        }
    }

    return await Ban.findAll(conditions);

}
