"use strict"

// EXPORTS FUNCTIONS TO CALCULATE SORT KEYS FOR MODEL OBJECTS

module.exports.banKey = (ban) => {
    return "|" + ban.guestId + "|" + ban.banFrom + "|";
}

module.exports.facilityKey = (facility) => {
    return facility.name;
}

module.exports.guestKey = (guest) => {
    return "|" + guest.facilityId + "|" + guest.lastName +
        "|" + guest.firstName + "|";
}

module.exports.registrationKey = (registration) => {
    return "|" + registration.facilityId + "|" +
        registration.registrationDate + "|" +
        registration.matNumber + "|";
}

module.exports.templateKey = (template) => {
    return "|" + template.facilityId + "|" + template.name + "|";
}

