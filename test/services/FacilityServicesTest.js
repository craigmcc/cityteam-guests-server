"use strict";

// Internal Modules ----------------------------------------------------------

const db = require("../../src/models");
const Facility = db.Facility;
const FacilityServices = require("../../src/services/FacilityServices");

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// Test Data -----------------------------------------------------------------

const dataset = {

    facility1full: {
        active: true,
        address1: 'First Address 1 Facility',
        address2: 'First Address 2',
        city: 'First City',
        name: 'First Facility',
        state: 'OR',
        zipCode: '99999'
    },

    facility1noName: {
        active: true,
        address1: 'First Address 1 Facility',
        address2: 'First Address 2',
        city: 'First City',
        state: 'OR',
        zipCode: '99999'
    },

    facility2full: {
        active: true,
        address1: 'Second Address 1 Facility',
        address2: 'Second Address 2',
        city: 'Second City',
        name: 'Second Facility',
        state: 'WA',
        zipCode: '88888'
    },

    facility3full: {
        active: true,
        name: 'Third Facility',
        address1: 'Third Address 1 Facility',
        address2: 'Third Address 2',
        city: 'Third City',
        state: 'CA',
        zipCode: '77777'
    }

};

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

    describe("#all()", () => {

        context("all objects", () => {

            it("should find all objects", async () => {

                let data = [
                    dataset.facility1full,
                    dataset.facility2full,
                    dataset.facility3full
                ];
                await Facility.bulkCreate(data, {
                    validate: true
                });

                let results = await FacilityServices.all();
                expect(results.length).to.equal(3);

            });

        });

        context("no objects", () => {

            it("should find no objects", async () => {

                let results = await FacilityServices.all();
                expect(results.length).to.equal(0);

            });

        });

    })

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

                let data = await Facility.create(dataset.facility1full);
                let count = await Facility.count({});
                expect(count).to.equal(1);

                let result = await FacilityServices.find(data.id);
                expect(result.name).to.equal(data.name);

            });

        });

    });

    describe("#findByActive()", () => {

        context("all active objects", () => {

            it("should find all the objects", async () => {

                let data = [
                    dataset.facility1full,
                    dataset.facility2full,
                    dataset.facility3full
                ];
                data.forEach(datum => {
                    datum.active = true;
                })
                await Facility.bulkCreate(data, {
                    validate: true
                });

                let results = await FacilityServices.active();
                expect(results.length).to.equal(3);

            });

        });

        context("one inactive object", () => {

            it("should find only active objects", async () => {

                let data = [
                    dataset.facility1full,
                    dataset.facility2full,
                    dataset.facility3full
                ];
                data.forEach(datum => {
                    datum.active = true;
                });
                data[1].active = false;
                await Facility.bulkCreate(data, {
                    validate: true
                });

                let results = await FacilityServices.active();
                expect(results.length).to.equal(2);

            });

        });

    });

    describe("#findByName()", () => {

        context("three objects", () => {

            // SQLITE3 does not support iLike match condition
            it.skip("should find all objects on a wildcard match", async () => {

                let data = [
                    dataset.facility1full,
                    dataset.facility2full,
                    dataset.facility3full
                ];
                await Facility.bulkCreate(data, {
                    validate: true
                });

                let results =
                    await FacilityServices.findByName("Facility");
                expect(results.length).to.equal(3);

            });

        });

    });

    describe("#findByNameExact()", () => {

        context("three objects", () => {

            it("should fail on exact name mismatch", async () => {

                let data = [
                    dataset.facility1full,
                    dataset.facility2full,
                    dataset.facility3full
                ];
                await Facility.bulkCreate(data, {
                    validate: true
                });

                let mismatchedName = "NOT PRESENT";
                try {
                    await FacilityServices.exact(mismatchedName);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    let expected = `name: Missing Facility '${mismatchedName}'`;
                    expect(err.message).includes(expected);
                }

            });

            it("should succeed on exact name match", async () => {

                let data = [
                    dataset.facility1full,
                    dataset.facility2full,
                    dataset.facility3full
                ];
                await Facility.bulkCreate(data, {
                    validate: true
                });

                let matchedName = data[1].name;
                try {
                    let result =
                        await FacilityServices.exact(matchedName);
                    expect(result.name).to.equal(matchedName);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#insert()", () => {

        context("with duplicate name", () => {

            it("should cause validation error", async () => {

                let result = await Facility.create(dataset.facility1full);
                try {
                    await FacilityServices.insert(dataset.facility1full);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message)
                        .includes(`Name '${result.name}' is already in use`);
                }

            });

        });

        context("with empty name", () => {

            it("should cause validation error", async () => {

                try {
                    await FacilityServices.insert(dataset.facility1noName);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message).includes("facility.name cannot be null");
                }

            });

        });

        context("with full arguments", () => {

            it("should add full object", async () => {

                let data = await FacilityServices.insert(dataset.facility1full);
                try {
                    let result = await FacilityServices.find(data.id);
                    expect(result.name).to.equal(data.name);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

        context("with invalid phone", () => {

            it("should cause validation error", async () => {

                let data = {...dataset.facility1full};
                data.name = "New Facility Name";
                data.phone = "abc-999-9999";
                try {
                    await FacilityServices.insert(data);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message)
                        .includes(`phone: Phone '${data.phone}' must match format 999-999-9999`);
                }

            });

        });

        context("with invalid state", () => {

            it("should cause validation error", async () => {

                let data = {...dataset.facility1full};
                data.name = "New Facility Name";
                data.state = "XY";
                try {
                    await FacilityServices.insert(data);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message)
                        .includes(`State '${data.state}' is not a valid abbreviation`);
                }

            });

        });

        context("with invalid zipCode", () => {

            it("should cause validation error", async () => {

                let data = {...dataset.facility1full};
                data.name = "New Facility Name";
                data.zipCode = "99a99";
                try {
                    await FacilityServices.insert(data);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message)
                        .includes(`zipCode: Zip Code '${data.zipCode}' must match format 99999 or 99999-9999`);
                }

            });

        });

        context("with minimum data", () => {

            it("should succeed", async () => {

                let data = {
                    active: true,
                    name: "New Facility Name"
                };
                try {
                    await FacilityServices.insert(data);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#remove()", () => {

        context("one object", () => {

            it("should fail on mismatched id", async () => {

                let facilityId = 9999;
                try {
                    await FacilityServices.remove(facilityId);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    let expected = `facilityId: Missing Facility ${facilityId}`;
                    expect(err.message).includes(expected);
                }

            });

            it("should succeed on matched id", async () => {

                let data = await Facility.create(dataset.facility1full);
                let count = await Facility.count({});
                expect(count).to.equal(1);

                let result = await FacilityServices.remove(data.id);
                expect(result.name).to.equal(data.name);
                count = await Facility.count({});
                expect(count).to.equal(0);

            });

        });

    });

    describe("#update()", () => {

        context("with invalid arguments", () => {

            // NOTE: individual validation errors got checked in #insert() tests

            it("should fail with duplicate name", async () => {

                let data1 = await Facility.create(dataset.facility1full);
                let data2 = await Facility.create(dataset.facility2full);
                let duplicateName = data1.name;
                let newData = {...dataset.facility2full}
                try {
                    newData.name = duplicateName;
                    await FacilityServices.update(data2.id, newData);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message)
                        .includes(`name: Name '${duplicateName}' is already in use`);
                }

            });

            it("should fail with invalid id", async () => {

                let data = await Facility.create(dataset.facility1full);
                let invalidId = 9999;
                try {
                    await FacilityServices.update(invalidId, data);
                    expect.fail("Should have thrown not found error");
                } catch (err) {
                    expect(err.message)
                        .includes(`facilityId: Missing Facility ${invalidId}`);
                }

            });

        });

        context("with valid arguments", () => {

            it("should succeed with no changes", async () => {

                let result0 = await Facility.create(dataset.facility1full);
                let data = {
                    ...dataset.facility1full
                }
                try {
                    let result = await FacilityServices.update(result0.id, data);
                    expect(result.name).to.equal(data.name);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it("should succeed with unique name", async () => {

                let result0 = await Facility.create(dataset.facility1full);
                let data = {
                    ...dataset.facility1full
                }
                try {
                    let uniqueName = "New Unique Name";
                    data.name = uniqueName;
                    let result = await FacilityServices.update(result0.id, data);
                    expect(result.name).to.equal(uniqueName);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

})
