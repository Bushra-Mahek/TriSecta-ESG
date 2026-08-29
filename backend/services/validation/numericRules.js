
export const numericRules = {

    validateNonNegative(dataPoints) {

        const results = [];

        for (const dataPoint of dataPoints) {

            const value = Number(dataPoint.value);

            if (Number.isNaN(value)) {

                results.push({
                    ruleCode: "NUMERIC_VALUE",
                    category: "NUMERIC",
                    severity: "FAIL",
                    status: "FAILED",
                    message:
                        "Data point value must be numeric.",
                    expected: "numeric value",
                    actual: dataPoint.value
                });

                continue;
            }

            if (value < 0) {

                results.push({
                    ruleCode: "NON_NEGATIVE_VALUE",
                    category: "NUMERIC",
                    severity: "FAIL",
                    status: "FAILED",
                    message:
                        "Metric value cannot be negative.",
                    expected: "value >= 0",
                    actual: value
                });
            }
        }

        if (results.length === 0) {

            results.push({
                ruleCode: "NON_NEGATIVE_VALUE",
                category: "NUMERIC",
                severity: "PASS",
                status: "PASSED",
                message:
                    "All metric values are valid and non-negative.",
                expected: "value >= 0",
                actual: null
            });
        }

        return results;
    }

};