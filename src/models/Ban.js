"use strict";

// Internal Modules ----------------------------------------------------------

var Guest; // Filled in by associate()

// External Modules ----------------------------------------------------------

const { DataTypes, Model, Op } = require("sequelize");

// Ban Model -----------------------------------------------------------------

module.exports = (sequelize) => {

    class Ban extends Model {
    }

    Ban.init({

        active: {
            allowNull: false,
            type: DataTypes.BOOLEAN
        },

        banFrom: {
            allowNull: false,
            field: "banfrom",
            type: DataTypes.DATEONLY
        },

        banTo: {
            allowNull: false,
            field: "banto",
            type: DataTypes.DATEONLY
        },

        comments: {
            allowNull: true,
            type: DataTypes.STRING
        },

        guestId: {
            allowNull: false,
            field: "guestid",
            type: DataTypes.INTEGER,
            validate: {
                isValidGuestId: function(value, next) {
                    Guest.findByPk(value)
                        .then(guest => {
                            if (guest) {
                                next();
                            } else {
                                next("guestId: Missing Guest " + value);
                            }
                        })
                        .catch(next);
                }
            }
        },

        staff: {
            allowNull: true,
            type: DataTypes.STRING
        }

    }, {

        createdAt: "published",
        modelName: "ban",
        tableName: "bans",
        timestamps: true,
        updatedAt: "updated",
        validate: {
            isBanDateOrderCorrect() {
                if (!this.banFrom || !this.banTo) {
                    throw new Error("Both banFrom and banTo are required");
                }
                if (this.banFrom > this.banTo) {
                    throw new Error("banTo must be equal to or greater than banFrom");
                }
            }
            // TODO - do we care about overlapping ban ranges?
        },
        version: true,

        sequelize

    });

    // Ban Associations ------------------------------------------------------

    Ban.associate = function(models) {

        Guest = models.Guest;
        models.Ban.belongsTo(models.Guest, {
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: false
            }
        });

    }

    // Export Model ----------------------------------------------------------

    return Ban;

}