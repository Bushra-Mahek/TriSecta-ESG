import { certificateService } from "../services/certificateService.js";

export const certificateController = {

    async createCertificate(req, res, next) {
        try {

            const { disclosureId } = req.params;

            const certificate =
                await certificateService.createCertificate(
                    disclosureId
                );

            return res.status(201).json({
                success: true,
                certificate
            });

        } catch (error) {
            next(error);
        }
    }
};