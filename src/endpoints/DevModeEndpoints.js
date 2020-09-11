"use strict"

// Internal Modules ----------------------------------------------------------

const DevModeServices = require("../services/DevModeServices");
const FacilityServices = require("../services/FacilityServices");

// External Modules ----------------------------------------------------------

const csv = require("csvtojson");
const router = require("express").Router();

// DevMode Endpoints ---------------------------------------------------------

module.exports = (app) => {

    // POST /import - Import raw CSV content from a shelter log file
    // (NOTE: Input content type must "text/csv" and body-parser told about it)
    router.post("/import", async (req, res) => {

        try {

            // TODO - may need to parameterize for non-Portland imports
            let facility = await acquireFacility();

            let previousRegistrationDate = "12/31/19";
            let ignoring = false;
            let skipping = false;
            let results = {
                problems: [ ],
                registrations: [ ]
            };

            // TEMP: Deal with content as a string (should be a stream)
            csv({
                noheader: false,
                headers: [
                    "registrationDate",
                    "matNumber",
                    "firstName",
                    "lastName",
                    "paymentType",
                    "bac",
                    "comments",
                    "exclude",
                    "fm30days"
                ]
            })
                .fromString(req.body)
                .subscribe(async (imported, index) => {
                    try {

                        // Ignore cruft at the end of the CSV file
                        ignoring = !imported.registrationDate ||
                            (imported.registrationDate.length === 0);

                        // Turn off skipping when registrationDate changes
                        if (skipping && (imported.registrationDate !== previousRegistrationDate)) {
                            skipping = false;
                        }

                        // Turn on skipping when we see the end-of-data marker
                        if (imported.firstName.startsWith("*****") ||
                            imported.lastName.startsWith("*****")) {
                            skipping = true;
                        }

                        // Ignore or process or skip this line
                        if (ignoring) {
                            console.log("Ignoring:   " + JSON.stringify(imported));
                        }
                        if (!skipping && !ignoring) {
                            console.log("Processing: " + JSON.stringify(imported));
                            let result =
                                await DevModeServices.imported(facility, imported);
                            if (result.registration) {
                                console.log("Returning:  " + JSON.stringify(result));
                                results.registrations.push(result.registration);
                            }
                            if (result.problems && result.problems.length > 0) {
                                for (let problem of result.problems) {
                                    results.problems.push(problem);
                                }
                            }
                        } else {
                            console.log("Skipping:   " + JSON.stringify(imported))
                        }

                        // Update previous date so we can reset skipping
                        previousRegistrationDate = imported.registrationDate;

                    } catch (err) {

                        console.log("Reporting: ", err);
                        if (err.problem) {
                            results.problems.push({
                                message: "Thrown error: " + err,
                                imported: imported,
                                resolution: "Cannot do anything"
                            });
                        }

                    }
                })
                .on("done", (error) => {
                    console.log("Done");
                    res.status(200).send(results);
                }

            )

        } catch (err) {
            console.error("DevModeEndpoints.import error: " +
                JSON.stringify(err, null, 2));
            res.status(500).send(err.message);
        }

    })

    // POST /reload - Resynchronize database metadata and reload seed data
    router.post("/reload", async (req, res) => {
        try {
            res.send(await DevModeServices.reload());
        } catch (err) {
            console.error("DevModeEndpoints.reload error: " +
                JSON.stringify(err, null, 2));
            res.status(500).send(err.message);
        }
    })

    // Export Routes ---------------------------------------------------------

    app.use("/api/devmode", router);

}

// Private Methods -----------------------------------------------------------

// Look up "Portland" (or create it if necessary) and return it
let acquireFacility = async () => {

    let facility = {};
    try {
        facility = await FacilityServices.findByNameExact("Portland");
    } catch (err) {
        facility = await FacilityServices.insert({
            active: true,
            address1: "526 SE Grand Ave.",
            city: "Portland",
            email: "portland@cityteam.org",
            name: "Portland",
            phone: "503-231-9334",
            state: "OR",
            zipCode: "97214"
        });
    }
    return facility;

}
