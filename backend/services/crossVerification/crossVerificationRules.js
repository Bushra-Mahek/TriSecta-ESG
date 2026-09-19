export const crossVerificationRules = {

    getTolerance(metric) {

        // Percentage tolerance.
        // External measurements will never be
        // expected to match a reported value perfectly.

        if (
            metric.category === "ENVIRONMENTAL"
        ) {
            return 0.05; // 5%
        }

        return 0.05;
    },


    compare(
        companyValue,
        externalValue,
        tolerance
    ) {

        if (
            externalValue === null ||
            externalValue === undefined
        ) {
            return {
                status: "UNVERIFIED",
                difference: null,
                message:
                    "Independent source did not provide a value."
            };
        }

        const company =
            Number(companyValue);

        const external =
            Number(externalValue);

        if (
            !Number.isFinite(company) ||
            !Number.isFinite(external)
        ) {
            return {
                status: "FAILED",
                difference: null,
                message:
                    "Unable to compare company and external values."
            };
        }

        const difference =
            Math.abs(company - external);

        const allowedDifference =
            Math.abs(external * tolerance);

        if (
            difference <= allowedDifference
        ) {

            return {
                status: "VERIFIED",
                difference,
                message:
                    "Company-reported value is within the accepted tolerance of the independent source."
            };

        }

        return {
            status: "MISMATCH",
            difference,
            message:
                "Company-reported value differs from the independent source beyond the accepted tolerance."
        };
    }

};