import { metricService } from "../services/metricService.js";

export const createMetric = async (req, res, next) => {
    try {

        const result = await metricService.createMetric(
            req.body,
            req.user,
            req.ip
        );

        return res.status(201).json({
            message: "Metric created successfully",
            metric: result
        });

    } catch (err) {
        next(err);
    }
};


export const getMetric = async (req, res, next) => {
    try {

        const result = await metricService.getMetric(
            req.params.id
        );

        return res.status(200).json({
            metric: result
        });

    } catch (err) {
        next(err);
    }
};


export const getMetrics = async (req, res, next) => {
    try {

        const result = await metricService.getMetrics();

        return res.status(200).json({
            metrics: result
        });

    } catch (err) {
        next(err);
    }
};


export const updateMetric = async (req, res, next) => {
    try {

        const result = await metricService.updateMetric(
            req.params.id,
            req.body,
            req.user,
            req.ip
        );

        return res.status(200).json({
            message: "Metric updated successfully",
            metric: result
        });

    } catch (err) {
        next(err);
    }
};


export const deactivateMetric = async (req, res, next) => {
    try {

        const result = await metricService.deactivateMetric(
            req.params.id,
            req.user,
            req.ip
        );

        return res.status(200).json({
            message: "Metric deactivated successfully",
            metric: result
        });

    } catch (err) {
        next(err);
    }
};