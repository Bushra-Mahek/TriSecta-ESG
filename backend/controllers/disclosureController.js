import { disclosureService } from "../services/disclosureService.js";

export const createDisclosure = async (req, res, next) => {
    try {
        const reportingYear = req.body.reportingYear;

        if (!reportingYear) {
            return res.status(400).json({
                message: "reporting year is required"
            });
        }

        const result = await disclosureService.createDisclosure(
            reportingYear,
            req.user,req.ip
        );

        return res.status(201).json({
            message: "disclosure created successfully",
            disclosure: result
        });
    }

    catch (err) {
        console.error("Disclosure creation error");
        next(err);
    }
};


export const viewDisclosure = async (req, res, next) => {
    try {
        const id = req.params.id;

        const result = await disclosureService.getDisclosure(
            id,
            req.user
        );

        return res.status(200).json({
            disclosure: result
        });
    }

    catch (err) {
        next(err);
    }
};


export const viewDisclosures = async (req, res, next) => {
    try {
        const result = await disclosureService.getDisclosures();

        return res.status(200).json({
            disclosures: result
        });
    }

    catch (err) {
        next(err);
    }
};


export const updateDisclosure = async (req, res, next) => {
    try {
        const id = req.params.id;

        const result = await disclosureService.updateDisclosure(
            id,
            req.body,
            req.user,req.ip
        );

        return res.status(200).json({
            message: "disclosure updated successfully",
            disclosure: result
        });
    }

    catch (err) {
        next(err);
    }
};


export const deleteDisclosure = async (req, res, next) => {
    try {
        const id = req.params.id;

        await disclosureService.deleteDisclosure(
            id,
            req.user,req.ip
        );

        return res.status(200).json({
            message: "disclosure deleted successfully"
        });
    }

    catch (err) {
        next(err);
    }
};


export const reviseDisclosure = async (req, res, next) => {
    try {
        const id = req.params.id;

        const result = await disclosureService.reviseDisclosure(
            id,
            req.user
        );

        return res.status(200).json({
            message: "disclosure moved back to draft",
            disclosure: result
        });
    }

    catch (err) {
        next(err);
    }
};

export const submitDisclosure = async (req, res, next) => {
    try {
        const result =
            await disclosureService.submitDisclosure(
                req.params.id,
                req.user
            );

        return res.status(200).json({
            message: "Disclosure submitted successfully",
            disclosure: result
        });
    }

    catch (err) {
        next(err);
    }
};

export const verifyDisclosure = async (req, res, next) => {
    try {

        const id = req.params.id;

        const result =
            await disclosureService.verifyDisclosure(
                id,
                req.user
            );

        return res.status(200).json({
            message: "Disclosure verified successfully",
            disclosure: result
        });
    }

    catch (err) {
        next(err);
    }
};

export const rejectDisclosure = async (req, res, next) => {
    try {

        const id = req.params.id;

        const result =
            await disclosureService.rejectDisclosure(
                id,
                req.user
            );

        return res.status(200).json({
            message: "Disclosure rejected successfully",
            disclosure: result
        });
    }

    catch (err) {
        next(err);
    }
};