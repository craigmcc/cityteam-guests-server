"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../../src/models");
const Facility = db.Facility;
const FacilityServices = require("../../src/services/FacilityServices");

const BadRequest = require("../../src/errors/BadRequest");
const NotFound = require("../../src/errors/NotFound");

const {
    facilitiesData0, facilitiesData1, loadFacilities,
    templatesData0, loadTemplates,
} = require("../util/SeedData");

const {
    facilityKey
} = require("../util/SortKeys");

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// FacilityServices Tests ----------------------------------------------------

describe("FacilityServices Tests", () => {

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

    describe("#active()", () => {

        context("all active objects", () => {

            it("should find all the objects", async () => {

                await loadFacilities(facilitiesData0);  // All are active

                try {
                    let results = await FacilityServices.active();
                    expect(results.length).to.equal(3);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

        context("one inactive object", () => {

            it("should find only active objects", async () => {

                await loadFacilities(facilitiesData1);  // One is inactive

                try {
                    let results = await FacilityServices.active();
                    expect(results.length).to.equal(2);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#all()", () => {

        context("all objects", () => {

            it("should find all objects", async () => {

                await loadFacilities(facilitiesData0);

                try {
                    let results = await FacilityServices.all();
                    expect(results.length).to.equal(3);
                    let previousKey;
                    results.forEach(result => {
                        let currentKey = facilityKey(result);
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

            it("should find all objects with includes", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[0];
                await loadTemplates(facilityMatch, templatesData0);

                try {
                    let results = await FacilityServices.all({
                        withTemplates: ""
                    });
                    expect(results.length).to.equal(3);
                    results.forEach(facility => {
                        if (facility.templates) {
                            if (facility.id === facilityMatch.id) {
                                expect(facility.templates.length).to.equal(3);
                            } else {
                                expect(facility.templates.length).to.equal(0);
                            }
                        } else {
                            expect.fail("Should have included templates");
                        }
                    })
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it("should find some objects with pagination", async () => {

                await loadFacilities(facilitiesData1);

                try {
                    let results = await FacilityServices.all({
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

                let results = await FacilityServices.all();
                expect(results.length).to.equal(0);

            });

        });

    })

    describe("#exact()", () => {

        context("all objects", () => {

            it("should fail with invalid name", async () => {

                await loadFacilities(facilitiesData0);
                let invalidName = "Foo Bar";

                try {
                    await FacilityServices.exact(invalidName);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`name: Missing Facility '${invalidName}'`);
                }

            });

            it("should succeed with valid name", async () => {

                let facilities = await loadFacilities(facilitiesData1);
                let facilityMatch = facilities[1];

                try {
                    let result = await FacilityServices.exact(facilityMatch.name);
                    expect(result.id).to.equal(facilityMatch.id);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#find()", () => {

        context("one object", () => {

            it("should fail on mismatched id", async () => {

                let facilityId = 9999;

                try {
                    await FacilityServices.find(facilityId);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    let expected = `facilityId: Missing Facility ${facilityId}`;
                    expect(err.message).includes(expected);
                }

            });

            it("should succeed on matched id", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[0];

                try {
                    let result = await FacilityServices.find(facilityMatch.id);
                    expect(result.id).to.equal(facilityMatch.id);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.mesage}'`);
                }

            });

        });

    });

    describe("#insert()", () => {

        context("invalid arguments", () => {

            it("should fail with duplicate name", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let invalidData = {
                    ...facilities[2].dataValues,
                    name: facilities[1].name
                }
                delete invalidData.id;

                try {
                    await FacilityServices.insert(invalidData);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`name: Name '${invalidData.name}' is already in use`);
                }

            });

            it("should fail with invalid phone", async () => {

                let facilities = await loadFacilities(facilitiesData1);
                let invalidData = {
                    ...facilities[0].dataValues,
                    phone: "abc-999-9999"
                }

                try {
                    await FacilityServices.insert(invalidData);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`phone: Phone '${invalidData.phone}' must match format 999-999-9999`);
                }

            });

            it("should fail with invalid state", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let invalidData = {
                    ...facilities[2].dataValues,
                    state: "XY"
                }

                try {
                    await FacilityServices.insert(invalidData);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`state: State '${invalidData.state}' is not a valid abbreviation`);
                }

            });

            it("should fail with invalid zipCode", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let invalidData = {
                    ...facilities[2].dataValues,
                    zipCode: "99a99"
                }

                try {
                    await FacilityServices.insert(invalidData);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`zipCode: Zip Code '${invalidData.zipCode}' must match format 99999 or 99999-9999`);
                }

            });

            it("should fail with missing active", async () => {

                let facilities = await loadFacilities(facilitiesData1);
                let invalidData = {
                    ...facilities[0].dataValues
                }
                delete invalidData.active;

                try {
                    await FacilityServices.insert(invalidData);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes("active: Is required");
                }

            });

            it("should fail with missing name", async () => {

                let facilities = await loadFacilities(facilitiesData1);
                let invalidData = {
                    ...facilities[1].dataValues
                }
                delete invalidData.name;

                try {
                    await FacilityServices.insert(invalidData);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes("name: Is required");
                }

            });

        });

        context("valid arguments", () => {

            it("should succeed with full data", async () => {

                try {
                    let data = await FacilityServices.insert(facilitiesData0[0]);
                    let result = await FacilityServices.find(data.id);
                    expect(result.name).to.equal(data.name);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it("should succeed with minimum data", async () => {

                let minimum = {
                    active: true,
                    name: "Minimum Name"
                }

                try {
                    let data = await FacilityServices.insert(minimum);
                    let result = await FacilityServices.find(data.id);
                    expect(result.name).to.equal(data.name);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#name()", () => {

        // WARNING:  sqlite3 does not understand ilike operator so we cannot test

    });

    describe("#remove()", () => {

        context("one object", () => {

            it("should fail on invalid id", async () => {

                let invalidFacilityId = 9999;

                try {
                    await FacilityServices.remove(invalidFacilityId);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`facilityId: Missing Facility ${invalidFacilityId}`);
                }

            });

            it("should succeed on valid id", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[2].dataValues;

                try {
                    let result = await FacilityServices.remove(facilityMatch.id);
                    let count = await Facility.count({});
                    expect(count).to.equal(2);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#update()", () => {

        context("invalid arguments", () => {

            // NOTE: individual validation errors got checked in #insert() tests

            it("should fail with duplicate name", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let invalidData = {
                    ...facilities[1].dataValues,
                    name: facilities[2].name
                }

                try {
                    await FacilityServices.update(invalidData.id, invalidData);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`name: Name '${invalidData.name}' is already in use`);
                }

            });

            it("should fail with invalid id", async () => {

                let facilities = await loadFacilities(facilitiesData1);
                let invalidData = {
                    ...facilities[2].dataValues,
                    id: 9999
                }

                try {
                    await FacilityServices.update(invalidData.id, invalidData);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`facilityId: Missing Facility ${invalidData.id}`);
                }

            });

        });

        context("with valid arguments", () => {

            it("should succeed with no changes", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let validData = facilities[2].dataValues;

                try {
                    let result = await FacilityServices.update(validData.id, validData);
                    expect(result.name).to.equal(validData.name);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it("should succeed with unique name", async () => {

                let facilities = await loadFacilities(facilitiesData1);
                let validData = {
                    ...facilities[1].dataValues,
                    name: "Brand New Name"
                }

                try {
                    let result = await FacilityServices.update(validData.id, validData);
                    expect(result.name).to.equal(validData.name);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

})
