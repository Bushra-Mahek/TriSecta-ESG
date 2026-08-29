export const completenessRules = {

    validateDataPoints(dataPoints) {

        if (!dataPoints || dataPoints.length === 0) {

            return [{
                ruleCode: "DATA_POINTS_REQUIRED",
                category: "COMPLETENESS",
                severity: "FAIL",
                status: "FAILED",
                message:
                    "Disclosure must contain at least one data point before submission.",
                expected: "> 0 data points",
                actual: 0
            }];
        }

        return [{
            ruleCode: "DATA_POINTS_REQUIRED",
            category: "COMPLETENESS",
            severity: "PASS",
            status: "PASSED",
            message:
                "Disclosure contains data points.",
            expected: "> 0 data points",
            actual: dataPoints.length
        }];
    },


    validateDocuments(documents) {

        if (!documents || documents.length === 0) {

            return [{
                ruleCode: "SUPPORTING_DOCUMENT_REQUIRED",
                category: "COMPLETENESS",
                severity: "WARNING",
                status: "WARNING",
                message:
                    "No supporting document has been uploaded for this disclosure.",
                expected: "> 0 supporting documents",
                actual: 0
            }];
        }

        return [{
            ruleCode: "SUPPORTING_DOCUMENT_REQUIRED",
            category: "COMPLETENESS",
            severity: "PASS",
            status: "PASSED",
            message:
                "Disclosure contains supporting documents.",
            expected: "> 0 supporting documents",
            actual: documents.length
        }];
    }

};