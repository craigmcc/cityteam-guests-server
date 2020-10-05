"use strict"

// EXPORTS SORT ORDER PARAMETERS FOR EACH MODEL TYPE

module.exports.facilityOrder = [
    ["name", "ASC"],
];

module.exports.guestOrder = [
    ["facilityId", "ASC"],
    ["lastName", "ASC"],
    ["firstName", "ASC"],
];

module.exports.registrationOrder = [
    ["facilityId", "ASC"],
    ["registrationDate", "ASC"],
    ["matNumber", "ASC"],
];

module.exports.templateOrder = [
    ["facilityId", "ASC"],
    ["name", "ASC"],
];
