"use strict";

// Internal Modules ----------------------------------------------------------

// External Modules ----------------------------------------------------------

const { DataTypes, Model, Op } = require("sequelize");

// Facility Model ------------------------------------------------------------

module.exports = (sequelize) => {

    const stateAbbreviations =
        [ "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC",
          "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY",
          "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT",
          "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH",
          "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT",
          "VT", "VA", "WA", "WV", "WI", "WY" ];

    class Facility extends Model {
    }

    Facility.init({

        active: {
            allowNull: false,
            type: DataTypes.BOOLEAN
        },

        address1: {
            type: DataTypes.STRING
        },

        address2: {
            type: DataTypes.STRING
        },

        city: {
            type: DataTypes.STRING
        },

        email: {
            type: DataTypes.STRING,
            // TODO - email validation
        },

        name: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true,
            validate: {
                isUnique: function(value, next) {
                    let conditions = {
                        where: {
                            name: value
                        }
                    };
                    if (this.id !== null) {
                        conditions.where["id"] = { [Op.ne]: this.id };
                    }
                    Facility.count(conditions)
                        .then(found => {
                            return (found !== 0)
                                ? next(`name: Name '${value}' is already in use`)
                                : next();
                        })
                        .catch(next);
                }
            }
        },

        phone: {
            type: DataTypes.STRING(12),
            validate: {
                isValidFormat: function(value, next) {
                    if (value && (value.length > 0)) {
                        let pattern = /^\d{3}-\d{3}-\d{4}$/;
                        if (!pattern.test(value)) {
                            next(`phone: Phone '${value}' must match format 999-999-9999`);
                        }
                    }
                    return next();
                }
            }
        },

        state: {
            type: DataTypes.STRING(2),
            validate: {
                isValidValue: function(value, next) {
                    if (value && (value.length > 0)) {
                        if (stateAbbreviations.indexOf(value) < 0) {
                            next(`state: State '${value}' is not a valid abbreviation`);
                        }
                    }
                    return next();
                }
            }
        },

        zipCode: {
            field: "zipcode",
            type: DataTypes.STRING(10),
            validate: {
                isValidFormat: function(value, next) {
                    if (value && (value.length > 0)) {
                        let pattern = /^\d{5}$|^\d{5}-\d{4}$/;
                        if (!pattern.test(value)) {
                            next(`zipCode: Zip Code '${value}' must match format 99999 or 99999-9999`);
                        }
                    }
                    return next();
                }
            }
        }

    }, {

        createdAt: "published",
        modelName: "facility",
        tableName: "facilities",
        timestamps: true,
        updatedAt: "updated",
        version: true,

        sequelize

    });

    // Facility Associations -------------------------------------------------

    Facility.associate = function (models) {
        models.Facility.hasMany(models.Guest);

        models.Facility.hasMany(models.Registration);

        models.Facility.hasMany(models.Template);

    };

    // Export Model ----------------------------------------------------------

    return Facility;

}
