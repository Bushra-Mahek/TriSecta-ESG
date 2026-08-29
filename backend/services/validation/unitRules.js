export const unitRules = {

    validateUnits(dataPoints, metrics) {

        const results = [];

        const metricMap = new Map();

        for (const metric of metrics) {
            metricMap.set(
                metric.id,
                metric
            );
        }

        for (const dataPoint of dataPoints) {

            const metric =
                metricMap.get(dataPoint.metric_id);

            if (!metric) {
                continue;
            }

            if (
                dataPoint.unit !== metric.unit
            ) {

                results.push({
                    ruleCode: "UNIT_CONSISTENCY",
                    category: "UNITS",
                    severity: "FAIL",
                    status: "FAILED",
                    message:
                        `Unit does not match the defined unit for metric ${metric.metric_name}.`,
                    expected: metric.unit,
                    actual: dataPoint.unit
                });
            }
        }

        if (results.length === 0) {

            results.push({
                ruleCode: "UNIT_CONSISTENCY",
                category: "UNITS",
                severity: "PASS",
                status: "PASSED",
                message:
                    "All data point units match their metric definitions.",
                expected: "Metric-defined unit",
                actual: null
            });
        }

        return results;
    }

};