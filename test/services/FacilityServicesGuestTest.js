"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../../src/models");
const Facility = db.Facility;
const FacilityServices = require("../../src/services/FacilityServices");

const NotFound = require("../../src/errors/NotFound");

const {
    facilitiesData0, loadFacilities,
    guestsData0, guestsData1, loadGuests,
} = require("../util/SeedData");

const {
    guestKey
} = require("../util/SortKeys");

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// FacilityServices Guest Tests ----------------------------------------------

describe("FacilityServices Guest Tests", () => {

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

    describe("#guestAll", () => {

        context("all objects", () => {

            it("should fail with invalid facilityId", async () => {

                let invalidFacilityId = 9999;

                try {
                    await FacilityServices.guestAll(invalidFacilityId);
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
                await loadGuests(facilityMatch, guestsData0);

                try {
                    let results = await FacilityServices.guestAll(facilityMatch.id);
                    expect(results.length).to.equal(3);
                    let previousKey;
                    results.forEach(result => {
                        let currentKey = guestKey(result);
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
                    let results = await FacilityServices.guestAll(facilityMatch.id);
                    expect(results.length).to.equal(0);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            })

            it("should succeed with paginated nested objects", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[2].dataValues;
                await loadGuests(facilityMatch, guestsData0);

                try {
                    let results = await FacilityServices.guestAll(facilityMatch.id, {
                        offset: 1
                    });
                    expect(results.length).to.equal(2);
                    let previousKey;
                    results.forEach(result => {
                        let currentKey = guestKey(result);
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

    describe("#guestExact", () => {

        context("all objects", () => {

            it("should fail with invalid name", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[2].dataValues;
                await loadGuests(facilityMatch, guestsData0);
                let invalidFirstName = "Invalid First Name";
                let invalidLastName = "Invalid Last Name"

                try {
                    let result = await FacilityServices.guestExact
                        (facilityMatch.id, invalidFirstName, invalidLastName);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`name: Missing Guest '${invalidFirstName} ${invalidLastName}'`);
                }

            });

            it("should succeed with valid name", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[2].dataValues;
                let guests = await loadGuests(facilityMatch, guestsData1);
                let guestMatch = guests[0].dataValues;

                try {
                    let result = await FacilityServices.guestExact
                       (facilityMatch.id, guestMatch.firstName, guestMatch.lastName);
                    expect(result.firstName).to.equal(guestMatch.firstName);
                    expect(result.lastName).to.equal(guestMatch.lastName);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#guestName", () => {

        // WARNING:  sqlite3 does not understand ilike operator so we cannot test

    });

});
