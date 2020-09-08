"use strict";

// Internal Modules ----------------------------------------------------------

var Facility; // Filled in by associate()
var Guest; // Filled in by associate()

// External Modules ----------------------------------------------------------

const { DataTypes, Model, Op } = require("sequelize");

// Registration Model --------------------------------------------------------

module.exports = (sequelize) => {

    class Registration extends Model {
    }

    Registration.init({

        comments: {
            allowNull: true,
            type: DataTypes.STRING
        },

        facilityId: {
            allowNull: false,
            field: "facilityid",
            type: DataTypes.INTEGER,
            unique: "uniqueDateMatWithinFacility",
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

        features: {
            allowNull: true,
            type: DataTypes.STRING,
            validate: {
                // TODO - validate features
            }
        },

        guestId: {
            allowNull: true,
            field: "guestid",
            type: DataTypes.INTEGER,
            validate: {
                isValidGuestId: function (value, next) {
                    if (value) {
                        Guest.findByPk(value)
                            .then(guest => {
                                if (guest) {
                                    next();
                                } else {
                                    next("guestId: Missing Guest " + value);
                                }
                            })
                            .catch(next);
                    } else {
                        next();
                    }
                }
                // TODO - does this guest belong to this facility?
            }
        },

        matNumber: {
            allowNull: false,
            field: "matnumber",
            type: DataTypes.INTEGER,
            unique: "uniqueDateMatWithinFacility",
        },

        paymentAmount: {
            allowNull: true,
            field: "paymentamount",
            type: DataTypes.DECIMAL(5, 2),
            validate: {
                // TODO - must be positive if present?
            }
        },

        paymentType: {
            allowNull: true,
            field: "paymenttype",
            type: DataTypes.STRING,
            validate: {
                // TODO - must be valid from enumeration if present
            }
        },

        registrationDate: {
            allowNull: false,
            field: "registrationdate",
            type: DataTypes.DATEONLY,
            unique: "uniqueDateMatWithinFacility",
            validate: {
                // TODO - probably already covered
            }
        },

        showerTime: {
            allowNull: true,
            field: "showertime",
            type: DataTypes.TIME,
        },

        wakeupTime: {
            allowNull: true,
            field: "wakeuptime",
            type: DataTypes.TIME,
        }

    }, {

        createdAt: "published",
        modelName: "registration",
        tableName: "registrations",
        timestamps: true,
        updatedAt: "updated",
        validate: {
            isMatNumberRegistrationDateUniqueWithinFacility: function(next) {
                let conditions = {
                    where: {
                        facilityId: this.facilityId,
                        matNumber: this.matNumber,
                        registrationDate: this.registrationDate
                    }
                };
                if (this.id) {
                    conditions.where["id"] = {[Op.ne]: this.id};
                }
                Registration.count(conditions)
                    .then(found => {
                        return (found !== 0)
                            ? next(`matNumber: Mat number ${this.matNumber} ` +
                                   `already in use on registration date ${this.registrationDate} ` +
                                   `within this facility`)
                            : next();
                    })
                    .catch(next);
            }
        },
        version: true,

        sequelize

    });

    // Registration Associations ------------------------------------------------------

    Registration.associate = function(models) {

        Facility = models.Facility;
        models.Registration.belongsTo(models.Facility, {
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: false
            }
        });

        Guest = models.Guest;
        models.Registration.belongsTo(models.Guest, {
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: true
            }
        });

    }

    // Export Model ----------------------------------------------------------

    return Registration;

}