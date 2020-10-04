"use strict";

// Internal Modules ----------------------------------------------------------

const db = require ("../../src/models");
const Facility = db.Facility;
const Guest = db.Guest;
const GuestServices = require("../../src/services/GuestServices");

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

    // Guest Data ---------------------------------------------------------

    guest1Full: {
        firstName: "Fred",
        lastName: "Flintstone"
    },
    
    guest2Full: {
        firstName: "Barney",
        lastName: "Rubble"
    },
    
    guest3Full: {
        firstName: "Bam Bam",
        lastName: "Rubble"
    },

};

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

                let facility1 = await Facility.create(dataset.facility1full);
                let data1 = [
                    dataset.guest1Full,
                    dataset.guest2Full,
                    dataset.guest3Full
                ];
                data1.forEach(datum => {
                    datum.facilityId = facility1.id;
                })
                await Guest.bulkCreate(data1, {
                    validate: true
                });

                let facility2 = await Facility.create(dataset.facility2full);
                let data2 = [
                    dataset.guest1Full,
                    dataset.guest3Full
                ];
                data2.forEach(datum => {
                    datum.facilityId = facility2.id;
                })
                await Guest.bulkCreate(data2, {
                    validate: true
                });

                let results = await GuestServices.all();
                expect(results.length).to.equal(5);

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

            it("should fail on mismatched id", async () => {

                let id = 9999;
                try {
                    await GuestServices.find(id);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    let expected = `id: Missing Guest ${id}`;
                    expect(err.message).includes(expected);
                }

            });

            it("should succeed on matched id", async () => {

                let facility1 = await Facility.create(dataset.facility1full);
                let data1 = { ...dataset.guest1Full, facilityId: facility1.id };
                let guest1 = await Guest.create(data1);

                let result = await GuestServices.find(guest1.id);
                expect(result.firstName).to.equal(data1.firstName);
                expect(result.lastName).to.equal(data1.lastName);

            });

        });

    });

/*
    describe("#findByFacilityId()", () => {

        context("with two facilities and associated guests", () => {

            it("should find only guests for specified facility", async () => {

                let facility1 = await Facility.create(dataset.facility1full);
                let data1 = [
                    dataset.guest1Full,
                    dataset.guest2Full,
                    dataset.guest3Full
                ];
                data1.forEach(datum => {
                    datum.facilityId = facility1.id;
                })
                await Guest.bulkCreate(data1, {
                    validate: true
                });

                let facility2 = await Facility.create(dataset.facility2full);
                let data2 = [
                    dataset.guest1Full,
                    dataset.guest2Full,
                    dataset.guest3Full
                ];
                data2.forEach(datum => {
                    datum.facilityId = facility2.id;
                })
                await Guest.bulkCreate(data2, {
                    validate: true
                });

                let count = await Guest.count({});
                expect(count).to.equal(6);
                let results = await GuestServices.findByFacilityId
                    (facility1.id);
                expect(results.length).to.equal(3);

            });

        });

    });
*/

/*
    describe("#findByFacilityIdAndName()", () => {

        context("with two facilities and associated guests", () => {

            // SQLITE3 does not support iLike match condition
            it.skip("should find only matching guests", async () => {

                let facility1 = await Facility.create(dataset.facility1full);
                let data1 = [
                    dataset.guest1Full,
                    dataset.guest2Full,
                    dataset.guest3Full
                ];
                data1.forEach(datum => {
                    datum.facilityId = facility1.id;
                })
                await Guest.bulkCreate(data1, {
                    validate: true
                });

                let facility2 = await Facility.create(dataset.facility2full);
                let data2 = [
                    dataset.guest1Full,
                    dataset.guest2Full,
                    dataset.guest3Full
                ];
                data2.forEach(datum => {
                    datum.facilityId = facility2.id;
                })
                await Guest.bulkCreate(data2, {
                    validate: true
                });

                let count = await Guest.count({});
                expect(count).to.equal(6);
                let results = await GuestServices.findByFacilityIdAndName
                    (facility1.id, "rub");
                expect(results.length).to.equal(2);

            });

        });

    });
*/

/*
    describe("#findByFacilityIdAndNameExact()", () => {

        context("with two facilities and associated guests", () => {

            it("should fail with incorrect name", async () => {

                let facility1 = await Facility.create(dataset.facility1full);
                let data1 = [
                    dataset.guest1Full,
                    dataset.guest2Full,
                    dataset.guest3Full
                ];
                data1.forEach(datum => {
                    datum.facilityId = facility1.id;
                })
                await Guest.bulkCreate(data1, {
                    validate: true
                });

                let count = await Guest.count({});
                expect(count).to.equal(3);
                let incorrectFirstName = "Incorrect First Name";
                let incorrectLastName = "Incorrect Last Name";
                try {
                    await GuestServices.findByFacilityIdAndNameExact
                        (facility1.id, incorrectFirstName, incorrectLastName);
                    expect.fail("Should have thrown not found error");
                } catch (err) {
                    expect(err.message).includes
                    (`name: Missing name '${incorrectFirstName} ${incorrectLastName}'`);
                }

            });

            it("should succeed with correct name", async () => {

                let facility1 = await Facility.create(dataset.facility1full);
                let data1 = [
                    dataset.guest1Full,
                    dataset.guest2Full,
                    dataset.guest3Full
                ];
                data1.forEach(datum => {
                    datum.facilityId = facility1.id;
                })
                await Guest.bulkCreate(data1, {
                    validate: true
                });

                let facility2 = await Facility.create(dataset.facility2full);
                let data2 = [
                    dataset.guest1Full,
                    dataset.guest2Full,
                    dataset.guest3Full
                ];
                data2.forEach(datum => {
                    datum.facilityId = facility2.id;
                })
                await Guest.bulkCreate(data2, {
                    validate: true
                });

                let count = await Guest.count({});
                expect(count).to.equal(6);
                try {
                    let result = await GuestServices.findByFacilityIdAndNameExact
                        (facility1.id, dataset.guest2Full.firstName,
                            dataset.guest2Full.lastName);
                    expect(result.facilityId).to.equal(facility1.id);
                    expect(result.firstName).to.equal(dataset.guest2Full.firstName);
                    expect(result.lastName).to.equal(dataset.guest2Full.lastName);
                } catch (err) {
                    expect.fail(`Should not have thrown ${err.message}'`);
                }

            });

        });

    });
*/

    describe("#insert()", () => {

        context("with duplicate name", () => {

            it("should fail in same facility", async () => {

                let facility1 = await Facility.create(dataset.facility1full);
                let data1 = [
                    dataset.guest1Full,
                    dataset.guest2Full,
                    dataset.guest3Full
                ];
                data1.forEach(datum => {
                    datum.facilityId = facility1.id;
                })
                await Guest.bulkCreate(data1, {
                    validate: true
                });

                let guestNew = {
                    ...dataset.guest2Full,
                    facilityId: facility1.id
                };
                try {
                    await GuestServices.insert(guestNew);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message).includes(`name: Name '${guestNew.firstName} ${guestNew.lastName}' ` +
                        "is already in use within this facility")
                }

            });

            it("should succeed in different facility", async () => {

                let facility1 = await Facility.create(dataset.facility1full);
                let data1 = [
                    dataset.guest1Full,
                    dataset.guest2Full,
                    dataset.guest3Full
                ];
                data1.forEach(datum => {
                    datum.facilityId = facility1.id;
                })
                await Guest.bulkCreate(data1, {
                    validate: true
                });

                let facility2 = await Facility.create(dataset.facility2full);

                let guestNew = {
                    ...dataset.guest2Full,
                    facilityId: facility2.id
                };
                try {
                    let result = await GuestServices.insert(guestNew);
                    expect(result.firstName).to.equal(guestNew.firstName);
                    expect(result.lastName).to.equal(guestNew.lastName);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

        context("with invalid arguments", () => {

            it("should fail with empty firstName", async () => {

                let facility2 = await Facility.create(dataset.facility2full);

                let guestNew = {
                    ...dataset.guest2Full,
                    facilityId: facility2.id,
                    firstName: null
                };
                try {
                    await GuestServices.insert(guestNew);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message).includes("guest.firstName cannot be null");
                }

            });

            it("should fail with empty lastName", async () => {

                let facility2 = await Facility.create(dataset.facility2full);

                let guestNew = {
                    ...dataset.guest2Full,
                    facilityId: facility2.id,
                    lastName: null
                };
                try {
                    await GuestServices.insert(guestNew);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message).includes("guest.lastName cannot be null");
                }

            });

            it("should fail with empty facilityId", async () => {

                let guestNew = {
                    ...dataset.guest2Full,
                    facilityId: null,
                };
                try {
                    await GuestServices.insert(guestNew);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message).includes("guest.facilityId cannot be null");
                }

            });

            it("should fail with invalid facilityId", async () => {

                let guestNew = {
                    ...dataset.guest2Full,
                    facilityId: 9999,
                };
                try {
                    await GuestServices.insert(guestNew);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message).includes(`facilityId: Missing Facility ${guestNew.facilityId}`);
                }

            });

        });

        context("with valid arguments", () => {

            it("should succeed", async () => {

                let facility2 = await Facility.create(dataset.facility2full);
                let guestNew = {
                    ...dataset.guest2Full,
                    facilityId: facility2.id
                };
                try {
                    let result = await GuestServices.insert(guestNew);
                    expect(result.firstName).to.equal(guestNew.firstName);
                    expect(result.lastName).to.equal(guestNew.lastName);
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
                    await GuestServices.remove(id);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    expect(err.message).includes(`id: Missing Guest ${id}`);
                }

            });

            it("should succeed on matched id", async () => {

                let facility2 = await Facility.create(dataset.facility2full);
                let guestNew = {
                    ...dataset.guest2Full,
                    facilityId: facility2.id
                };
                let guest2 = await Guest.create(guestNew);
                let count = await Guest.count({});
                expect(count).to.equal(1);

                let result = await GuestServices.remove(guest2.id);
                expect(result.firstName).to.equal(guestNew.firstName);
                expect(result.lastName).to.equal(guestNew.lastName);
                count = await Guest.count({});
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
                    ...dataset.guest1Full,
                    facilityId: facility.id
                }
                let guest1 = await Guest.create(data1);
                let data2 = {
                    ...dataset.guest2Full,
                    facilityId: facility.id
                }
                await Guest.create(data2);

                let data3 = {
                    ...dataset.guest1Full,
                    facilityId: facility.id,
                    firstName: data2.firstName,
                    lastName: data2.lastName
                }
                try {
                    await GuestServices.update(guest1.id, data3);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message)
                        .includes(`name: Name '${data2.firstName} ${data2.lastName}' ` +
                            "is already in use within this facility");
                }

            });

            it("should fail with invalid id", async () => {

                let facility = await Facility.create(dataset.facility1full);
                let data = {
                    ...dataset.guest1Full,
                    facilityId: facility.id
                }
                await Guest.create(data);

                data = {
                    ...dataset.guest1Full,
                    facilityId: facility.id
                }
                let invalidId = 9999;
                try {
                    await GuestServices.update(invalidId, data);
                    expect.fail("Should have thrown not found error");
                } catch (err) {
                    expect(err.message)
                        .includes(`id: Missing Guest ${invalidId}`);
                }

            });

        });

        context("with valid arguments", () => {

            it("should succeed with no changes", async () => {

                let facility = await Facility.create(dataset.facility1full);
                let data = {
                    ...dataset.guest1Full,
                    facilityId: facility.id
                }
                let guest = await Guest.create(data);

                data = {
                    ...dataset.guest1Full,
                    facilityId: facility.id
                }
                try {
                    let result = await GuestServices.update
                    (guest.id, data);
                    expect(result.name).to.equal(data.name);
                } catch (err) {
                    expect.fail(`Should not have thrown ${err.message}`);
                }

            });

            it("should succeed with unique name", async () => {

                let facility = await Facility.create(dataset.facility1full);
                let data = {
                    ...dataset.guest1Full,
                    facilityId: facility.id
                }
                let guest = await Guest.create(data);

                data = {
                    ...dataset.guest1Full,
                    facilityId: facility.id,
                    firstName: dataset.guest1Full.firstName + " Updated"
                }
                try {
                    let result = await GuestServices.update
                       (guest.id, data);
                    expect(result.name).to.equal(data.name);
                } catch (err) {
                    expect.fail(`Should not have thrown ${err.message}`);
                }

            });

        });

    });

});
