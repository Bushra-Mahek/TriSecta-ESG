import { disclosureModel }
    from "../../models/disclosureModel.js";

import { dataPointModel }
    from "../../models/dataPointModel.js";

import { metricModel }
    from "../../models/metricModel.js";

import { crossVerificationModel }
    from "../../models/crossVerificationModel.js";

import { crossVerificationRules }
    from "./crossVerificationRules.js";

import { electricityProvider }
    from "./providers/electricityProvider.js";

import { environmentProvider }
    from "./providers/environmentProvider.js";

import { AppError }
    from "../../middlewares/errorMiddleware.js";


export const crossVerificationService = {

    async verifyDataPoint(
        dataPointId,
        user
    ) {

        // --------------------------------
        // 1. Company users only
        // --------------------------------

        if (
            user.role !== "COMPANY_USER"
        ) {

            throw new AppError(
                "Only company users can initiate cross-source verification",
                403
            );
        }


        // --------------------------------
        // 2. Get data point
        // --------------------------------

        const dataPoint =
            await dataPointModel.getDataPoint(
                dataPointId
            );

        if (!dataPoint) {

            throw new AppError(
                "Data point not found",
                404
            );
        }


        // --------------------------------
        // 3. Get disclosure
        // --------------------------------

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


        // --------------------------------
        // 4. Ownership
        // --------------------------------

        if (
            disclosure.company_id !==
            user.company_id
        ) {

            throw new AppError(
                "Access denied",
                403
            );
        }


        // --------------------------------
        // 5. Must still be draft
        // --------------------------------

        if (
            disclosure.status !== "DRAFT"
        ) {

            throw new AppError(
                "Cross-source verification is only allowed while the disclosure is in draft",
                409
            );
        }


        // --------------------------------
        // 6. Get metric
        // --------------------------------

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


        // --------------------------------
        // 7. Select provider
        // --------------------------------

        let provider;

        if (
            metric.category ===
            "ENVIRONMENT"
        ) {

            provider =
                environmentProvider;

        } else {

            provider =
                electricityProvider;
        }


        // --------------------------------
        // 8. Query independent source
        // --------------------------------

        const externalResult =
            await provider.verify({

                companyId:
                    disclosure.company_id,

                periodStart:
                    dataPoint.period_start,

                periodEnd:
                    dataPoint.period_end,

                metric
            });


        // --------------------------------
        // 9. Compare values
        // --------------------------------

        const tolerance =
            crossVerificationRules
                .getTolerance(metric);

        const comparison =
            crossVerificationRules.compare(
                dataPoint.value,
                externalResult.value,
                tolerance
            );


        // --------------------------------
        // 10. Store verification evidence
        // --------------------------------

        const result =
            await crossVerificationModel
                .createResult({

                    disclosureId:
                        disclosure.id,

                    metricId:
                        dataPoint.metric_id,

                    companyValue:
                        dataPoint.value,

                    externalValue:
                        externalResult.value,

                    unit:
                        dataPoint.unit,

                    sourceType:
                        externalResult.sourceType,

                    sourceReference:
                        externalResult.sourceReference,

                    verificationStatus:
                        comparison.status,

                    difference:
                        comparison.difference,

                    tolerance,

                    message:
                        comparison.message
                });


        return result;
    },

    async verifyBeforeCreate(
    data,
    disclosure,
    metric
) {

    let provider;

    if (metric.category === "ENVIRONMENT") {
        provider = environmentProvider;
    } else {
        provider = electricityProvider;
    }

    const externalResult =
        await provider.verify({
            companyId: disclosure.company_id,
            periodStart: data.periodStart,
            periodEnd: data.periodEnd,
            metric
        });

    const tolerance =
        crossVerificationRules.getTolerance(metric);

    const comparison =
        crossVerificationRules.compare(
            data.value,
            externalResult.value,
            tolerance
        );

    return {
        ...comparison,

        externalValue:
            externalResult.value,

        unit:
            externalResult.unit ?? data.unit,

        sourceType:
            externalResult.sourceType,

        sourceReference:
            externalResult.sourceReference,

        tolerance
    };
},

};