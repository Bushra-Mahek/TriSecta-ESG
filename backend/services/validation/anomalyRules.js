export const anomalyRules = {

    validate(dataPoints, metrics) {

        const results = [];

        const grouped = new Map();

        for (const dataPoint of dataPoints) {

            if (!grouped.has(dataPoint.metric_id)) {
                grouped.set(
                    dataPoint.metric_id,
                    []
                );
            }

            grouped
                .get(dataPoint.metric_id)
                .push(dataPoint);
        }


        for (const [metricId, points] of grouped) {

            if (points.length < 2) {
                continue;
            }

            points.sort(
                (a, b) =>
                    new Date(a.period_start) -
                    new Date(b.period_start)
            );


            for (let i = 1; i < points.length; i++) {

                const previous =
                    Number(points[i - 1].value);

                const current =
                    Number(points[i].value);


                if (previous === 0) {
                    continue;
                }


                const percentageChange =
                    Math.abs(
                        ((current - previous) /
                            previous) * 100
                    );


                if (percentageChange >= 500) {

                    results.push({
                        ruleCode:
                            "SIGNIFICANT_VALUE_CHANGE",
                        category: "ANOMALY",
                        severity: "WARNING",
                        status: "WARNING",
                        message:
                            "Metric value changed significantly between reporting periods. Auditor review is recommended.",
                        expected:
                            "< 500% change",
                        actual:
                            `${percentageChange.toFixed(2)}%`
                    });
                }
            }
        }


        if (results.length === 0) {

            results.push({
                ruleCode:
                    "SIGNIFICANT_VALUE_CHANGE",
                category: "ANOMALY",
                severity: "PASS",
                status: "PASSED",
                message:
                    "No significant value anomalies were detected.",
                expected:
                    "< 500% change",
                actual: null
            });
        }


        return results;
    }

};