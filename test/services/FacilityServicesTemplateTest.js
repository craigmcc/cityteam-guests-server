"use strict"

// Internal Modules ----------------------------------------------------------

const db = require("../../src/models");
const Facility = db.Facility;
const FacilityServices = require("../../src/services/FacilityServices");

const NotFound = require("../../src/errors/NotFound");

const {
    facilitiesData0, loadFacilities,
    templatesData0, loadTemplates,
} = require("../util/SeedData");

const {
    templateKey
} = require("../util/SortKeys");

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// FacilityServices Template Tests -------------------------------------------

describe("FacilityServices Template Tests", () => {

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

    describe("#templateAll", () => {

        context("all objects", () => {

            it("should fail with invalid facilityId", async () => {

                let invalidFacilityId = 9999;

                try {
                    await FacilityServices.templateAll(invalidFacilityId);
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
                await loadTemplates(facilityMatch, templatesData0);

                try {
                    let results = await FacilityServices.templateAll(facilityMatch.id);
                    expect(results.length).to.equal(3);
                    let previousKey;
                    results.forEach(result => {
                        let currentKey = templateKey(result);
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
                    let results = await FacilityServices.templateAll(facilityMatch.id);
                    expect(results.length).to.equal(0);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            })

            it("should succeed with paginated nested objects", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[2].dataValues;
                await loadTemplates(facilityMatch, templatesData0);

                try {
                    let results = await FacilityServices.templateAll(facilityMatch.id, {
                        offset: 1
                    });
                    expect(results.length).to.equal(2);
                    let previousKey;
                    results.forEach(result => {
                        let currentKey = templateKey(result);
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

    describe("#templateExact", () => {

        context("all objects", () => {

            it("should fail with invalid name", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[2].dataValues;
                await loadTemplates(facilityMatch, templatesData0);
                let invalidName = "Invalid Name";

                try {
                    let result = await FacilityServices.templateExact
                        (facilityMatch.id, invalidName);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFound for '${err.message}'`);
                    }
                    expect(err.message)
                        .includes(`name: Missing Template '${invalidName}'`);
                }

            });

            it("should succeed with valid name", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[2].dataValues;
                let templates = await loadTemplates(facilityMatch, templatesData0);
                let templateMatch = templates[1].dataValues;

                try {
                    let result = await FacilityServices.templateExact
                        (facilityMatch.id, templateMatch.name);
                    expect(result.name).to.equal(templateMatch.name);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#templateName", () => {

        // WARNING:  sqlite3 does not understand ilike operator so we cannot test

    });

});
