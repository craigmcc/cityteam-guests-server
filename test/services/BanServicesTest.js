"use strict";

// Internal Modules ----------------------------------------------------------

const db = require ("../../src/models");
const Ban = db.Ban;
const Facility = db.Facility;
const Guest = db.Guest;
const BanServices = require("../../src/services/BanServices");

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

    // Ban Data --------------------------------------------------------------

    ban1Full: {
        active: true,
        banFrom: "2020-09-01",
        banTo: "2020-09-30",
        comments: "September Ban"
    },
    ban2Full: {
        active: true,
        banFrom: "2020-10-01",
        banTo: "2020-10-31",
        comments: "October Ban"
    },
    ban3Full: {
        active: true,
        banFrom: "2020-11-01",
        banTo: "2020-11-30",
        comments: "November Ban"
    },
    ban4Full: {
        active: true,
        banFrom: "2020-12-01",
        banTo: "2020-12-31",
        comments: "December Ban"
    },

}

// Local Variables -----------------------------------------------------------

let ban1_1_1;
let ban1_1_2;
let ban2_1_1;

let facility1;
let facility2;

let guest1_1;
let guest1_2;
let guest2_1;

// BanServices Tests ---------------------------------------------------------

describe("BanServices Tests", () => {

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

        let ban1_1_1Data = {
            ...dataset.ban1Full,
            guestId: guest1_1.id
        }
        ban1_1_1 = await Ban.create(ban1_1_1Data);

        let ban1_1_2Data = {
            ...dataset.ban2Full,
            guestId: guest1_1.id
        }
        ban1_1_2 = await Ban.create(ban1_1_2Data);

        let guest1_2Data = {
            ...dataset.guest2Full,
            facilityId: facility1.id
        }
        guest1_2 = await Guest.create(guest1_2Data);

        // Facility 2

        facility2 = await Facility.create(dataset.facility2full);

        let guest2_1Data = {
            ...dataset.guest3Full,
            facilityId: facility2.id
        }
        guest2_1 = await Guest.create(guest2_1Data);

        let ban2_1_1Data = {
            ...dataset.ban3Full,
            guestId: guest2_1.id
        }
        ban2_1_1 = await Ban.create(ban2_1_1Data);

    }

    // Test Methods ----------------------------------------------------------

    describe("#all()", () => {

        context("with seed data", () => {

            it("should find all objects", async () => {

                let results = await BanServices.all();
                expect(results.length).to.equal(3);

            });

        });

        context("without seed data", () => {

            it("should find no objects", async () => {

                await Ban.destroy({
                    cascade: true,
                    truncate: true
                });

                let results = await BanServices.all();
                expect(results.length).to.equal(0);

            });

        });

    });

    describe("#find()", () => {

        context("with seed data", () => {

            it("should fail on mismatched id", async () => {

                let id = 9999;
                try {
                    await BanServices.find(id);
                    expect.fail("Should have thrown NotFound");
                } catch (err) {
                    let expected = `id: Missing Ban ${id}`;
                    expect(err.message).includes(expected);
                }

            });

            it("should succeed on matched id", async () => {

                try {
                    let result = await BanServices.find(ban1_1_1.id);
                    expect(result.id).to.equal(ban1_1_1.id);
                    expect(result.banFrom).to.equal(ban1_1_1.banFrom);
                    expect(result.banTo).to.equal(ban1_1_1.banTo);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#findByGuestId()", () => {

        context("with seed data", () => {

            it("should return nothing with invalid guestId", async () => {

                let guestId = 9999;
                let results = await BanServices.findByGuestId(guestId);
                expect(results.length).to.equal(0);

            });

            it("should succeed with valid guestId", async () => {

                let guestId = guest1_1.id;

                let results = await BanServices.findByGuestId(guestId);
                expect(results.length).to.equal(2);
                results.forEach(result => {
                    expect(result.guestId).to.equal(guestId);
                })

            })

        });

    });

    describe("#insert()", () => {

        context("with seed data", () => {

            it("should fail with ban dates out of order", async () => {

                let data = {
                    ...dataset.ban4Full,
                    banFrom: "2020-06-21",
                    banTo: "2020-06-20",
                    guestId: guest1_2.id
                }

                try {
                    await BanServices.insert(data);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message)
                        .includes("banTo must be equal to or greater than banFrom");
                }

            });

            it("should fail with invalid guestId", async () => {

                let invalidGuestId = 9999;
                let data = {
                    ...dataset.ban4Full,
                    guestId: invalidGuestId
                }

                try {
                    await BanServices.insert(data);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message)
                        .includes(`guestId: Missing Guest ${invalidGuestId}`);
                }

            });

            it("should fail with missing active", async () => {

                let data = {
                    ...dataset.ban4Full,
                    active: null
                }

                try {
                    await BanServices.insert(data);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message)
                        .includes("ban.active cannot be null");
                }

            });

            it("should fail with missing banFrom", async () => {

                let data = {
                    ...dataset.ban4Full,
                    banFrom: null
                }

                try {
                    await BanServices.insert(data);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message)
                        .includes("ban.banFrom cannot be null");
                }

            });

            it("should fail with missing banTo", async () => {

                let data = {
                    ...dataset.ban4Full
                }
                delete data.banTo;

                try {
                    await BanServices.insert(data);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message)
                        .includes("ban.banTo cannot be null");
                }

            });

            it("should fail with missing guestId", async () => {

                let data = {
                    ...dataset.ban4Full
                }

                try {
                    await BanServices.insert(data);
                    expect.fail("Should have thrown validation error");
                } catch (err) {
                    expect(err.message)
                        .includes("ban.guestId cannot be null");
                }

            });

            it.skip("should fail with overlapping ban dates", async () => {
                // TODO - #insert() test with overlapping ban dates
            });

            it("should succeed with valid data", async () => {

                let data = {
                    ...dataset.ban4Full,
                    guestId: guest1_1.id
                }

                try {
                    let result = await BanServices.insert(data);
                    expect(result.banFrom).to.equal(data.banFrom);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            })

        });

    });

    describe("#remove()", () => {

        context("with seed data", () => {

            it("should fail on invalid id", async () => {

                let invalidId = 9999;

                try {
                    await BanServices.remove(invalidId);
                    expect.fail("Should have thrown NotFound error");
                } catch (err) {
                    expect(err.message)
                        .includes(`id: Missing Ban ${invalidId}`);
                }

            });

            it("should succeed on valid id", async () => {

                let validId = ban1_1_2.id;

                try {
                    let result = await BanServices.remove(validId);
                    expect(result.id).to.equal(validId);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

    describe("#update()", () => {

        context("with seed data", () => {

            it("should succeed with no changes", async () => {

                let data = ban2_1_1.dataValues;

                try {
                    let result = await BanServices.update(data.id, data);
                    expect(result.id).to.equal(data.id);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

            it("should succeed with valid changes", async () => {

                let data = {
                    ...ban2_1_1.dataValues,
                    active: false,
                    banFrom: "2020-02-10",
                    banTo: "2020-02-15",
                    guestId: guest2_1.id
                };

                try {
                    let result = await BanServices.update(data.id, data);
                    expect(result.id).to.equal(data.id);
                    expect(result.active).to.equal(data.active);
                    expect(result.banFrom).to.equal(data.banFrom);
                    expect(result.banTo).to.equal(data.banTo);
                    expect(result.guestId).to.equal(data.guestId);
                } catch (err) {
                    expect.fail(`Should not have thrown '${err.message}'`);
                }

            });

        });

    });

});

