"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../../src/models");
const Facility = db.Facility;
const FacilityServices = require("../../src/services/FacilityServices");

const NotFound = require("../../src/errors/NotFound");

const {
    facilitiesData0, loadFacilities,
    registrationsData0, registrationsData1, loadRegistrations,
} = require("../util/SeedData");

const {
    registrationKey
} = require("../util/SortKeys");

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// FacilityServices Registration Tests ---------------------------------------

describe("FacilityServices Registration Tests", () => {

    // Testing Hooks ---------------------------------------------------------

    before("#init", async () => {
        await Facility.sync({
            force: true
        });
    });

    beforeEach("#erase", async () => {
        await Facility.destroy({
            cascade: true,
            truncate: true
        });
    });

// Test Methods ----------------------------------------------------------

    describe("#registrationAll", () => {

        context("all objects", () => {

            it("should fail with invalid facilityId", async () => {

                let invalidFacilityId = 9999;

                try {
                    await FacilityServices.registrationAll(invalidFacilityId);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`facilityId: Missing Facility ${invalidFacilityId}`);
                }

            });

            it("should succeed with all nested objects", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[2].dataValues;
                await loadRegistrations(facilityMatch, registrationsData0);
                await loadRegistrations(facilityMatch, registrationsData1);

                try {
                    let results = await FacilityServices.registrationAll(facilityMatch.id);
                    expect(results.length).to.equal(6);
                    let previousKey;
                    results.forEach(result => {
                        let currentKey = registrationKey(result);
                        if (previousKey) {
                            if (currentKey < previousKey) {
                                expect.fail(`key: Expected '${currentKey}' >= '${previousKey}'`);
                            }
                            previousKey = currentKey;
                        }
                    })
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            })

            it("should succeed with no nested objects", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[0].dataValues;

                try {
                    let results = await FacilityServices.registrationAll(facilityMatch.id);
                    expect(results.length).to.equal(0);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            })

            it("should succeed with paginated nested objects", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[2].dataValues;
                await loadRegistrations(facilityMatch, registrationsData0);
                await loadRegistrations(facilityMatch, registrationsData1);

                try {
                    let results = await FacilityServices.registrationAll(facilityMatch.id, {
                        offset: 1
                    });
                    expect(results.length).to.equal(5);
                    let previousKey;
                    results.forEach(result => {
                        let currentKey = registrationKey(result);
                        if (previousKey) {
                            if (currentKey < previousKey) {
                                expect.fail(`key: Expected '${currentKey}' >= '${previousKey}'`);
                            }
                            previousKey = currentKey;
                        }
                    })
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            })

        });

    });

    describe("#registrationDate", () => {

        context("all objects", () => {

            it("should fail with invalid facilityId", async () => {

                let invalidFacilityId = 9999;

                try {
                    await FacilityServices.registrationDate(invalidFacilityId, "2020-07-04");
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`facilityId: Missing Facility ${invalidFacilityId}`);
                }

            });

            it("should succeed with all nested objects", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[2].dataValues;
                await loadRegistrations(facilityMatch, registrationsData0);
                await loadRegistrations(facilityMatch, registrationsData1);
                let registrationDate = registrationsData1[2].registrationDate;

                try {
                    let results = await FacilityServices.registrationDate
                        (facilityMatch.id, registrationDate);
                    expect(results.length).to.equal(3);
                    let previousKey;
                    results.forEach(result => {
                        let currentKey = registrationKey(result);
                        if (previousKey) {
                            if (currentKey < previousKey) {
                                expect.fail(`key: Expected '${currentKey}' >= '${previousKey}'`);
                            }
                            previousKey = currentKey;
                        }
                    })
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            })

            it("should succeed with no nested objects", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[0].dataValues;

                try {
                    let results = await FacilityServices.registrationDate
                        (facilityMatch.id, "2020-07-02");
                    expect(results.length).to.equal(0);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            })

            it("should succeed with paginated nested objects", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[2].dataValues;
                await loadRegistrations(facilityMatch, registrationsData0);
                await loadRegistrations(facilityMatch, registrationsData1);
                let registrationDate = registrationsData0[0].registrationDate;

                try {
                    let results = await FacilityServices.registrationDate
                        (facilityMatch.id, registrationDate, {
                        offset: 1
                    });
                    expect(results.length).to.equal(2);
                    let previousKey;
                    results.forEach(result => {
                        let currentKey = registrationKey(result);
                        if (previousKey) {
                            if (currentKey < previousKey) {
                                expect.fail(`key: Expected '${currentKey}' >= '${previousKey}'`);
                            }
                            previousKey = currentKey;
                        }
                    })
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            })

        });

    });

});
