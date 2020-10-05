"use strict";

// Internal Modules ----------------------------------------------------------

const db = require ("../../src/models");
const Facility = db.Facility;
const Guest = db.Guest;
const GuestServices = require("../../src/services/GuestServices");

const BadRequest = require("../../src/errors/BadRequest");
const NotFound = require("../../src/errors/NotFound");

const {
    facilitiesData0, facilitiesData1, loadFacilities,
    guestsData0, guestsData1, loadGuests,
} = require("../util/SeedData");

const {
    guestKey,
} = require("../util/SortKeys");

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// GuestServices Tests -------------------------------------------------------

describe("GuestServices Tests", () => {

    // Testing Hooks ---------------------------------------------------------

    before("#init", async () => {
        await Facility.sync({
            force: true
        });
        await Guest.sync({
            force: true
        });
    });

    beforeEach("#erase", async () => {
        await Guest.destroy({
            cascade: true,
            truncate: true
        });
        await Facility.destroy({
            cascade: true,
            truncate: true
        });
    });

    // Test Methods ----------------------------------------------------------

    describe("#all()", () => {

        context("all objects", () => {

            it("should find all objects", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[2].dataValues;
                await loadGuests(facilityMatch, guestsData0);

                try {
                    let results = await GuestServices.all();
                    expect(results.length).to.equal(3);
                    let previousKey;
                    results.forEach(result => {
                        let currentKey = guestKey(result);
                        if (previousKey) {
                            if (currentKey < previousKey) {
                                expect.fail(`key: Expected '${currentKey}' >= '${previousKey}'`);
                            }
                        }
                        previousKey = currentKey;
                    });
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it("should find all objects with include", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[1].dataValues;
                await loadGuests(facilityMatch, guestsData0);

                try {
                    let results = await GuestServices.all({
                        withFacility: ""
                    });
                    expect(results.length).to.equal(3);
                    results.forEach(result => {
                        if (result.facility) {
                            if (result.facilityId === facilityMatch.id) {
                                expect(result.facility.id).to.equal(facilityMatch.id);
                            }
                        } else {
                            expect.fail("Should have included facility");
                        }
                    });
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it("should find some objects with pagination", async () => {

                let facilities = await loadFacilities(facilitiesData1);
                let facilityMatch = facilities[2].dataValues;
                await loadGuests(facilityMatch, guestsData1);

                try {
                    let results = await GuestServices.all({
                        offset: 1
                    });
                    expect(results.length).to.equal(2);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

        context("no objects", () => {

            it("should find no objects", async () => {

                let results = await GuestServices.all();
                expect(results.length).to.equal(0);

            });

        });

    });

    describe("#find()", () => {

        context("one object", () => {

            it("should fail on invalid guestId", async () => {

                let guestId = 9999;

                try {
                    await GuestServices.find(guestId);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    let expected = `guestId: Missing Guest ${guestId}`;
                    expect(err.message).includes(expected);
                }

            });

            it("should succeed on valid guestId", async () => {

                let facilities = await loadFacilities(facilitiesData1);
                let facilityMatch = facilities[2].dataValues;
                let guests = await loadGuests(facilityMatch, guestsData1);
                let guestMatch = guests[0].dataValues;

                try {
                    let result = await GuestServices.find(guestMatch.id);
                    expect(result.firstName).to.equal(guestMatch.firstName);
                    expect(result.lastName).to.equal(guestMatch.lastName);
                } catch (rr) {
                }

            });

        });

    });

    describe("#insert()", () => {

        context("invalid arguments", () => {

            it("should fail with duplicate name in same facility", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[2].dataValues;
                let guests = await loadGuests(facilityMatch, guestsData0);
                let invalidData = {
                    ...guests[0].dataValues,
                    firstName: guests[1].firstName,
                    lastName: guests[1].lastName,
                }
                delete invalidData.id;

                try {
                    await GuestServices.insert(invalidData);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`name: Name '${invalidData.firstName} ${invalidData.lastName}' is already in use`);
                }

            });

            it("should fail with invalid facilityId", async () => {

                let invalidData = {
                    ...guestsData0[2],
                    facilityId: 9999
                }

                try {
                    await GuestServices.insert(invalidData);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}`);
                    }
                    expect(err.message).includes(`facilityId: Missing Facility ${invalidData.facilityId}`);
                }

            });

            it("should fail with missing facilityId", async () => {

                let invalidData = {
                    ...guestsData0[1]
                }
                delete invalidData.facilityId;

                try {
                    await GuestServices.insert(invalidData);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`facilityId: Is required`);
                }

            });

            it("should fail with missing firstName", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[2].dataValues;
                let invalidData = {
                    ...guestsData0[1],
                    facilityId: facilityMatch.id,
                }
                delete invalidData.firstName;

                try {
                    await GuestServices.insert(invalidData);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`firstName: Is required`);
                }

            });

            it("should fail with missing lastName", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[2].dataValues;
                let invalidData = {
                    ...guestsData0[1],
                    facilityId: facilityMatch.id,
                }
                delete invalidData.lastName;

                try {
                    await GuestServices.insert(invalidData);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`lastName: Is required`);
                }

            });

        });

        context("with valid arguments", () => {

            it("should succeed with duplicate name in different facility", async () => {

                let facilities0 = await loadFacilities(facilitiesData0);
                let facilityMatch0 = facilities0[0];
                let guests0 = await loadGuests(facilityMatch0, guestsData0);
                let facilities1 = await loadFacilities(facilitiesData1);
                let facilityMatch1 = facilities1[1];
                let guests1 = await loadGuests(facilityMatch1, guestsData1);
                let validData = {
                    ...guests0[0].dataValues,
                    firstName: guests1[1].firstName,
                    lastName: guests1[1].lastName
                }

                try {
                    let result = await GuestServices.insert(validData);
                    expect(result.firstName).to.equal(validData.firstName);
                    expect(result.lastName).to.equal(validData.lastName);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it("should succeed with full data", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[2].dataValues;
                let validData = {
                    ...guestsData0[0],
                    facilityId: facilityMatch.id
                }

                try {
                    let result = await GuestServices.insert(validData);
                    expect(result.firstName).to.equal(validData.firstName);
                    expect(result.lastName).to.equal(validData.lastName);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it("should succeed with minimal data", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[2].dataValues;
                let validData = {
                    facilityId: facilityMatch.id,
                    firstName: "New First Name",
                    lastName: "New Last Name"
                }

                try {
                    let result = await GuestServices.insert(validData);
                    expect(result.firstName).to.equal(validData.firstName);
                    expect(result.lastName).to.equal(validData.lastName);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#remove()", () => {

        context("one object", () => {

            it("should fail on invalid guestId", async () => {

                let guestId = 9999;

                try {
                    await GuestServices.remove(guestId);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}`);
                    }
                    expect(err.message).includes(`guestId: Missing Guest ${guestId}`);
                }

            });

            it("should succeed on valid guestId", async () => {

                let facilities = await loadFacilities(facilitiesData1);
                let facilityMatch = facilities[1].dataValues;
                let guests = await loadGuests(facilityMatch, guestsData0);
                let guestMatch = guests[1].dataValues;

                try {
                    let result = await GuestServices.remove(guestMatch.id);
                    expect(result.firstName).to.equal(guestMatch.firstName);
                    expect(result.lastName).to.equal(guestMatch.lastName);
                    let results = await GuestServices.all();
                    expect(results.length).to.equal(2);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#update()", () => {

        context("invalid arguments", () => {

            // NOTE: individual validation errors got checked in #insert tests

            it("should fail with duplicate name", async () => {

                let facilities = await loadFacilities(facilitiesData1);
                let facilityMatch = facilities[0].dataValues;
                let guests = await loadGuests(facilityMatch, guestsData1);
                let guestMatch = guests[0].dataValues;
                let guestDuplicate = guests[1].dataValues;
                let invalidData = {
                    ...guestMatch,
                    firstName: guestDuplicate.firstName,
                    lastName: guestDuplicate.lastName
                }

                try {
                    await GuestServices.update(guestMatch.id, invalidData);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`name: Name '${invalidData.firstName} ${invalidData.lastName}' ` +
                            "is already in use within this facility");
                }

            });

            it("should fail with invalid guestId", async () => {

                let facilities = await loadFacilities(facilitiesData1);
                let facilityMatch = facilities[0].dataValues;
                let guests = await loadGuests(facilityMatch, guestsData1);
                let guestMatch = guests[0].dataValues;
                let invalidId = 9999;
                let invalidData = {
                    ...guestMatch,
                    id: invalidId
                }

                try {
                    await GuestServices.update(invalidId, invalidData);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`guestId: Missing Guest ${invalidId}`);
                }


            });

        });

        context("valid arguments", () => {

            it("should succeed with no changes", async () => {

                let facilities = await loadFacilities(facilitiesData1);
                let facilityMatch = facilities[0].dataValues;
                let guests = await loadGuests(facilityMatch, guestsData1);
                let guestMatch = guests[0].dataValues;

                try {
                    let result = await GuestServices.update
                        (guestMatch.id, guestMatch);
                    expect(result.firstName).to.equal(guestMatch.firstName);
                    expect(result.lastName).to.equal(guestMatch.lastName);
                } catch (err) {
                    expect.fail(`Should not have thrown ${err.message}`);
                }

            });

            it("should succeed with unique name", async () => {

                let facilities = await loadFacilities(facilitiesData1);
                let facilityMatch = facilities[0].dataValues;
                let guests = await loadGuests(facilityMatch, guestsData1);
                let guestMatch = guests[0].dataValues;
                let validData = {
                    ...guestMatch,
                    firstName: guestMatch.firstName + " Updated",
                    lastName: guestMatch.lastName + " Updated"
                }

                try {
                    let result = await GuestServices.update
                            (guestMatch.id, validData);
                    expect(result.firstName).to.equal(validData.firstName);
                } catch (err) {
                    expect.fail(`Should not have thrown ${err.message}`);
                }

            });

        });

    });

});
