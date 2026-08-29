import { disclosureModel } from "../../models/disclosureModel.js";
import { dataPointModel } from "../../models/dataPointModel.js";
import { documentModel } from "../../models/documentModel.js";
import { metricModel } from "../../models/metricModel.js";
import { validationResultModel } from "../../models/validationResultModel.js";
import { transaction } from "../../config/db.js";
import { AppError } from "../../middlewares/errorMiddleware.js";

import { validationRules } from "./validationRules.js";


export const validationService = {

    async validateDisclosure(disclosureId) {

        const disclosure =
            await disclosureModel.getDisclosure(disclosureId);

        if (!disclosure) {
            throw new AppError(
                "Disclosure not found",
                404
            );
        }


        const dataPoints =
            await dataPointModel
                .getDataPointsByDisclosure(
                    disclosureId
                );


        const documents =
            await documentModel
                .getDocumentsByDisclosure(
                    disclosureId
                );


        const metrics =
            await metricModel.getMetrics();


        let results = [];


        // --------------------------------
        // 1. COMPLETENESS
        // --------------------------------

        results.push(
            ...validationRules
                .completeness
                .validateDataPoints(
                    dataPoints
                )
        );

        results.push(
            ...validationRules
                .completeness
                .validateDocuments(
                    documents
                )
        );


        // --------------------------------
        // 2. NUMERIC VALIDATION
        // --------------------------------

        results.push(
            ...validationRules
                .numeric
                .validateNonNegative(
                    dataPoints
                )
        );


        // --------------------------------
        // 3. UNIT VALIDATION
        // --------------------------------

        results.push(
            ...validationRules
                .units
                .validateUnits(
                    dataPoints,
                    metrics
                )
        );


        // --------------------------------
        // 4. PERIOD VALIDATION
        // --------------------------------

        results.push(
            ...validationRules
                .period
                .validateReportingPeriod(
                    disclosure,
                    dataPoints
                )
        );


        // --------------------------------
        // 5. EVIDENCE VALIDATION
        // --------------------------------

        results.push(
            ...validationRules
                .evidence
                .validateDocuments(
                    disclosure,
                    documents
                )
        );


        // --------------------------------
        // 6. CALCULATION VALIDATION
        // --------------------------------

        results.push(
            ...validationRules
                .calculations
                .validate(
                    dataPoints,
                    metrics
                )
        );


        // --------------------------------
        // 7. CONSISTENCY VALIDATION
        // --------------------------------

        results.push(
            ...validationRules
                .consistency
                .validate(
                    dataPoints,
                    metrics
                )
        );


        // --------------------------------
        // 8. ANOMALY VALIDATION
        // --------------------------------

        results.push(
            ...validationRules
                .anomaly
                .validate(
                    dataPoints,
                    metrics
                )
        );


        // --------------------------------
        // SUMMARY
        // --------------------------------

        const passed =
            results.filter(
                r => r.severity === "PASS"
            ).length;

        const warnings =
            results.filter(
                r => r.severity === "WARNING"
            ).length;

        const failed =
            results.filter(
                r => r.severity === "FAIL"
            ).length;


        // --------------------------------
        // SAVE RESULTS
        // --------------------------------

        await transaction(async (client) => {

            await validationResultModel
                .deleteResultsByDisclosure(
                    disclosureId,
                    client
                );

            await validationResultModel
                .createResults(
                    disclosureId,
                    results,
                    client
                );
        });


        return {
            valid: failed === 0,

            summary: {
                passed,
                warnings,
                failed
            },

            results
        };
    },


    async getValidationResults(disclosureId) {

        return await validationResultModel
            .getResultsByDisclosure(
                disclosureId
            );
    }

};