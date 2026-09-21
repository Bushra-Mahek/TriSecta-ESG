import { dashboardModel } from "../models/dashboardModel.js";

export const dashboardService = {

    async getDashboard(user) {

        let companyId = null;

        if (user.role === "COMPANY_USER") {
            companyId = user.company_id;
        }

        const summary =
            await dashboardModel.getDisclosureSummary(companyId);

        const recentDisclosures =
            await dashboardModel.getRecentDisclosures(companyId);

        const certificates =
            await dashboardModel.getRecentCertificates(companyId);

        return {
            summary: {
                total: Number(summary.total),
                draft: Number(summary.draft),
                underReview: Number(summary.under_review),
                verified: Number(summary.verified),
                rejected: Number(summary.rejected)
            },

            recentDisclosures,

            certificates
        };
    }

};