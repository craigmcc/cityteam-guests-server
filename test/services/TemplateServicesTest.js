"use strict";

// Internal Modules ----------------------------------------------------------

const db = require ("../../src/models");
const Facility = db.Facility;
const Template = db.Template;
const TemplateServices = require("../../src/services/TemplateServices");

const BadRequest = require("../../src/errors/BadRequest");
const NotFound = require("../../src/errors/NotFound");

const {
    facilitiesData0, facilitiesData1, loadFacilities,
    templatesData0, templatesData1, loadTemplates,
} = require("../util/SeedData");

const {
    templateKey,
} = require("../util/SortKeys");

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// TemplateServices Tests ----------------------------------------------------

describe("TemplateServices Tests", () => {

    // Testing Hooks ---------------------------------------------------------

    before("#init", async () => {
        await Facility.sync({
            force: true
        });
        await Template.sync({
            force: true
        });
    });

    beforeEach("#erase", async () => {
        await Template.destroy({
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
                let facilityMatch = facilities[1].dataValues;
                await loadTemplates(facilityMatch, templatesData0);

                try {
                    let results = await TemplateServices.all();
                    expect(results.length).to.equal(3);
                    let previousKey;
                    results.forEach(result => {
                        let currentKey = templateKey(result);
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
                let facilityMatch = facilities[1].dataValues;
                await loadTemplates(facilityMatch, templatesData0);

                try {
                    let results = await TemplateServices.all({
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
                await loadTemplates(facilityMatch, templatesData1);

                try {
                    let results = await TemplateServices.all({
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

                let results = await TemplateServices.all();
                expect(results.length).to.equal(0);

            });

        });

    });

    describe("#find()", () => {

        context("one object", () => {

            it("should fail on mismatched id", async () => {

                let templateId = 9999;

                try {
                    await TemplateServices.find(templateId);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    let expected = `templateId: Missing Template ${templateId}`;
                    expect(err.message).includes(expected);
                }

            });

            it("should succeed on matched id", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[0].dataValues;
                let templates = await loadTemplates(facilityMatch, templatesData0);
                let templateMatch = templates[2].dataValues;

                try {
                    let result = await TemplateServices.find(templateMatch.id);
                    expect(result.id).to.equal(templateMatch.id);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#insert()", () => {

        context("invalid arguments", () => {

            it("should fail with duplicate name in same facility", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[2].dataValues;
                let templates = await loadTemplates(facilityMatch, templatesData0);
                let invalidData = {
                    ...templates[0].dataValues,
                    name: templates[1].name
                }
                delete invalidData.id;

                try {
                    await TemplateServices.insert(invalidData);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`name: Name '${invalidData.name}' is already in use`);
                }

            });

            it("should fail with invalid allMats", async () => {

                let facilities = await loadFacilities(facilitiesData1);
                let facilityMatch = facilities[0];
                let invalidData = {
                    ...templatesData0[0],
                    allMats: "3,2",
                    facilityId: facilityMatch.id,
                }

                try {
                    await TemplateServices.insert(invalidData);
                    expect.fail(`Should have thrown BadRequest`);
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`is out of ascending order`);
                }

            });

            it("should fail with invalid facilityId", async () => {

                let invalidData = {
                    ...templatesData0[1],
                    facilityId: 9999,
                }

                try {
                    await TemplateServices.insert(invalidData);
                    expect.fail(`Should have thrown BadRequest`);
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`facilityId: Missing Facility ${invalidData.facilityId}`);
                }

            });

            it("should fail with invalid handicapMats", async () => {

                let facilities = await loadFacilities(facilitiesData1);
                let facilityMatch = facilities[0];
                let invalidData = {
                    ...templatesData0[0],
                    facilityId: facilityMatch.id,
                    handicapMats: "3-99",
                }

                try {
                    await TemplateServices.insert(invalidData);
                    expect.fail(`Should have thrown BadRequest`);
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`handicapMats: is not a subset of all mats`);
                }

            });

            it("should fail with invalid socketMats", async () => {

                let facilities = await loadFacilities(facilitiesData1);
                let facilityMatch = facilities[0];
                let invalidData = {
                    ...templatesData0[0],
                    facilityId: facilityMatch.id,
                    socketMats: "1,a,3",
                }

                try {
                    await TemplateServices.insert(invalidData);
                    expect.fail(`Should have thrown BadRequest`);
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`is not a number`);
                }

            });

            it("should fail with missing allMats", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[2].dataValues;
                let invalidData = {
                    ...templatesData0[1],
                    facilityId: facilityMatch.id,
                }
                delete invalidData.allMats;

                try {
                    await TemplateServices.insert(invalidData);
                    expect.fail(`Should have thrown BadRequest`);
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`allMats: Is required`);
                }

            });

            it("should fail with missing facilityId", async () => {

                let invalidData = {
                    ...templatesData0[1],
                }
                delete invalidData.facilityId;

                try {
                    await TemplateServices.insert(invalidData);
                    expect.fail(`Should have thrown BadRequest`);
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`facilityId: Is required`);
                }

            });

            it("should fail with missing name", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[2].dataValues;
                let invalidData = {
                    ...templatesData0[1],
                    facilityId: facilityMatch.id,
                }
                delete invalidData.name;

                try {
                    await TemplateServices.insert(invalidData);
                    expect.fail(`Should have thrown BadRequest`);
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`name: Is required`);
                }

            });

        });

        context("valid arguments", () => {

            it("should succeed with duplicate name in different facility", async () => {

                let facilities0 = await loadFacilities(facilitiesData0);
                let facilityMatch0 = facilities0[0];
                let templates0 = await loadTemplates(facilityMatch0, templatesData0);
                let facilities1 = await loadFacilities(facilitiesData1);
                let facilityMatch1 = facilities1[1];
                let templates1 = await loadTemplates(facilityMatch1, templatesData1);
                let validData = {
                    ...templates0[0].dataValues,
                    name: templates1[1].name
                }

                try {
                    let result = await TemplateServices.insert(validData);
                    expect(result.name).to.equal(validData.name);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it("should succeed with full data", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[2].dataValues;
                let validData = {
                    ...templatesData0[0],
                    facilityId: facilityMatch.id
                }

                try {
                    let result = await TemplateServices.insert(validData);
                    expect(result.name).to.equal(validData.name);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it("should succeed with minimum data", async () => {

                let facilities = await loadFacilities(facilitiesData0);
                let facilityMatch = facilities[2].dataValues;
                let validData = {
                    allMats: "2,4",
                    facilityId: facilityMatch.id,
                    name: "Brand New Template",
                }

                try {
                    let result = await TemplateServices.insert(validData);
                    expect(result.name).to.equal(validData.name);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#remove()", () => {

        context("one object", () => {

            it("should fail on invalid templateId", async () => {

                let invalidTemplateId = 9999;

                try {
                    await TemplateServices.remove(invalidTemplateId);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    expect(err.message).includes(`templateId: Missing Template ${invalidTemplateId}`);
                }

            });

            it("should succeed on valid templateId", async () => {

                let facilities = await loadFacilities(facilitiesData1);
                let facilityMatch = facilities[1].dataValues;
                let templates = await loadTemplates(facilityMatch, templatesData0);
                let templateMatch = templates[1].dataValues;

                try {
                    let result = await TemplateServices.remove(templateMatch.id);
                    expect(result.name).to.equal(templateMatch.name);
                    let results = await TemplateServices.all();
                    expect(results.length).to.equal(2);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#update()", () => {

        context("with invalid arguments", () => {

            // NOTE: individual validation errors got checked in #insert tests

            it("should fail with duplicate name", async () => {

                let facilities = await loadFacilities(facilitiesData1);
                let facilityMatch = facilities[0].dataValues;
                let templates = await loadTemplates(facilityMatch, templatesData1);
                let templateMatch = templates[0].dataValues;
                let templateDuplicate = templates[1].dataValues;
                let invalidData = {
                    ...templateMatch,
                    name: templateDuplicate.name,
                }

                try {
                    await TemplateServices.update(templateMatch.id, invalidData);
                    expect.fail("Should have thrown BadRequest");
                } catch (err) {
                    if (!(err instanceof BadRequest)) {
                        expect.fail(`Should have thrown typeof BadRequest for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`name: Name '${invalidData.name}' ` +
                                  "is already in use within this facility");
                }

            });

            it("should fail with invalid templateId", async () => {

                let facilities = await loadFacilities(facilitiesData1);
                let facilityMatch = facilities[0].dataValues;
                let templates = await loadTemplates(facilityMatch, templatesData1);
                let templateMatch = templates[0].dataValues;
                let invalidId = 9999;
                let invalidData = {
                    ...templateMatch,
                    id: invalidId
                }

                try {
                    await TemplateServices.update(invalidId, invalidData);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    if (!(err instanceof NotFound)) {
                        expect.fail(`Should have thrown typeof NotFond for '${err.message}`);
                    }
                    expect(err.message)
                        .includes(`templateId: Missing Template ${invalidId}`);
                }

            });

        });

        context("with valid arguments", () => {

            it("should succeed with no changes", async () => {

                let facilities = await loadFacilities(facilitiesData1);
                let facilityMatch = facilities[0].dataValues;
                let templates = await loadTemplates(facilityMatch, templatesData1);
                let templateMatch = templates[0].dataValues;

                try {
                    let result = await TemplateServices.update
                        (templateMatch.id, templateMatch);
                    expect(result.name).to.equal(templateMatch.name);
                } catch (err) {
                    expect.fail(`Should not have thrown ${err.message}`);
                }

            });

            it("should succeed with unique name", async () => {

                let facilities = await loadFacilities(facilitiesData1);
                let facilityMatch = facilities[0].dataValues;
                let templates = await loadTemplates(facilityMatch, templatesData1);
                let templateMatch = templates[0].dataValues;
                let validData = {
                    ...templateMatch,
                    name: templateMatch.name + " Updated"
                }

                try {
                    let result = await TemplateServices.update
                        (templateMatch.id, validData);
                    expect(result.name).to.equal(validData.name);
                } catch (err) {
                    expect.fail(`Should not have thrown ${err.message}`);
                }

            });

        });

    });

});
