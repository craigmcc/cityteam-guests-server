"use strict"

// EXPORTS SEED DATA AND LOAD FUNCTIONS

// Internal Modules ----------------------------------------------------------

const db = require("../../src/models");
const Ban = db.Ban;
const Facility = db.Facility;
const Guest = db.Guest;
const Registration = db.Registration;
const Template = db.Template;

// External Modules ----------------------------------------------------------

// Test Data -----------------------------------------------------------------

// ***** Facilities *****

module.exports.facilitiesData0 = [
    {
        active: true,
        address1: "First Address 1 Facility",
        address2: "First Address 2",
        city: "First City",
        name: "First Facility",
        state: "OR",
        zipCode: "99999",
    },
    {
        active: true,
        address1: "Second Address 1 Facility",
        address2: "Second Address 2",
        city: "Second City",
        name: "Second Facility",
        state: "WA",
        zipCode: "88888",
    },
    {
        active: true,
        address1: "Third Address 1 Facility",
        address2: "Third Address 2",
        city: "Third City",
        name: "Third Facility",
        state: "CA",
        zipCode: "77777",
    },
];

module.exports.facilitiesData1 = [
    {
        active: true,
        address1: "Fourth Address 1 Facility",
        address2: "Fourth Address 2",
        city: "Forth City",
        name: "Fourth Facility",
        state: "ID",
        zipCode: "66666",
    },
    {
        active: false, // For "#active()" test
        address1: "Fifth Address 1 Facility",
        address2: "Fifth Address 2",
        city: "Fifth City",
        name: "Fifth Facility",
        state: "NV",
        zipCode: "55555",
    },
    {
        active: true,
        address1: "Sixth Address 1 Facility",
        address2: "Sixth Address 2",
        city: "Sixth City",
        name: "Sixth Facility",
        state: "MT",
        zipCode: "44444",
    },
];

module.exports.guestsData0 = [
    {
        firstName: "Fred",
        lastName: "Flintstone",
    },
    {
        firstName: "Wilma",
        lastName: "Flintstone",
    },
    {
        firstName: "Pebbles",
        lastName: "Flintstone",
    },
];

module.exports.guestsData1 = [
    {
        firstName: "Barney",
        lastName: "Rubble",
    },
    {
        firstName: "Betty",
        lastName: "Rubble",
    },
    {
        firstName: "Bam Bam",
        lastName: "Rubble",
    },
];

module.exports.registrationsData0 = [
    {
        matNumber: 1,
        registrationDate: "2020-07-02",
    },
    {
        matNumber: 2,
        registrationDate: "2020-07-02",
    },
    {
        matNumber: 3,
        registrationDate: "2020-07-02",
    },
];

module.exports.registrationsData1 = [
    {
        matNumber: 1,
        registrationDate: "2020-07-03",
    },
    {
        matNumber: 2,
        registrationDate: "2020-07-03",
    },
    {
        matNumber: 3,
        registrationDate: "2020-07-03",
    },
];

module.exports.templatesData0 = [
    {
        allMats: "1-24",
        comments: null,
        handicapMats: "2,4,6",
        name: "Emergency Fewer Mats",
        socketMats: "6-10,12",
    },
    {
        allMats: "1-58",
        comments: null,
        handicapMats: "2,4,6",
        name: "Standard Mats",
        socketMats: "6-10,12",
    },
    {
        allMats: "1-12",
        comments: null,
        handicapMats: "2,4,6",
        name: "Extremely Fewer Mats",
        socketMats: "6-10,12",
    },
];

// Single Data Seeders -------------------------------------------------------

// Returns array of created Facility objects
module.exports.loadFacilities = async (data) => {
    try {
        return await Facility.bulkCreate(data, {
            validate: true,
        });
    } catch (err) {
        console.error("loadFacilities() error: ", err);
        throw err;
    }
}

// Returns array of created Guest objects
module.exports.loadGuests = async (facility, data) => {
    data.forEach(datum => {
        datum.facilityId = facility.id;
    });
    try {
        return await Guest.bulkCreate(data, {
            validate: true,
        });
    } catch (err) {
        console.error("loadGuests() error: ", err);
        throw err;
    }
}

// Returns array of created Registration objects
module.exports.loadRegistrations = async (facility, data) => {
    data.forEach(datum => {
        datum.facilityId = facility.id;
    });
    try {
        return await Registration.bulkCreate(data, {
            validate: true,
        });
    } catch (err) {
        console.error("loadRegistrations() error: ", err);
        throw err;
    }
}

// Returns array of created Template objects
module.exports.loadTemplates = async (facility, data) => {
    data.forEach(datum => {
        datum.facilityId = facility.id;
    });
    try {
        return await Template.bulkCreate(data, {
            validate: true,
        });
    } catch (err) {
        console.error("loadTemplates() error: ", err);
        throw err;
    }
}

