"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../models");
const Ban = db.Ban;
const BanServices = require("./BanServices");
const Facility = db.Facility;
const FacilityServices = require("./FacilityServices");
const Guest = db.Guest;
const GuestServices = require("./GuestServices");
const Registration = db.Registration;
const RegistrationServices = require("./RegistrationServices");
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

    await loadGuests("Chester", guestDataChester);
    await loadGuests("Oakland", guestDataOakland);
    // NOTE: Portland guests will be imported
    await loadGuests("San Francisco", guestDataSanFrancisco);
    await loadGuests("San Jose", guestDataSanJose);

    await loadRegistrationsAssigned("Chester", "Fred", "Flintstone", 5, registrationDataAssigned);
    await loadRegistrationsAssigned("Chester", "Barney", "Rubble", 6, registrationDataAssigned);
    await loadRegistrationsAssigned("Chester", "Bam Bam", "Rubble", 7, registrationDataAssigned);

    await loadRegistrationsAssigned("Oakland", "Fred", "Flintstone", 5, registrationDataAssigned);
    await loadRegistrationsAssigned("Oakland", "Barney", "Rubble", 6, registrationDataAssigned);
    await loadRegistrationsAssigned("Oakland", "Bam Bam", "Rubble", 7, registrationDataAssigned);

    await loadRegistrationsAssigned("San Francisco", "Fred", "Flintstone", 5, registrationDataAssigned);
    await loadRegistrationsAssigned("San Francisco", "Barney", "Rubble", 6, registrationDataAssigned);
    await loadRegistrationsAssigned("San Francisco", "Bam Bam", "Rubble", 7, registrationDataAssigned);

    await loadRegistrationsAssigned("San Jose", "Fred", "Flintstone", 5, registrationDataAssigned);
    await loadRegistrationsAssigned("San Jose", "Barney", "Rubble", 6, registrationDataAssigned);
    await loadRegistrationsAssigned("San Jose", "Bam Bam", "Rubble", 7, registrationDataAssigned);

    await loadRegistrationsUnassigned("Chester", registrationDataUnassigned);
    await loadRegistrationsUnassigned("Oakland", registrationDataUnassigned);
    // NOTE: Portland registrations will be imported
    await loadRegistrationsUnassigned("San Francisco", registrationDataUnassigned);
    await loadRegistrationsUnassigned("San Jose", registrationDataUnassigned);

    await loadTemplates("Chester", templateDataChester);
    await loadTemplates("Oakland", templateDataOakland);
    await loadTemplates("Portland", templateDataPortland);
    await loadTemplates("San Francisco", templateDataSanFrancisco);
    await loadTemplates("San Jose", templateDataSanJose);

    await loadBans("San Francisco", "Fred", "Flintstone", banDataSanFranciscoFred);
    await loadBans("San Francisco", "Barney", "Rubble", banDataSanFranciscoBarney);

    console.log("***** Reloading Seed Data End *****")

    // Return counts of created models
    let results = { };
    results["bans"] = await Ban.count({});
    results["facilities"] = await Facility.count({});
    results["guests"] = await Guest.count({});
    results["registrations"] = await Registration.count({});
    results["templates"] = await Template.count({});
    return results;

}

// Seed Data -----------------------------------------------------------------

const banDataSanFranciscoBarney = [
    {
        active: true,
        banFrom: "2020-09-01",
        banTo: "2020-09-30",
        comments: "San Francisco Barney September Ban"
    },
    {
        active: true,
        banFrom: "2020-11-01",
        banTo: "2020-11-30",
        comments: "San Francisco Barney November Ban"
    }
]

const banDataSanFranciscoFred = [
    {
        active: true,
        banFrom: "2020-08-01",
        banTo: "2020-08-31",
        comments: "San Francisco Fred August Ban"
    },
    {
        active: true,
        banFrom: "2020-10-01",
        banTo: "2020-10-31",
        comments: "San Francisco Fred October Ban"
    }
]

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

const guestDataChester = [
    {
        comments: "Chester Fred Comment",
        firstName: "Fred",
        lastName: "Flintstone"
    },
    {
        comments: "Chester Barney Comment",
        firstName: "Barney",
        lastName: "Rubble"
    },
    {
        comments: "Chester Bam Bam Comment",
        firstName: "Bam Bam",
        lastName: "Rubble"
    }
]

const guestDataOakland = [
    {
        comments: "Oakland Fred Comment",
        firstName: "Fred",
        lastName: "Flintstone"
    },
    {
        comments: "Oakland Barney Comment",
        firstName: "Barney",
        lastName: "Rubble"
    },
    {
        comments: "Oakland Bam Bam Comment",
        firstName: "Bam Bam",
        lastName: "Rubble"
    }
]

const guestDataSanFrancisco = [
    {
        comments: "San Francisco Fred Comment",
        firstName: "Fred",
        lastName: "Flintstone"
    },
    {
        comments: "San Francisco Barney Comment",
        firstName: "Barney",
        lastName: "Rubble"
    },
    {
        comments: "San Francisco Bam Bam Comment",
        firstName: "Bam Bam",
        lastName: "Rubble"
    }
]

const guestDataSanJose = [
    {
        comments: "San Jose Fred Comment",
        firstName: "Fred",
        lastName: "Flintstone"
    },
    {
        comments: "San Jose Barney Comment",
        firstName: "Barney",
        lastName: "Rubble"
    },
    {
        comments: "San Jose Bam Bam Comment",
        firstName: "Bam Bam",
        lastName: "Rubble"
    }
]

// Reused for each facility
const registrationDataAssigned = [
    {
        features: "SH",
        paymentAmount: 5.00,
        paymentType: "$$",
        registrationDate: "2020-07-04",
        showerTime: "04:30",
        wakeupTime: "04:00"
    }
]

// Reused for each facility
const registrationDataUnassigned = [
    {
        features: "H",
        matNumber: 1,
        registrationDate: "2020-07-04"
    },
    {
        features: "S",
        matNumber: 2,
        registrationDate: "2020-07-04"
    },
    {
        features: "HS",
        matNumber: 3,
        registrationDate: "2020-07-04"
    },
    {
        matNumber: 4,
        registrationDate: "2020-07-04"
    }
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

let loadBans = async (facilityName, firstName, lastName, banData) => {
    let facility = await FacilityServices.findByNameExact(facilityName);
    let guest = await GuestServices.findByFacilityIdAndNameExact
        (facility.id, firstName, lastName);
    for (const ban of banData) {
        ban.guestId = guest.id;
        await BanServices.insert(ban);
    }
}

let loadFacilities = async (facilityData) => {
    for (const facility of facilityData) {
        await FacilityServices.insert(facility);
    }
}

let loadGuests = async (facilityName, guestData) => {
    let facility = await FacilityServices.findByNameExact(facilityName);
    for (const guest of guestData) {
        guest.facilityId = facility.id;
        await GuestServices.insert(guest);
    }
}

let loadRegistrationsAssigned = async (facilityName, firstName, lastName, matNumber, registrationData) => {
    let facility = await FacilityServices.findByNameExact(facilityName);
    let guest = await GuestServices.findByFacilityIdAndNameExact(facility.id, firstName, lastName);
    for (const registration of registrationData) {
        registration.comments = `${facility.name} registration for ${firstName} ${lastName}`;
        registration.facilityId = facility.id;
        registration.guestId = guest.id;
        registration.matNumber = matNumber;
        await RegistrationServices.insert(registration);
    }
}

let loadRegistrationsUnassigned = async (facilityName, registrationData) => {
    let facility = await FacilityServices.findByNameExact(facilityName);
    for (const registration of registrationData) {
        registration.facilityId = facility.id;
        await RegistrationServices.insert(registration);
    }
}

let loadTemplates = async (facilityName, templateData) => {
    let facility = await FacilityServices.findByNameExact(facilityName);
    for (const template of templateData) {
        template.facilityId = facility.id;
        await TemplateServices.insert(template);
    }
}

