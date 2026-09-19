export const electricityProvider = {

    async verify({
        companyId,
        periodStart,
        periodEnd,
        metric
    }) {

        // MOCK EXTERNAL SOURCE
        // Represents an independent utility/API response.
        // Replace this provider with a real API in production.

        const mockExternalData = {
            value: 12300,
            unit: "kWh",
            sourceType: "MOCK_UTILITY_API",
            sourceReference:
                `UTILITY-${companyId}-${periodStart}-${periodEnd}`
        };

        return mockExternalData;
    }

};