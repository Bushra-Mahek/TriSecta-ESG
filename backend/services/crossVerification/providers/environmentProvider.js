export const environmentProvider = {

    async verify({
        companyId,
        periodStart,
        periodEnd,
        metric
    }) {

        // MOCK EXTERNAL ENVIRONMENTAL SOURCE
        // Represents an independent environmental
        // monitoring / regulatory API.

        const mockExternalData = {
            value: 4200,
            unit: "tCO2e",
            sourceType: "MOCK_ENVIRONMENT_API",
            sourceReference:
                `ENV-${companyId}-${periodStart}-${periodEnd}`
        };

        return mockExternalData;
    }

};