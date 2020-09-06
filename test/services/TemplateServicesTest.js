"use strict";

// Internal Modules ----------------------------------------------------------

const db = require ("../../src/models");
const Facility = db.Facility;
const Template = db.Template;
const TemplateServices = require("../../src/services/TemplateServices");

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// Test Data -----------------------------------------------------------------

// NOTE: Store each Facility then capture facilityId for subordinate objects
const dataset = {

    // Facility Data ---------------------------------------------------------

    facility1full: {
        active: true,
        address1: 'First Address 1 Controller',
        address2: 'First Address 2',
        city: 'First City',
        name: 'First Facility',
        state: 'OR',
        zipCode: '99999'
    },

    facility2full: {
        active: true,
        address1: 'Second Address 1 Controller',
        address2: 'Second Address 2',
        city: 'Second City',
        name: 'Second Facility',
        state: 'WA',
        zipCode: '88888'
    },

    // Template Data ---------------------------------------------------------

    template1Full: {
        allMats: "1-24",
        comments: null,
        handicapMats: "2,4,6",
        name: "Emergency Fewer Mats",
        socketMats: "6-10,12",
    },

    template2Full: {
        allMats: "1-58",
        comments: null,
        handicapMats: "2,4,6",
        name: "Standard Mats",
        socketMats: "6-10,12",
    },

    template3Full: {
        allMats: "1-12",
        comments: null,
        handicapMats: "2,4,6",
        name: "Extremely Fewer Mats",
        socketMats: "6-10,12",
    },

};

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

                let facility1 = await Facility.create(dataset.facility1full);
                let data1 = [
                    dataset.template1Full,
                    dataset.template2Full,
                    dataset.template3Full
                ];
                data1.forEach(datum => {
                    datum.facilityId = facility1.id;
                })
                await Template.bulkCreate(data1, {
                    validate: true
                });

                let facility2 = await Facility.create(dataset.facility2full);
                let data2 = [
                    dataset.template1Full,
                    dataset.template3Full
                ];
                data2.forEach(datum => {
                    datum.facilityId = facility2.id;
                })
                await Template.bulkCreate(data2, {
                    validate: true
                });

                let results = await TemplateServices.all();
                expect(results.length).to.equal(5);

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

                let id = 9999;
                try {
                    await TemplateServices.find(id);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    let expected = `id: Missing Template ${id}`;
                    expect(err.message).includes(expected);
                }

            });

            it("should succeed on matched id", async () => {

                let facility1 = await Facility.create(dataset.facility1full);
                let data1 = { ...dataset.template1Full, facilityId: facility1.id };
                let template1 = await Template.create(data1);

                let result = await TemplateServices.find(template1.id);
                expect(result.name).to.equal(data1.name);

            });

        });

    });

    describe("#findByFacilityId()", () => {

        context("with two facilities and associated templates", () => {

            it("should find only templates for specified facility", async () => {

                let facility1 = await Facility.create(dataset.facility1full);
                let data1 = [
                    dataset.template1Full,
                    dataset.template2Full,
                    dataset.template3Full
                ];
                data1.forEach(datum => {
                    datum.facilityId = facility1.id;
                })
                await Template.bulkCreate(data1, {
                    validate: true
                });

                let facility2 = await Facility.create(dataset.facility2full);
                let data2 = [
                    dataset.template1Full,
                    dataset.template2Full,
                    dataset.template3Full
                ];
                data2.forEach(datum => {
                    datum.facilityId = facility2.id;
                })
                await Template.bulkCreate(data2, {
                    validate: true
                });

                let count = await Template.count({});
                expect(count).to.equal(6);
                let results = await TemplateServices.findByFacilityId
                    (facility1.id);
                expect(results.length).to.equal(3);

            });

        });

    });

    describe("#findByFacilityIdAndName()", () => {

        context("with two facilities and associated templates", () => {

            // SQLITE3 does not support iLike match condition
            it.skip("should find only matching templates", async () => {

                let facility1 = await Facility.create(dataset.facility1full);
                let data1 = [
                    dataset.template1Full,
                    dataset.template2Full,
                    dataset.template3Full
                ];
                data1.forEach(datum => {
                    datum.facilityId = facility1.id;
                })
                await Template.bulkCreate(data1, {
                    validate: true
                });

                let facility2 = await Facility.create(dataset.facility2full);
                let data2 = [
                    dataset.template1Full,
                    dataset.template2Full,
                    dataset.template3Full
                ];
                data2.forEach(datum => {
                    datum.facilityId = facility2.id;
                })
                await Template.bulkCreate(data2, {
                    validate: true
                });

                let count = await Template.count({});
                expect(count).to.equal(6);
                let results = await TemplateServices.findByFacilityIdAndName
                    (facility1.id, "fewer");
                expect(results.length).to.equal(2);

            });

        });

    });

    describe("#findByFacilityIdAndNameExact()", () => {

        context("with two facilities and associated templates", () => {

            it("should fail with incorrect name", async () => {

                let facility1 = await Facility.create(dataset.facility1full);
                let data1 = [
                    dataset.template1Full,
                    dataset.template2Full,
                    dataset.template3Full
                ];
                data1.forEach(datum => {
                    datum.facilityId = facility1.id;
                })
                await Template.bulkCreate(data1, {
                    validate: true
                });

                let count = await Template.count({});
                expect(count).to.equal(3);
                let incorrectName = "Incorrect Name";
                try {
                    let result = await TemplateServices.findByFacilityIdAndNameExact
                        (facility1.id, incorrectName);
                    expect.fail("Should have thrown not found error");
                } catch (err) {
                    expect(err.message).includes
                        (`name: Missing name '${incorrectName}'`);
                }

            });

            it("should succeed with correct name", async () => {

                let facility1 = await Facility.create(dataset.facility1full);
                let data1 = [
                    dataset.template1Full,
                    dataset.template2Full,
                    dataset.template3Full
                ];
                data1.forEach(datum => {
                    datum.facilityId = facility1.id;
                })
                await Template.bulkCreate(data1, {
                    validate: true
                });

                let facility2 = await Facility.create(dataset.facility2full);
                let data2 = [
                    dataset.template1Full,
                    dataset.template2Full,
                    dataset.template3Full
                ];
                data2.forEach(datum => {
                    datum.facilityId = facility2.id;
                })
                await Template.bulkCreate(data2, {
                    validate: true
                });

                let count = await Template.count({});
                expect(count).to.equal(6);
                try {
                    let result = await TemplateServices.findByFacilityIdAndNameExact
                    (facility1.id, dataset.template2Full.name);
                    expect(result.facilityId).to.equal(facility1.id);
                    expect(result.name).to.equal(dataset.template2Full.name);
                } catch (err) {
                    expect.fail(`Should not have thrown ${err.message}'`);
                }

            });

        });

    });

    describe("#insert()", () => {

        context("with duplicate name", () => {

            it("should fail in same facility", async () => {

                let facility1 = await Facility.create(dataset.facility1full);
                let data1 = [
                    dataset.template1Full,
                    dataset.template2Full,
                    dataset.template3Full
                ];
                data1.forEach(datum => {
                    datum.facilityId = facility1.id;
                })
                await Template.bulkCreate(data1, {
                    validate: true
                });

                let templateNew = {
                    ...dataset.template2Full,
                    facilityId: facility1.id
                };
                try {
                    await TemplateServices.insert(templateNew);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message).includes(`name: Name '${templateNew.name}' ` +
                        "is already in use within this facility")
                }

            });

            it("should succeed in different facility", async () => {

                let facility1 = await Facility.create(dataset.facility1full);
                let data1 = [
                    dataset.template1Full,
                    dataset.template2Full,
                    dataset.template3Full
                ];
                data1.forEach(datum => {
                    datum.facilityId = facility1.id;
                })
                await Template.bulkCreate(data1, {
                    validate: true
                });

                let facility2 = await Facility.create(dataset.facility2full);

                let templateNew = {
                    ...dataset.template2Full,
                    facilityId: facility2.id
                };
                try {
                    let result = await TemplateServices.insert(templateNew);
                    expect(result.name).to.equal(templateNew.name);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

        context("with invalid arguments", () => {

            it("should fail with empty name", async () => {

                let facility2 = await Facility.create(dataset.facility2full);

                let templateNew = {
                    ...dataset.template2Full,
                    facilityId: facility2.id,
                    name: null
                };
                try {
                    let result = await TemplateServices.insert(templateNew);
                    expect.fail("Should have thrown validation error");
                    expect(result.name).to.equal(templateNew.name);
                } catch (err) {
                    expect(err.message).includes("template.name cannot be null");
                }

            });

            it("should fail with empty allMats", async () => {

                let facility2 = await Facility.create(dataset.facility2full);

                let templateNew = {
                    ...dataset.template2Full,
                    allMats: null,
                    facilityId: facility2.id,
                };
                try {
                    let result = await TemplateServices.insert(templateNew);
                    expect.fail("Should have thrown validation error");
                    expect(result.name).to.equal(templateNew.name);
                } catch (err) {
                    expect(err.message).includes("template.allMats cannot be null");
                }

            });

            it("should fail with empty facilityId", async () => {

                let templateNew = {
                    ...dataset.template2Full,
                    facilityId: null,
                };
                try {
                    let result = await TemplateServices.insert(templateNew);
                    expect.fail("Should have thrown validation error");
                    expect(result.name).to.equal(templateNew.name);
                } catch (err) {
                    expect(err.message).includes("template.facilityId cannot be null");
                }

            });

            it("should fail with invalid allMats", async () => {

                let facility2 = await Facility.create(dataset.facility2full);

                let templateNew = {
                    ...dataset.template2Full,
                    allMats: "3,2",
                    facilityId: facility2.id,
                };
                try {
                    let result = await TemplateServices.insert(templateNew);
                    expect.fail("Should have thrown validation error");
                    expect(result.name).to.equal(templateNew.name);
                } catch (err) {
                    expect(err.message).includes("is out of ascending order");
                }

            });

            it("should fail with invalid facilityId", async () => {

                let templateNew = {
                    ...dataset.template2Full,
                    facilityId: 9999,
                };
                try {
                    let result = await TemplateServices.insert(templateNew);
                    expect.fail("Should have thrown validation error");
                    expect(result.name).to.equal(templateNew.name);
                } catch (err) {
                    expect(err.message).includes(`facilityId: Missing Facility ${templateNew.facilityId}`);
                }

            });

            it("should fail with invalid handicapMats subset", async () => {

                let facility2 = await Facility.create(dataset.facility2full);

                let templateNew = {
                    ...dataset.template2Full,
                    facilityId: facility2.id,
                    handicapMats: "99,101",
                };
                try {
                    let result = await TemplateServices.insert(templateNew);
                    expect.fail("Should have thrown validation error");
                    expect(result.name).to.equal(templateNew.name);
                } catch (err) {
                    expect(err.message).includes("is not a subset");
                }

            });

            it("should fail with invalid handicapMats syntax", async () => {

                let facility2 = await Facility.create(dataset.facility2full);

                let templateNew = {
                    ...dataset.template2Full,
                    facilityId: facility2.id,
                    handicapMats: "3,2",
                };
                try {
                    let result = await TemplateServices.insert(templateNew);
                    expect.fail("Should have thrown validation error");
                    expect(result.name).to.equal(templateNew.name);
                } catch (err) {
                    expect(err.message).includes("is out of ascending order");
                }

            });

            it("should fail with invalid socketMats subset", async () => {

                let facility2 = await Facility.create(dataset.facility2full);

                let templateNew = {
                    ...dataset.template2Full,
                    facilityId: facility2.id,
                    socketMats: "99,101",
                };
                try {
                    let result = await TemplateServices.insert(templateNew);
                    expect.fail("Should have thrown validation error");
                    expect(result.name).to.equal(templateNew.name);
                } catch (err) {
                    expect(err.message).includes("is not a subset");
                }

            });

            it("should fail with invalid socketMats syntax", async () => {

                let facility2 = await Facility.create(dataset.facility2full);

                let templateNew = {
                    ...dataset.template2Full,
                    facilityId: facility2.id,
                    socketMats: "3,2",
                };
                try {
                    let result = await TemplateServices.insert(templateNew);
                    expect.fail("Should have thrown validation error");
                    expect(result.name).to.equal(templateNew.name);
                } catch (err) {
                    expect(err.message).includes("is out of ascending order");
                }

            });

        });

        context("with valid arguments", () => {

            it("should succeed", async () => {

                let facility2 = await Facility.create(dataset.facility2full);
                let templateNew = {
                    ...dataset.template2Full,
                    facilityId: facility2.id
                };
                try {
                    let result = await TemplateServices.insert(templateNew);
                    expect(result.name).to.equal(templateNew.name);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#remove()", () => {

        context("one object", () => {

            it("should fail on mismatched id", async () => {

                let id = 9999;
                try {
                    await TemplateServices.remove(id);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    expect(err.message).includes(`id: Missing Template ${id}`);
                }

            });

            it("should succeed on matched id", async () => {

                let facility2 = await Facility.create(dataset.facility2full);
                let templateNew = {
                    ...dataset.template2Full,
                    facilityId: facility2.id
                };
                let template2 = await Template.create(templateNew);
                let count = await Template.count({});
                expect(count).to.equal(1);

                let result = await TemplateServices.remove(template2.id);
                expect(result.name).to.equal(templateNew.name);
                count = await Template.count({});
                expect(count).to.equal(0);

            });

        });

    });

    describe("#update()", () => {

        context("with invalid arguments", () => {

            // NOTE: individual validation errors got checked in #insert tests

            it("should fail with duplicate name", async () => {

                let facility = await Facility.create(dataset.facility1full);
                let data1 = {
                    ...dataset.template1Full,
                    facilityId: facility.id
                }
                let template1 = await Template.create(data1);
                let data2 = {
                    ...dataset.template2Full,
                    facilityId: facility.id
                }
                let template2 = await Template.create(data2);

                let data3 = {
                    ...dataset.template1Full,
                    facilityId: facility.id,
                    name: data2.name
                }
                try {
                    await TemplateServices.update(template1.id, data3);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message)
                        .includes(`name: Name '${data2.name}' ` +
                                  "is already in use within this facility");
                }

            });

            it("should fail with invalid id", async () => {

                let facility = await Facility.create(dataset.facility1full);
                let data = {
                    ...dataset.template1Full,
                    facilityId: facility.id
                }
                let template = await Template.create(data);

                data = {
                    ...dataset.template1Full,
                    facilityId: facility.id
                }
                let invalidId = 9999;
                try {
                    await TemplateServices.update(invalidId, data);
                    expect.fail("Should have thrown not found error");
                } catch (err) {
                    expect(err.message)
                        .includes(`id: Missing Template ${invalidId}`);
                }

            });

        });

        context("with valid arguments", () => {

            it("should succeed with no changes", async () => {

                let facility = await Facility.create(dataset.facility1full);
                let data = {
                    ...dataset.template1Full,
                    facilityId: facility.id
                }
                let template = await Template.create(data);

                data = {
                    ...dataset.template1Full,
                    facilityId: facility.id
                }
                try {
                    let result = await TemplateServices.update
                    (template.id, data);
                    expect(result.name).to.equal(data.name);
                } catch (err) {
                    expect.fail(`Should not have thrown ${err.message}`);
                }

            });

            it("should succeed with unique name", async () => {

                let facility = await Facility.create(dataset.facility1full);
                let data = {
                    ...dataset.template1Full,
                    facilityId: facility.id
                }
                let template = await Template.create(data);

                data = {
                    ...dataset.template1Full,
                    facilityId: facility.id,
                    name: dataset.template1Full.name + " Updated"
                }
                try {
                    let result = await TemplateServices.update
                    (template.id, data);
                    expect(result.name).to.equal(data.name);
                } catch (err) {
                    expect.fail(`Should not have thrown ${err.message}`);
                }

            });

        });

    });

});
