import { metricModel } from "../models/metricModel.js";
import { AppError } from "../middlewares/errorMiddleware.js";
import { transaction } from "../config/db.js";
import { auditLogModel } from "../models/auditLogModel.js";

export const metricService = {

    async createMetric(data, user, ipAddress) {

        if (user.role !== "ADMIN") {
            throw new AppError(
                "Access denied",
                403
            );
        }

        if (
            !data.metricName ||
            !data.metricCode ||
            !data.category ||
            !data.unit
        ) {
            throw new AppError(
                "Metric name, code, category and unit are required",
                400
            );
        }

        return await transaction(async (client) => {

            const metric =
                await metricModel.createMetric(
                    data.metricName,
                    data.metricCode,
                    data.category,
                    data.unit,
                    data.description ?? null,
                    client
                );

            await auditLogModel.createLog(
                user.id,
                "CREATE_METRIC",
                "METRIC",
                metric.id,
                ipAddress,
                client
            );

            return metric;
        });
    },

    async getMetric(id) {

        const metric =
            await metricModel.getMetric(id);

        if (!metric) {
            throw new AppError(
                "Metric not found",
                404
            );
        }

        return metric;
    },

    async getMetrics() {
        return await metricModel.getMetrics();
    },

    async updateMetric(id, data, user, ipAddress) {

        if (user.role !== "ADMIN") {
            throw new AppError(
                "Access denied",
                403
            );
        }

        const metric =
            await metricModel.getMetric(id);

        if (!metric) {
            throw new AppError(
                "Metric not found",
                404
            );
        }

        const allowedData = {};

        if (data.metricName !== undefined)
            allowedData.metricName = data.metricName;

        if (data.metricCode !== undefined)
            allowedData.metricCode = data.metricCode;

        if (data.category !== undefined)
            allowedData.category = data.category;

        if (data.unit !== undefined)
            allowedData.unit = data.unit;

        if (data.description !== undefined)
            allowedData.description = data.description;

        if (Object.keys(allowedData).length === 0) {
            throw new AppError(
                "No valid fields provided for update",
                400
            );
        }

        return await transaction(async (client) => {

            const updatedMetric =
                await metricModel.updateMetric(
                    id,
                    {
                        metricName:
                            allowedData.metricName ??
                            metric.metric_name,

                        metricCode:
                            allowedData.metricCode ??
                            metric.metric_code,

                        category:
                            allowedData.category ??
                            metric.category,

                        unit:
                            allowedData.unit ??
                            metric.unit,

                        description:
                            allowedData.description ??
                            metric.description
                    },
                    client
                );

            await auditLogModel.createLog(
                user.id,
                "UPDATE_METRIC",
                "METRIC",
                id,
                ipAddress,
                client
            );

            return updatedMetric;
        });
    },

    async deactivateMetric(id, user, ipAddress) {

        if (user.role !== "ADMIN") {
            throw new AppError(
                "Access denied",
                403
            );
        }

        const metric =
            await metricModel.getMetric(id);

        if (!metric) {
            throw new AppError(
                "Metric not found",
                404
            );
        }

        if (!metric.is_active) {
            throw new AppError(
                "Metric is already inactive",
                409
            );
        }

        return await transaction(async (client) => {

            const updatedMetric =
                await metricModel.deactivateMetric(
                    id,
                    client
                );

            await auditLogModel.createLog(
                user.id,
                "UPDATE_METRIC",
                "METRIC",
                id,
                ipAddress,
                client
            );

            return updatedMetric;
        });
    }
};