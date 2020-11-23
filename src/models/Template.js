"use strict";

// Internal Modules ----------------------------------------------------------

var Facility; // Filled in by associate()
const MatsList = require("../util/MatsList");

// External Modules ----------------------------------------------------------

const { DataTypes, Model, Op } = require("sequelize");

// Template Model ------------------------------------------------------------

module.exports = (sequelize) => {

    class Template extends Model {
    }

    Template.init({

        active: {
            allowNull: false,
            defaultValue: true,
            type: DataTypes.BOOLEAN,
            validate: {
                notNull: {
                    msg: "active: Is required"
                }
            }
        },

        allMats: {
            allowNull: false,
            field: "allmats",
            type: DataTypes.STRING,
            validate: {
                isAllMatsValid: function(value) {
                    try {
                        new MatsList(value);
                    } catch (err) {
                        throw err;
                    }
                },
                notNull: {
                    msg: "allMats: Is required"
                }
            }
        },

        comments: {
            allowNull: true,
            type: DataTypes.STRING
        },

        facilityId: {
            allowNull: false,
            field: "facilityid",
            type: DataTypes.INTEGER,
            unique: "uniqueNameWithinFacility",
            validate: {
                isValidFacilityId: function (value, next) {
                    if (value) {
                        Facility.findByPk(value)
                            .then(facility => {
                                if (facility) {
                                    next();
                                } else {
                                    next(`facilityId: Missing Facility ${value}`);
                                }
                            })
                            .catch(next);
                    } else {
                        next("facilityId: Is required");
                    }
                },
                notNull: {
                    msg: "facilityId: Is required"
                }
            }
        },

        handicapMats: {
            allowNull: true,
            field: "handicapmats",
            type: DataTypes.STRING,
            validate: {
                isHandicapMatsValid: function(value) {
                    if (value) {
                        try {
                            new MatsList(value);
                        } catch (err) {
                            throw err;
                        }
                    }
                }
            }
        },

        name: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: "uniqueNameWithinFacility",
            validate: {
                notNull: {
                    msg: "name: Is required"
                }
            }
        },

        socketMats: {
            allowNull: true,
            field: "socketmats",
            type: DataTypes.STRING,
            validate: {
                isSocketMatsValid: function(value) {
                    if (value) {
                        try {
                            new MatsList(value);
                        } catch (err) {
                            throw err;
                        }
                    }
                }
            }
        },

        workMats: {
            allowNull: true,
            field: "workmats",
            type: DataTypes.STRING,
            validate: {
                isSocketMatsValid: function(value) {
                    if (value) {
                        try {
                            new MatsList(value);
                        } catch (err) {
                            throw err;
                        }
                    }
                }
            }
        },

    }, {

        createdAt: "published",
        modelName: "template",
        tableName: "templates",
        timestamps: true,
        updatedAt: "updated",
        validate: {
            isHandicapMatsValidSubset: function() {
                if (this.allMats && this.handicapMats) {
                    let parent = new MatsList(this.allMats);
                    let child = new MatsList(this.handicapMats);
                    if (!child.isSubsetOf(parent)) {
                        throw new Error("handicapMats: is not a subset of all mats");
                    }
                }
            },
            isNameUniqueWithinFacility: function(next) {
                let conditions = {where: {
                        facilityId: this.facilityId,
                        name: this.name
                    }};
                if (this.id) {
                    conditions.where["id"] = {[Op.ne]: this.id};
                }
                Template.count(conditions)
                    .then(found => {
                        return (found !== 0)
                            ? next(`name: Name '${this.name}' ` +
                                "is already in use within this facility")
                            : next();
                    })
                    .catch(next);
            },
            isSocketMatsValidSubset: function() {
                if (this.allMats && this.socketMats) {
                    let parent = new MatsList(this.allMats);
                    let child = new MatsList(this.socketMats);
                    if (!child.isSubsetOf(parent)) {
                        throw new Error("socketMats: is not a subset of all mats");
                    }
                }
            }
        },
        version: true,

        sequelize

    });

    // Template Associations -------------------------------------------------

    Template.associate = function(models) {

        Facility = models.Facility;
        models.Template.belongsTo(models.Facility, {
            // name: "facilityId",
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: false
            }
        })

    };

    // Export Model ----------------------------------------------------------

    return Template;

}
