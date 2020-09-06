"use strict";

// Internal Modules ----------------------------------------------------------

var Facility; // Filled in by associate()

// External Modules ----------------------------------------------------------

const { DataTypes, Model, Op } = require("sequelize");

// Guest Model ---------------------------------------------------------------

module.exports = (sequelize) => {

    class Guest extends Model {
    }

    Guest.init({

        comments: {
            allowNull: true,
            type: DataTypes.STRING,
        },

        facilityId: {
            allowNull: false,
            field: "facilityid",
            type: DataTypes.INTEGER,
            unique: "uniqueNameWithinFacility",
            validate: {
                isValidFacilityId: function (value, next) {
                    Facility.findByPk(value)
                        .then(facility => {
                            if (facility) {
                                next();
                            } else {
                                next(`facilityId: Missing Facility ${value}`);
                            }
                        })
                        .catch(next);
                }
            }
        },

        firstName: {
            allowNull: false,
            field: "firstname",
            type: DataTypes.STRING,
            unique: "uniqueNameWithinFacility"
        },

        lastName: {
            allowNull: false,
            field: "lastname",
            type: DataTypes.STRING,
            unique: "uniqueNameWithinFacility"
        },



    }, {

        createdAt: "published",
        modelName: "guest",
        tableName: "guests",
        timestamps: true,
        updatedAt: "updated",
        validate: {
            isNameUniqueWithinFacility: function(next) {
                let conditions = {where: {
                        facilityId: this.facilityId,
                        firstName: this.firstName,
                        lastName: this.lastName
                    }};
                if (this.id) {
                    conditions.where["id"] = {[Op.ne]: this.id};
                }
                Guest.count(conditions)
                    .then(found => {
                        return (found !== 0)
                            ? next(`name: Name '${this.firstName} ${this.lastName}' ` +
                                "is already in use within this facility")
                            : next();
                    })
                    .catch(next);
            },
        },
        version: true,

        sequelize

    });

    // Guest Associations ----------------------------------------------------

    Guest.associate = function(models) {

        models.Guest.hasMany(models.Ban);

        Facility = models.Facility;
        models.Guest.belongsTo(models.Facility, {
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: false
            }
        });

    };

    // Export Model ----------------------------------------------------------

    return Guest;

}