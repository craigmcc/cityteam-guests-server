"use strict";

// Internal Modules ----------------------------------------------------------

const BadRequest = require("../errors/BadRequest");
const NotFound = require("../errors/NotFound");
const db = require("../models");
const Facility = db.Facility;
const fields = [
    "active",
    "address1",
    "address2",
    "city",
    "email",
    "name",
    "phone",
    "state",
    "zipCode"
]
const fieldsWithId = [...fields, "id"];

// External Modules ----------------------------------------------------------

const Op = db.Sequelize.Op;

// Model Specific Methods (no id) --------------------------------------------

// Standard CRUD Methods -----------------------------------------------------

exports.all = async () => {
    let conditions = {
        order: [ ["name", "ASC"] ]
    }
    return await Facility.findAll(conditions);
}

exports.find = async (id) => {
    let result = await Facility.findByPk(id);
    if (result === null) {
        throw new NotFound(`id: Missing Facility ${id}`);
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
        throw err;
    }
}

exports.remove = async (id) => {
    let result = await Facility.findByPk(id);
    if (result == null) {
        throw new NotFound(`id: Missing Facility ${id}`);
    }
    let num = await Facility.destroy({
        where: { id: id }
    });
    if (num !== 1) {
        throw new NotFound(`id: Cannot remove Facility ${id}`);
    }
    return result;
}

exports.update = async (id, data) => {
    let original = await Facility.findByPk(id);
    if (original === null) {
        throw new NotFound(`id: Missing Facility ${id}`);
    }
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        data.id = id;
        let result = await Facility.update(data, {
            fields: fieldsWithId,
            transaction: transaction,
            where: { id: id }
        });
        if (result[0] === 0) {
            throw new Error("id: Update did not occur for id " + id);
        }
        await transaction.commit();
        transaction = null;
        return Facility.findByPk(id);
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

exports.findByActive = async () => {
    let conditions = {
        order: [ ["name", "ASC"] ],
        where: { active: true  }
    }
    return await Facility.findAll(conditions);
}

exports.findByName = async (name) => {
    let conditions = {
        order: [ ["name", "ASC"] ],
        where: {
            name: { [Op.iLike]: `%${name}%` }
        }
    }
    return await Facility.findAll(conditions);
}

exports.findByNameExact = async (name) => {
    let conditions = {
        order: [ ["name", "ASC"] ],
        where: { name: name }
    }
    let results = await Facility.findAll(conditions);
    if (results.length > 0) {
        return results[0];
    } else {
        throw new NotFound(`name: Missing name ${name}`)
    }
}
