export const consistencyRules = {

    validate(dataPoints, metrics) {

        const results = [];

        const seen = new Set();

        for (const dataPoint of dataPoints) {

            const key =
                `${dataPoint.metric_id}|` +
                `${dataPoint.period_start}|` +
                `${dataPoint.period_end}`;

            if (seen.has(key)) {

                results.push({
                    ruleCode: "DUPLICATE_METRIC_PERIOD",
                    category: "CONSISTENCY",
                    severity: "FAIL",
                    status: "FAILED",
                    message:
                        "Multiple data points exist for the same metric and reporting period.",
                    expected:
                        "One data point per metric and reporting period",
                    actual: key
                });

            }

            seen.add(key);
        }

        if (results.length === 0) {

            results.push({
                ruleCode: "DUPLICATE_METRIC_PERIOD",
                category: "CONSISTENCY",
                severity: "PASS",
                status: "PASSED",
                message:
                    "No duplicate metric-period combinations were found.",
                expected:
                    "Unique metric-period combinations",
                actual: null
            });
        }

        return results;
    }

};