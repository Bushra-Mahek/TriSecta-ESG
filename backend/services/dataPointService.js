import crypto from "crypto";
import { dataPointModel } from "../models/dataPointModel.js";
import { metricModel } from "../models/metricModel.js";
import { disclosureModel } from "../models/disclosureModel.js";
import { auditLogModel } from "../models/auditLogModel.js";
import { transaction } from "../config/db.js";
import { AppError } from "../middlewares/errorMiddleware.js";


export const dataPointService = {
    async createDataPoint(data, user, ipAddress) {
        const hashData = [
    data.disclosureId,
    data.metricId,
    data.value,
    data.unit,
    data.periodStart,
    data.periodEnd,
    user.id
].join("|");

const hash = crypto
    .createHash("sha256")
    .update(hashData)
    .digest("hex");

        if (user.role !== "COMPANY_USER") {
            throw new AppError(
                "Access denied",
                403
            );
        }

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

        if (disclosure.company_id !== user.company_id) {
            throw new AppError(
                "Access denied",
                403
            );
        }

        if (disclosure.status !== "DRAFT") {
            throw new AppError(
                "Data can only be entered into draft disclosures",
                409
            );
        }

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

        if (!metric.is_active) {
            throw new AppError(
                "Metric is inactive",
                409
            );
        }

        if (
            data.value === undefined ||
            data.value === null ||
            data.unit === undefined ||
            !data.periodStart ||
            !data.periodEnd
        ) {
            throw new AppError(
                "Value, unit, period start and period end are required",
                400
            );
        }

        if (data.value < 0) {
            throw new AppError(
                "Value cannot be negative",
                400
            );
        }

        if (new Date(data.periodStart) > new Date(data.periodEnd)) {
            throw new AppError(
                "Period start cannot be after period end",
                400
            );
        }

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

    async getDataPoint(id, user) {

    const dataPoint =
        await dataPointModel.getDataPoint(id);

    if (!dataPoint) {
        throw new AppError(
            "Data point not found",
            404
        );
    }

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

    if (
        user.role === "COMPANY_USER" &&
        disclosure.company_id !== user.company_id
    ) {
        throw new AppError(
            "Access denied",
            403
        );
    }

    return dataPoint;
},

    async getDataPointsByDisclosure(disclosureId, user) {

    const disclosure =
        await disclosureModel.getDisclosure(disclosureId);

    if (!disclosure) {
        throw new AppError(
            "Disclosure not found",
            404
        );
    }

    return await dataPointModel.getDataPointsByDisclosure(
        disclosureId
    );
},

    async updateDataPoint(id, data, user, ipAddress) {

    if (user.role !== "COMPANY_USER") {
        throw new AppError(
            "Access denied",
            403
        );
    }

    const dataPoint =
        await dataPointModel.getDataPoint(id);

    if (!dataPoint) {
        throw new AppError(
            "Data point not found",
            404
        );
    }

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

    if (disclosure.company_id !== user.company_id) {
        throw new AppError(
            "Access denied",
            403
        );
    }

    if (disclosure.status !== "DRAFT") {
        throw new AppError(
            "Only draft disclosures can be modified",
            409
        );
    }

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

    const value =
        data.value ?? dataPoint.value;

    const unit =
        data.unit ?? dataPoint.unit;

    const periodStart =
        data.periodStart ?? dataPoint.period_start;

    const periodEnd =
        data.periodEnd ?? dataPoint.period_end;

    if (value < 0) {
        throw new AppError(
            "Value cannot be negative",
            400
        );
    }

    if (new Date(periodStart) > new Date(periodEnd)) {
        throw new AppError(
            "Period start cannot be after period end",
            400
        );
    }

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

    if (!metric.is_active) {
        throw new AppError(
            "Metric is inactive",
            409
        );
    }

    const hashData = [
        dataPoint.disclosure_id,
        dataPoint.metric_id,
        value,
        unit,
        periodStart,
        periodEnd,
        dataPoint.entered_by
    ].join("|");

    const hash = crypto
        .createHash("sha256")
        .update(hashData)
        .digest("hex");

    return await transaction(async (client) => {

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

        await auditLogModel.createLog(
            user.id,
            "UPDATE_DATA_POINT",
            "DATA_POINT",
            id,
            ipAddress,
            client
        );

        return updatedDataPoint;
    });
},
}