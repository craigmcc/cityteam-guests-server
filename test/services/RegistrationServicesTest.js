"use strict";

// Internal Modules ----------------------------------------------------------

const db = require ("../../src/models");
const Ban = db.Ban;
const Facility = db.Facility;
const Guest = db.Guest;
const Registration = db.Registration;
const RegistrationServices = require("../../src/services/RegistrationServices");

// External Modules ----------------------------------------------------------

const chai = require("chai");
const expect = chai.expect;

// Test Data -----------------------------------------------------------------

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

    // Registration Data -----------------------------------------------------

    registrationEmpty: {
        features: "H",
        registrationDate: "2020-07-04"
    },

    registrationOccupied: {
        features: null,
        paymentAmount: 5.00,
        paymentType: "$$",
        registrationDate: "2020-07-04"
    },

}

// Local Variables -----------------------------------------------------------

let facility1;
let facility2;

let guest1_1;
let guest1_2;
let guest2_1;

let registration1_1_0;
let registration1_2_0;
let registration1_2_2; // Different date
let registration1_3_1;
let registration1_4_2;

// RegistrationServices Tests ------------------------------------------------

describe("RegistrationServices Tests", () => {

    // Testing Hooks ---------------------------------------------------------

    before("#init", async () => {
        await Ban.sync({
            force: true
        });
        await Facility.sync({
            force: true
        });
        await Guest.sync({
            force: true
        });
    });

    beforeEach("#erase", async () => {

        await Ban.destroy({
            cascade: true,
            truncate: true
        });
        await Guest.destroy({
            cascade: true,
            truncate: true
        });
        await Facility.destroy({
            cascade: true,
            truncate: true
        });

        await loadSeedData();

    });

    async function loadSeedData() {

        // Facility 1

        facility1 = await Facility.create(dataset.facility1full);

        let guest1_1Data = {
            ...dataset.guest1Full,
            facilityId: facility1.id
        }
        guest1_1 = await Guest.create(guest1_1Data);

        let guest1_2Data = {
            ...dataset.guest2Full,
            facilityId: facility1.id
        }
        guest1_2 = await Guest.create(guest1_2Data);

        let registration1_1_0Data = {
            ...dataset.registrationEmpty,
            facilityId: facility1.id,
            matNumber: 1
        }
        registration1_1_0 = await Registration.create(registration1_1_0Data);

        let registration1_2_0Data = {
            ...dataset.registrationEmpty,
            facilityId: facility1.id,
            matNumber: 2
        }
        registration1_2_0 = await Registration.create(registration1_2_0Data);

        let registration1_2_2Data = {
            ...dataset.registrationOccupied,
            facilityId: facility1.id,
            guestId: guest1_2.id,
            matNumber: 2,
            registrationDate: "2020-07-05"
        }
        registration1_2_2 = await Registration.create(registration1_2_2Data);

        let registration1_3_1Data = {
            ...dataset.registrationOccupied,
            facilityId: facility1.id,
            guestId: guest1_1.id,
            matNumber: 3
        }
        registration1_3_1 = await Registration.create(registration1_3_1Data);

        let registration1_4_2Data = {
            ...dataset.registrationOccupied,
            facilityId: facility1.id,
            guestId: guest1_2.id,
            matNumber: 4
        }
        registration1_4_2 = await Registration.create(registration1_4_2Data);

        // Facility 2

        facility2 = await Facility.create(dataset.facility2full);

        let guest2_1Data = {
            ...dataset.guest3Full,
            facilityId: facility2.id
        }
        guest2_1 = await Guest.create(guest2_1Data);

    }

    // Test Methods ----------------------------------------------------------

    describe("#all()", () => {

        context("with seed data", () => {

            it("should find all objects", async () => {

                let results = await RegistrationServices.all();
                expect(results.length).to.equal(5);

            });

        });

        context("without seed data", async () => {

            it("should find no objects", async () => {

                await Registration.destroy({
                    cascade: true,
                    truncate: true
                });

                let results = await RegistrationServices.all();
                expect(results.length).to.equal(0);

            });

        });

    });

    describe("#deassign()", () => {

        context("with seed data", () => {

            it("should fail with invalid id", async () => {

                let invalidId = 9999;

                try {
                    await RegistrationServices.deassign(invalidId);
                    expect.fail("Should have thrown NotFound error");
                } catch (err) {
                    expect(err.message)
                        .includes(`id: Missing Registration ${invalidId}`);
                }

            });

            it("should fail with unassigned id", async () => {

                let unassignedId = registration1_1_0.id;

                try {
                    await RegistrationServices.deassign(unassignedId);
                    expect.fail("Should have thrown BadRequest error");
                } catch (err) {
                    expect(err.message)
                        .includes(`id: Registration ${unassignedId} is not currently assigned`);
                }

            });

            it("should succeed with assigned id", async () => {

                let data = registration1_2_2.dataValues;

                try {
                    let result = await RegistrationServices.deassign(data.id);
                    expect(result.id).to.equal(data.id);
                    expect(result.guestId).to.be.null;
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#find()", () => {

        context("with seed data", () => {

            it("should fail on mismatched id", async () => {

                let id = 9999;
                try {
                    await RegistrationServices.find(id);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    let expected = `id: Missing Registration ${id}`;
                    expect(err.message).includes(expected);
                }

            });

            it("should succeed on matched id", async () => {

                try {
                    let result = await RegistrationServices.find(registration1_3_1.id);
                    expect(result.id).to.equal(registration1_3_1.id);
                    expect(result.guestId).to.equal(registration1_3_1.guestId);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#findByFacilityIdAndRegistrationDate()", () => {

        context("with unused parameters", () => {

            it("should find nothing with unused facilityId", async () => {

                let facilityId = 9999;
                let registrationDate = "2020-07-04";

                try {
                    let results =
                        await RegistrationServices
                            .findByFacilityIdAndRegistrationDate
                            (facilityId, registrationDate);
                    expect(results.length).to.equal(0);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it("should find nothing with unused registrationDate", async () => {

                let facilityId = facility1.id;
                let registrationDate = "2020-10-31";

                try {
                    let results =
                        await RegistrationServices
                            .findByFacilityIdAndRegistrationDate
                            (facilityId, registrationDate);
                    expect(results.length).to.equal(0);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

        context("with used parameters", () => {

            it("should find data with used parameters", async () => {

                let facilityId = facility1.id;
                let registrationDate = "2020-07-04";

                try {
                    let results =
                        await RegistrationServices
                            .findByFacilityIdAndRegistrationDate
                            (facilityId, registrationDate);
                    expect(results.length).to.equal(4);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#findByGuestId()", () => {

        context("with seed data", () => {

            it("should find data across days", async () => {

                let guestId = guest1_2.id;

                try {
                    let results = await RegistrationServices
                        .findByGuestId(guestId);
                    expect(results.length).to.equal(2);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            })

        });

    });

    describe("#insert()", () => {

        context("with seed data", () => {

            it("should fail with duplicate matNumber/registrationDate", async () => {

                let data = {
                    ...dataset.registrationEmpty,
                    facilityId: facility1.id,
                    matNumber: 1
                }

                try {
                    await RegistrationServices.insert(data);
                    expect.fail("Should have thrown constraint error");
                } catch (err) {
                    expect(err.message).includes(`matNumber: Mat number ` +
                        `${data.matNumber} already in use on registration date ` +
                        `${data.registrationDate} within this facility`);
                }

            });

            it("should fail with invalid facilityId", async () => {

                let invalidFacilityId = 9999;
                let data = {
                    ...dataset.registrationEmpty,
                    facilityId: invalidFacilityId,
                    matNumber: 99
                }

                try {
                    await RegistrationServices.insert(data);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message)
                        .includes(`facilityId: Missing Facility ${invalidFacilityId}`);
                }

            });

            it("should fail with invalid guestId", async () => {

                let invalidGuestId = 9999;
                let data = {
                    ...dataset.registrationOccupied,
                    facilityId: facility1.id,
                    guestId: invalidGuestId,
                    matNumber: 99
                }

                try {
                    await RegistrationServices.insert(data);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message)
                        .includes(`guestId: Missing Guest ${invalidGuestId}`);
                }

            });

            it("should fail with missing facilityId", async () => {

                let data = {
                    ...dataset.registrationEmpty,
                    matNumber: 99
                }

                try {
                    await RegistrationServices.insert(data);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message)
                        .includes(`registration.facilityId cannot be null`);
                }

            });

            it("should fail with missing matNumber", async () => {

                let data = {
                    ...dataset.registrationEmpty,
                    facilityId: facility1.id
                }

                try {
                    await RegistrationServices.insert(data);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message)
                        .includes(`registration.matNumber cannot be null`);
                }

            });

            it("should fail with missing registrationDate", async () => {

                let data = {
                    ...dataset.registrationEmpty,
                    facilityId: facility1.id,
                    matNumber: 99
                }
                delete data.registrationDate;

                try {
                    await RegistrationServices.insert(data);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message)
                        .includes(`registration.registrationDate cannot be null`);
                }

            });

            it("should succeed with valid data", async () => {

                let data = {
                    ...dataset.registrationOccupied,
                    facilityId: facility1.id,
                    guestId: guest1_1.id,
                    matNumber: 99
                }

                try {
                    let result = await RegistrationServices.insert(data);
                    expect(result.matNumber).to.equal(data.matNumber);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#remove()", () => {

        context("with seed data", () => {

            it("should fail on invalid id", async () => {

                let invalidId = 9999;

                try {
                    await RegistrationServices.remove(invalidId);
                    expect.fail("Should have thrown NotFound error");
                } catch (err) {
                    expect(err.message)
                        .includes(`id: Missing Registration ${invalidId}`);
                }

            });

            it("should succeed on valid id", async () => {

                let validId = registration1_2_0.id;

                try {
                    let result = await RegistrationServices.remove(validId);
                    expect(result.id).to.equal(validId);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#update()", () => {

        it("should succeed with no changes", async () => {

            let data = registration1_3_1.dataValues;

            try {
                let result = await RegistrationServices.update(data.id, data);
                expect(result.id).to.equal(data.id);
            } catch (err) {
                expect.fail(`Should not have thrown '${err.message}'`);
            }

        });

        it("should succeed with valid changes", async () => {

            let data = {
                ...registration1_3_1.dataValues,
                comments: "Here is a comment",
                showerTime: "03:15",
                wakeupTime: "03:00"
            };

            try {
                let result = await RegistrationServices.update(data.id, data);
                expect(result.id).to.equal(data.id);
                expect(result.comments).to.equal(data.comments);
                expect(result.facilityId).to.equal(data.facilityId);
                expect(result.guestId).to.equal(data.guestId);
                expect(result.matNumber).to.equal(data.matNumber);
                expect(result.showerTime).to.equal(data.showerTime);
                expect(result.wakeupTime).to.equal(data.wakeupTime);
            } catch (err) {
                expect.fail(`Should not have thrown '${err.message}'`);
            }

        });

    });

});