"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const Facility = db.Facility;
const FacilityServices = require("./FacilityServices");
const Template = db.Template;
const TemplateServices = require("./TemplateServices");

// External Modules ----------------------------------------------------------

// Public Methods ------------------------------------------------------------

exports.reload = async () => {

    // Resynchronize database metadata
    console.log("***** Resynchronizing Database Metadata *****");
    await db.sequelize.sync({
        force: true,
//        logging: console.log
    });

    // Seed data for our models, in a top-down order
    console.log("***** Reloading Seed Data Begin *****");

    await loadFacilities(facilityData);

    await loadTemplates("Chester", templateDataChester);
    await loadTemplates("Oakland", templateDataOakland);
    await loadTemplates("Portland", templateDataPortland);
    await loadTemplates("San Francisco", templateDataSanFrancisco);
    await loadTemplates("San Jose", templateDataSanJose);

    console.log("***** Reloading Seed Data End *****")

    // Return counts of created models
    let results = { };
    results["facilities"] = await Facility.count({});
    results["templates"] = await Template.count({});
    return results;

}

// Seed Data -----------------------------------------------------------------

const facilityData = [
    {
        active: true,
        address1: "634 Sproul Street",
        city: "Chester",
        email: "chester@cityteam.org",
        name: "Chester",
        phone: "610-872-6865",
        state: "PA",
        zipCode: "19013"
    },
    {
        active: false,
        name: "Inactive"
    },
    {
        active: true,
        address1: "722 Washington St.",
        city: "Oakland",
        email: "oakland@cityteam.org",
        name: "Oakland",
        phone: "510-452-3758",
        state: "CA",
        zipCode: "94607"
    },
    {
        active: true,
        address1: "526 SE Grand Ave.",
        city: "Portland",
        email: "portland@cityteam.org",
        name: "Portland",
        phone: "503-231-9334",
        state: "OR",
        zipCode: "97214"
    },
    {
        active: true,
        address1: "164 6th Street",
        city: "San Francisco",
        email: "sanfrancisco@cityteam.org",
        name: "San Francisco",
        phone: "415-861-8688",
        state: "CA",
        zipCode: "94103"
    },
    {
        active: true,
        address1: "2306 Zanker Road",
        city: "San Jose",
        email: "sanjose@cityteam.org",
        name: "San Jose",
        phone: "408-232-5600",
        state: "CA",
        zipCode: "95131"
    },
]

const templateDataChester = [
    {
        allMats: "1-6",
        comments: "Chester COVID Template",
        handicapMats: "1,3",
        name: "Chester COVID",
        socketMats: "3,5"
    },
    {
        allMats: "1-58",
        comments: "Chester Standard Template",
        handicapMats: "1,3",
        name: "Chester Standard",
        socketMats: "3,5"
    }
]
const templateDataOakland = [
    {
        allMats: "1-3,4-6",
        comments: "Oakland COVID Template",
        handicapMats: "1,3",
        name: "Oakland COVID",
        socketMats: "3,5"
    },
    {
        allMats: "1-58",
        comments: "Oakland Standard Template",
        handicapMats: "1,3",
        name: "Oakland Standard",
        socketMats: "3,5"
    }
]
const templateDataPortland = [
    {
        allMats: "1-24",
        comments: "Portland COVID Template",
        handicapMats: "1,9-10,21",
        name: "Portland COVID",
        socketMats: "17-18,22-23"
    },
    {
        allMats: "1-58",
        comments: "Portland Standard Template",
        handicapMats: "1,9-10,21,30-31,34-35,43,54-55,58",
        name: "Portland Standard",
        socketMats: "17-18,22-23,30-31,36-37,42,53-54,57-58"
    }
]
const templateDataSanFrancisco = [
    {
        allMats: "1-12",
        comments: "San Francisco COVID Template",
        handicapMats: "1,3",
        name: "San Francisco COVID",
        socketMats: "3,5"
    },
    {
        allMats: "1-58",
        comments: "San Francisco Standard Template",
        handicapMats: "1,3",
        name: "San Francisco Standard",
        socketMats: "3,5"
    }
]
const templateDataSanJose = [
    {
        allMats: "1-24",
        comments: "San Jose COVID Template",
        handicapMats: "1,9-10,21",
        name: "San Jose COVID",
        socketMats: "17-18,22-23"
    },
    {
        allMats: "1-58",
        comments: "San Jose Standard Template",
        handicapMats: "1,9-10,21,30-31,34-35,43,54-55,58",
        name: "San Jose Standard",
        socketMats: "17-18,22-23,30-31,36-37,42,53-54,57-58"
    }
]

// Private Methods -----------------------------------------------------------

let loadFacilities = async (facilityData) => {
    for (const facility of facilityData) {
        await FacilityServices.insert(facility);
    }
}

let loadTemplates = async (facilityName, templateData) => {
    let facility = await FacilityServices.findByNameExact(facilityName);
    for (const template of templateData) {
        template.facilityId = facility.id;
        await TemplateServices.insert(template);
    }
}

