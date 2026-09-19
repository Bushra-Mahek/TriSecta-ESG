import crypto from "crypto";

import { dataPointModel } from "../models/dataPointModel.js";
import { metricModel } from "../models/metricModel.js";
import { disclosureModel } from "../models/disclosureModel.js";
import { auditLogModel } from "../models/auditLogModel.js";
import { crossVerificationModel }
    from "../models/crossVerificationModel.js";

import { transaction } from "../config/db.js";
import { AppError } from "../middlewares/errorMiddleware.js";

import { crossVerificationService }
    from "./crossVerification/crossVerificationService.js";


export const dataPointService = {

    // =========================================================
    // CREATE DATA POINT
    // =========================================================

    async createDataPoint(data, user, ipAddress) {

        // -----------------------------------------------------
        // 1. AUTHORIZATION
        // -----------------------------------------------------

        if (user.role !== "COMPANY_USER") {

            throw new AppError(
                "Access denied",
                403
            );
        }


        // -----------------------------------------------------
        // 2. GET DISCLOSURE
        // -----------------------------------------------------

        const disclosure =
            await disclosureModel.getDisclosure(
                data.disclosureId
            );


        if (!disclosure) {

            throw new AppError(
                "Disclosure not found",
                404
            );
        }


        // -----------------------------------------------------
        // 3. COMPANY OWNERSHIP
        // -----------------------------------------------------

        if (
            disclosure.company_id !==
            user.company_id
        ) {

            throw new AppError(
                "Access denied",
                403
            );
        }


        // -----------------------------------------------------
        // 4. DISCLOSURE MUST BE DRAFT
        // -----------------------------------------------------

        if (
            disclosure.status !== "DRAFT"
        ) {

            throw new AppError(
                "Data can only be entered into draft disclosures",
                409
            );
        }


        // -----------------------------------------------------
        // 5. GET METRIC
        // -----------------------------------------------------

        const metric =
            await metricModel.getMetric(
                data.metricId
            );


        if (!metric) {

            throw new AppError(
                "Metric not found",
                404
            );
        }


        // -----------------------------------------------------
        // 6. METRIC MUST BE ACTIVE
        // -----------------------------------------------------

        if (!metric.is_active) {

            throw new AppError(
                "Metric is inactive",
                409
            );
        }


        // -----------------------------------------------------
        // 7. REQUIRED FIELDS
        // -----------------------------------------------------

        if (
            data.value === undefined ||
            data.value === null ||
            data.unit === undefined ||
            data.unit === null ||
            !data.periodStart ||
            !data.periodEnd
        ) {

            throw new AppError(
                "Value, unit, period start and period end are required",
                400
            );
        }


        // -----------------------------------------------------
        // 8. NUMERIC VALIDATION
        // -----------------------------------------------------

        if (
            typeof data.value !== "number" ||
            !Number.isFinite(data.value)
        ) {

            throw new AppError(
                "Value must be a valid number",
                400
            );
        }


        // -----------------------------------------------------
        // 9. NON-NEGATIVE VALIDATION
        // -----------------------------------------------------

        if (data.value < 0) {

            throw new AppError(
                "Value cannot be negative",
                400
            );
        }


        // -----------------------------------------------------
        // 10. DATE VALIDATION
        // -----------------------------------------------------

        const startDate =
            new Date(data.periodStart);

        const endDate =
            new Date(data.periodEnd);


        if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime())
        ) {

            throw new AppError(
                "Invalid reporting period",
                400
            );
        }


        if (startDate > endDate) {

            throw new AppError(
                "Period start cannot be after period end",
                400
            );
        }


        // -----------------------------------------------------
        // 11. CROSS-SOURCE VERIFICATION
        // -----------------------------------------------------
        //
        // IMPORTANT:
        //
        // The data point has NOT been inserted yet.
        //
        // We first send the proposed value to the
        // cross-verification service.
        //
        // Only VERIFIED values are allowed to reach
        // the database.
        //
        // -----------------------------------------------------

        const crossVerification =
            await crossVerificationService.verifyBeforeCreate(
                data,
                disclosure,
                metric
            );


        if (
            !crossVerification ||
            crossVerification.status !== "VERIFIED"
        ) {

            throw new AppError(
                crossVerification?.message ||
                "Data point failed cross-source verification",
                409
            );
        }


        // -----------------------------------------------------
        // 12. CREATE DATA INTEGRITY HASH
        // -----------------------------------------------------
        //
        // Hash is generated AFTER validation and
        // cross-source verification.
        //
        // -----------------------------------------------------

        const hashData = [

            data.disclosureId,
            data.metricId,
            data.value,
            data.unit,
            data.periodStart,
            data.periodEnd,
            user.id

        ].join("|");


        const hash =
            crypto
                .createHash("sha256")
                .update(hashData)
                .digest("hex");


        // -----------------------------------------------------
        // 13. DATABASE TRANSACTION
        // -----------------------------------------------------

        return await transaction(async (client) => {

    const dataPoint =
        await dataPointModel.createDataPoint(
            data.disclosureId,
            data.metricId,
            data.value,
            data.unit,
            data.periodStart,
            data.periodEnd,
            hash,
            user.id,
            client
        );

    await crossVerificationModel.createResult(
        {
            disclosureId: disclosure.id,

            metricId: metric.id,

            companyValue: data.value,

            externalValue:
                crossVerification.externalValue,

            unit: data.unit,

            sourceType:
                crossVerification.sourceType,

            sourceReference:
                crossVerification.sourceReference,

            verificationStatus:
                crossVerification.status,

            difference:
                crossVerification.difference,

            tolerance:
                crossVerification.tolerance,

            message:
                crossVerification.message
        },

        client
    );

    await auditLogModel.createLog(
        user.id,
        "CREATE_DATA_POINT",
        "DATA_POINT",
        dataPoint.id,
        ipAddress,
        client
    );

    return dataPoint;
});
    },


    // =========================================================
    // GET SINGLE DATA POINT
    // =========================================================

    async getDataPoint(id, user) {

        // -----------------------------------------------------
        // 1. GET DATA POINT
        // -----------------------------------------------------

        const dataPoint =
            await dataPointModel.getDataPoint(id);


        if (!dataPoint) {

            throw new AppError(
                "Data point not found",
                404
            );
        }


        // -----------------------------------------------------
        // 2. GET ASSOCIATED DISCLOSURE
        // -----------------------------------------------------

        const disclosure =
            await disclosureModel.getDisclosure(
                dataPoint.disclosure_id
            );


        if (!disclosure) {

            throw new AppError(
                "Disclosure not found",
                404
            );
        }


        // -----------------------------------------------------
        // 3. COMPANY ACCESS CONTROL
        // -----------------------------------------------------

        if (
            user.role === "COMPANY_USER" &&
            disclosure.company_id !==
            user.company_id
        ) {

            throw new AppError(
                "Access denied",
                403
            );
        }


        return dataPoint;
    },


    // =========================================================
    // GET DATA POINTS BY DISCLOSURE
    // =========================================================

    async getDataPointsByDisclosure(
        disclosureId,
        user
    ) {

        // -----------------------------------------------------
        // 1. GET DISCLOSURE
        // -----------------------------------------------------

        const disclosure =
            await disclosureModel.getDisclosure(
                disclosureId
            );


        if (!disclosure) {

            throw new AppError(
                "Disclosure not found",
                404
            );
        }


        // -----------------------------------------------------
        // 2. COMPANY ACCESS CONTROL
        // -----------------------------------------------------

        if (
            user.role === "COMPANY_USER" &&
            disclosure.company_id !==
            user.company_id
        ) {

            throw new AppError(
                "Access denied",
                403
            );
        }


        // -----------------------------------------------------
        // 3. GET DATA POINTS
        // -----------------------------------------------------

        return await dataPointModel
            .getDataPointsByDisclosure(
                disclosureId
            );
    },


    // =========================================================
    // UPDATE DATA POINT
    // =========================================================

    async updateDataPoint(
        id,
        data,
        user,
        ipAddress
    ) {

        // -----------------------------------------------------
        // 1. AUTHORIZATION
        // -----------------------------------------------------

        if (user.role !== "COMPANY_USER") {

            throw new AppError(
                "Access denied",
                403
            );
        }


        // -----------------------------------------------------
        // 2. GET EXISTING DATA POINT
        // -----------------------------------------------------

        const dataPoint =
            await dataPointModel.getDataPoint(id);


        if (!dataPoint) {

            throw new AppError(
                "Data point not found",
                404
            );
        }


        // -----------------------------------------------------
        // 3. GET DISCLOSURE
        // -----------------------------------------------------

        const disclosure =
            await disclosureModel.getDisclosure(
                dataPoint.disclosure_id
            );


        if (!disclosure) {

            throw new AppError(
                "Disclosure not found",
                404
            );
        }


        // -----------------------------------------------------
        // 4. COMPANY OWNERSHIP
        // -----------------------------------------------------

        if (
            disclosure.company_id !==
            user.company_id
        ) {

            throw new AppError(
                "Access denied",
                403
            );
        }


        // -----------------------------------------------------
        // 5. DISCLOSURE MUST BE DRAFT
        // -----------------------------------------------------

        if (
            disclosure.status !== "DRAFT"
        ) {

            throw new AppError(
                "Only draft disclosures can be modified",
                409
            );
        }


        // -----------------------------------------------------
        // 6. CHECK THAT SOMETHING WAS PROVIDED
        // -----------------------------------------------------

        if (
            data.value === undefined &&
            data.unit === undefined &&
            data.periodStart === undefined &&
            data.periodEnd === undefined
        ) {

            throw new AppError(
                "No valid fields provided for update",
                400
            );
        }


        // -----------------------------------------------------
        // 7. BUILD FINAL VALUES
        // -----------------------------------------------------
        //
        // If the user updates only one field,
        // keep the existing values for everything else.
        //
        // -----------------------------------------------------

        const value =
            data.value ??
            Number(dataPoint.value);


        const unit =
            data.unit ??
            dataPoint.unit;


        const periodStart =
            data.periodStart ??
            dataPoint.period_start;


        const periodEnd =
            data.periodEnd ??
            dataPoint.period_end;


        // -----------------------------------------------------
        // 8. NUMERIC VALIDATION
        // -----------------------------------------------------

        if (
            typeof value !== "number" ||
            !Number.isFinite(value)
        ) {

            throw new AppError(
                "Value must be a valid number",
                400
            );
        }


        // -----------------------------------------------------
        // 9. NON-NEGATIVE VALIDATION
        // -----------------------------------------------------

        if (value < 0) {

            throw new AppError(
                "Value cannot be negative",
                400
            );
        }


        // -----------------------------------------------------
        // 10. DATE VALIDATION
        // -----------------------------------------------------

        const startDate =
            new Date(periodStart);

        const endDate =
            new Date(periodEnd);


        if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime())
        ) {

            throw new AppError(
                "Invalid reporting period",
                400
            );
        }


        if (startDate > endDate) {

            throw new AppError(
                "Period start cannot be after period end",
                400
            );
        }


        // -----------------------------------------------------
        // 11. GET METRIC
        // -----------------------------------------------------

        const metric =
            await metricModel.getMetric(
                dataPoint.metric_id
            );


        if (!metric) {

            throw new AppError(
                "Metric not found",
                404
            );
        }


        // -----------------------------------------------------
        // 12. METRIC MUST BE ACTIVE
        // -----------------------------------------------------

        if (!metric.is_active) {

            throw new AppError(
                "Metric is inactive",
                409
            );
        }


        // -----------------------------------------------------
        // 13. PREPARE PROPOSED DATA
        // -----------------------------------------------------
        //
        // We create an object representing what the
        // data point WILL look like after the update.
        //
        // This object is sent to the cross-verification
        // service before modifying the database.
        //
        // -----------------------------------------------------

        const verificationData = {

            disclosureId:
                dataPoint.disclosure_id,

            metricId:
                dataPoint.metric_id,

            value,

            unit,

            periodStart,

            periodEnd
        };


        // -----------------------------------------------------
        // 14. CROSS-SOURCE VERIFICATION
        // -----------------------------------------------------

        const crossVerification =
            await crossVerificationService
                .verifyBeforeCreate(
                    verificationData,
                    disclosure,
                    metric
                );


        if (
            !crossVerification ||
            crossVerification.status !==
            "VERIFIED"
        ) {

            throw new AppError(
                crossVerification?.message ||
                "Updated data point failed cross-source verification",
                409
            );
        }


        // -----------------------------------------------------
        // 15. RECALCULATE INTEGRITY HASH
        // -----------------------------------------------------

        const hashData = [

            dataPoint.disclosure_id,

            dataPoint.metric_id,

            value,

            unit,

            periodStart,

            periodEnd,

            dataPoint.entered_by

        ].join("|");


        const hash =
            crypto
                .createHash("sha256")
                .update(hashData)
                .digest("hex");


        // -----------------------------------------------------
        // 16. ATOMIC UPDATE + AUDIT LOG
        // -----------------------------------------------------

        return await transaction(
            async (client) => {

                // -------------------------------------------------
                // UPDATE DATA POINT
                // -------------------------------------------------

                const updatedDataPoint =
                    await dataPointModel.updateDataPoint(

                        id,

                        {
                            value,
                            unit,
                            periodStart,
                            periodEnd
                        },

                        hash,

                        client
                    );


                // -------------------------------------------------
                // AUDIT LOG
                // -------------------------------------------------

                await auditLogModel.createLog(

                    user.id,

                    "UPDATE_DATA_POINT",

                    "DATA_POINT",

                    id,

                    ipAddress,

                    client
                );


                // -------------------------------------------------
                // RETURN UPDATED DATA POINT
                // -------------------------------------------------

                return updatedDataPoint;
            }
        );
    }

};