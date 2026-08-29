import { disclosureModel } from "../models/disclosureModel.js";
import { validationResultModel } from "../models/validationResultModel.js";
import { verificationResultModel } from "../models/verificationResultModel.js";
import { disclosureAuditModel } from "../models/disclosureAuditModel.js";
import { transaction } from "../config/db.js";
import { AppError } from "../middlewares/errorMiddleware.js";


export const verificationService = {

    async verifyDisclosure(
        disclosureId,
        user,
        notes
    ) {

        // 1. Only auditors can verify
        if (user.role !== "AUDITOR") {
            throw new AppError(
                "Only auditors can verify disclosures",
                403
            );
        }


        // 2. Get disclosure
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


        // 3. Disclosure must be under review
        if (disclosure.status !== "UNDER_REVIEW") {
            throw new AppError(
                "Only disclosures under review can be verified",
                409
            );
        }


        // 4. Check automated validation
        const validationResults =
            await validationResultModel
                .getResultsByDisclosure(
                    disclosureId
                );

        const failed =
            validationResults.filter(
                result => result.severity === "FAIL"
            );

        if (failed.length > 0) {
            throw new AppError(
                "Disclosure contains failed automated validation checks",
                409
            );
        }


        // 5. Perform verification atomically
        return await transaction(async (client) => {

            const verification =
                await verificationResultModel
                    .createVerification(
                        disclosureId,
                        "VERIFIED",
                        user.id,
                        notes,
                        client
                    );


            const updatedDisclosure =
                await disclosureModel.updateStatus(
                    disclosureId,
                    "VERIFIED",
                    client
                );


            await disclosureAuditModel.createLog(
    disclosureId,
    user.id,
    "VERIFY_DISCLOSURE",
    "UNDER_REVIEW",
    "VERIFIED",
    client
);


            return {
                disclosure: updatedDisclosure,
                verification
            };
        });
    },


    async rejectDisclosure(
        disclosureId,
        user,
        notes
    ) {

        if (user.role !== "AUDITOR") {
            throw new AppError(
                "Only auditors can reject disclosures",
                403
            );
        }


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


        if (disclosure.status !== "UNDER_REVIEW") {
            throw new AppError(
                "Only disclosures under review can be rejected",
                409
            );
        }


        if (!notes || !notes.trim()) {
            throw new AppError(
                "Rejection notes are required",
                400
            );
        }


        return await transaction(async (client) => {

            const verification =
                await verificationResultModel
                    .createVerification(
                        disclosureId,
                        "REJECTED",
                        user.id,
                        notes,
                        client
                    );


            const updatedDisclosure =
                await disclosureModel.updateStatus(
                    disclosureId,
                    "REJECTED",
                    client
                );


            await disclosureAuditModel.createLog(
    disclosureId,
    user.id,
    "REJECT_DISCLOSURE",
    "UNDER_REVIEW",
    "REJECTED",
    client
);


            return {
                disclosure: updatedDisclosure,
                verification
            };
        });
    }

};