
export const periodRules = {

    validateReportingPeriod(
        disclosure,
        dataPoints
    ) {

        const results = [];

        const reportingYear =
            Number(disclosure.reporting_year);

        for (const dataPoint of dataPoints) {

            const startYear =
                new Date(
                    dataPoint.period_start
                ).getFullYear();

            const endYear =
                new Date(
                    dataPoint.period_end
                ).getFullYear();

            if (
                startYear !== reportingYear ||
                endYear !== reportingYear
            ) {

                results.push({
                    ruleCode: "REPORTING_PERIOD_MATCH",
                    category: "PERIOD",
                    severity: "FAIL",
                    status: "FAILED",
                    message:
                        "Data point period does not match the disclosure reporting year.",
                    expected: reportingYear,
                    actual:
                        `${startYear}-${endYear}`
                });
            }
        }

        if (results.length === 0) {

            results.push({
                ruleCode: "REPORTING_PERIOD_MATCH",
                category: "PERIOD",
                severity: "PASS",
                status: "PASSED",
                message:
                    "All data point periods match the disclosure reporting year.",
                expected: reportingYear,
                actual: null
            });
        }

        return results;
    }

};