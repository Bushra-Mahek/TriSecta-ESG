export const calculationRules = {

    validate(dataPoints, metrics) {

        const results = [];

        // Calculation rules become applicable
        // when metrics have defined relationships.

        // Current implementation performs
        // structural validation only.

        if (dataPoints.length > 0) {

            results.push({
                ruleCode: "CALCULATION_INPUTS_AVAILABLE",
                category: "CALCULATION",
                severity: "PASS",
                status: "PASSED",
                message:
                    "Required data points are available for calculation checks.",
                expected: "Data points available",
                actual: dataPoints.length
            });
        }

        return results;
    }

};