"use strict";

// TODO - Use environment variables for sensitive information
module.exports = {
    HOST: "localhost",
    USER: "guests",
    PASSWORD: "guests",
    DB: "guests",
    dialect: "postgres",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};
