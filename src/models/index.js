"use strict"

// Internal Modules ----------------------------------------------------------

// External Modules ----------------------------------------------------------

require("custom-env").env(true);
const Sequelize = require("sequelize");

// Configure Database Interface ----------------------------------------------

console.info(`Configuring database for ${process.env.NODE_ENV} mode`);

const sequelize = (process.env.NODE_ENV === "production")
    ? new Sequelize(process.env.DB_DB, process.env.DB_USER, process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
//        logging: console.log,
        logging: false,
        pool: {
            acquire: parseInt(process.env.DB_POOL_ACQUIRE),
            idle: parseInt(process.env.DB_POOL_IDLE),
            max: parseInt(process.env.DB_POOL_MAX),
            min: parseInt(process.env.DB_POOL_MIN),
        }
    })
    : new Sequelize('database', 'username', 'password', {
        dialect: 'sqlite',
//    logging: console.log,
        logging: false,
        storage: './test/database.sqlite'
    })
;

const db = { };
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.sequelize.sync();
/*
db.sequelize.sync({
    force: true
}).then(() => {
    console.log("Dropped and resynchronized database tables");
})
*/

// Configure Models ----------------------------------------------------------

db.Ban = require("./Ban")(sequelize);
db.Facility = require("./Facility")(sequelize);
db.Guest = require("./Guest")(sequelize);
db.Registration = require("./Registration")(sequelize);
db.Template = require("./Template")(sequelize);

// Configure Associations ----------------------------------------------------

db.Ban.associate(db);
db.Facility.associate(db);
db.Guest.associate(db);
db.Registration.associate(db);
db.Template.associate(db);

// Export Database Interface -------------------------------------------------

module.exports = db;
