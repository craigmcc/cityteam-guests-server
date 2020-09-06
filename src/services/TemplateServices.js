"use strict";

// Internal Modules ----------------------------------------------------------

const BadRequest = require("../errors/BadRequest");
const NotFound = require("../errors/NotFound");
const db = require("../models");
const fields = [
    "allMats",
    "comments",
    "facilityId",
    "handicapMats",
    "name",
    "socketMats",
];
const fieldsWithId = [...fields, "id"];
const Template = db.Template;

// External Modules ----------------------------------------------------------

const Op = db.Sequelize.Op;

// Standard CRUD Methods -----------------------------------------------------

exports.all = async () => {
    let conditions = {
        order: [
            ["facilityId", "ASC"],
            ["name", "ASC"]
        ]
    }
    return await Template.findAll(conditions);
}

exports.find = async (id) => {
    let result = await Template.findByPk(id);
    if (result === null) {
        throw new NotFound(`id: Missing Template ${id}`);
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
        throw err;
    }
}

exports.remove = async (id) => {
    let result = await Template.findByPk(id);
    if (result == null) {
        throw new NotFound(`id: Missing Template ${id}`);
    }
    let num = await Template.destroy({
        where: { id: id }
    });
    if (num !== 1) {
        throw new NotFound(`id: Cannot remove Template ${id}`);
    }
    return result;
}

exports.update = async (id, data) => {
    let original = await Template.findByPk(id);
    if (original === null) {
        throw new NotFound(`id: Missing Template ${id}`);
    }
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        data.id = id;
        let result = await Template.update(data, {
            fields: fieldsWithId,
            transaction: transaction,
            where: { id: id }
        });
        if (result[0] === 0) {
            throw new Error("id: Update did not occur for id " + id);
        }
        await transaction.commit();
        transaction = null;
        return Template.findByPk(id);
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
            ["name", "ASC"]
        ],
        where: {
            facilityId: facilityId,
        }
    }

    return await Template.findAll(conditions);

}

exports.findByFacilityIdAndName = async (facilityId, name) => {

    let conditions = {
        order: [
            ["facilityId", "ASC"],
            ["name", "ASC"]
        ],
        where: {
            facilityId: facilityId,
            name: { [Op.iLike]: `%${name}%` }
        }
    }

    return await Template.findAll(conditions);

}

exports.findByFacilityIdAndNameExact = async (facilityId, name) => {

    let conditions = {
        order: [
            ["facilityId", "ASC"],
            ["name", "ASC"]
        ],
        where: {
            facilityId: facilityId,
            name: name
        }
    }

    let results = await Template.findAll(conditions);
    if (results.length > 0) {
        return results[0];
    } else {
        throw new NotFound(`name: Missing name '${name}'`);
    }

}
