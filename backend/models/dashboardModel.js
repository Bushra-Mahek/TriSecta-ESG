import { db } from "../config/db.js";

export const dashboardModel = {

    async getDisclosureSummary(companyId = null) {

        const result = await db.query(
            `
            SELECT
                COUNT(*) AS total,

                COUNT(*) FILTER (
                    WHERE status = 'DRAFT'
                ) AS draft,

                COUNT(*) FILTER (
                    WHERE status = 'UNDER_REVIEW'
                ) AS under_review,

                COUNT(*) FILTER (
                    WHERE status = 'VERIFIED'
                ) AS verified,

                COUNT(*) FILTER (
                    WHERE status = 'REJECTED'
                ) AS rejected

            FROM disclosures

            WHERE (
                $1::uuid IS NULL
                OR company_id = $1
            )
            `,
            [companyId]
        );

        return result.rows[0];
    },


    async getRecentDisclosures(companyId = null) {

        const result = await db.query(
            `
            SELECT
                d.id,
                d.company_id,
                d.reporting_year,
                d.status,
                d.created_at,
                c.company_name AS company_name

            FROM disclosures d

            JOIN companies c
                ON c.id = d.company_id

            WHERE (
                $1::uuid IS NULL
                OR d.company_id = $1
            )

            ORDER BY d.created_at DESC

            LIMIT 10
            `,
            [companyId]
        );

        return result.rows;
    },


    async getRecentCertificates(companyId = null) {

        const result = await db.query(
            `
            SELECT
                cert.id,
                cert.disclosure_id,
                cert.certificate_number,
                cert.certificate_url,
                cert.certificate_hash,
                cert.generated_at

            FROM certificates cert

            JOIN disclosures d
                ON d.id = cert.disclosure_id

            WHERE (
                $1::uuid IS NULL
                OR d.company_id = $1
            )

            ORDER BY cert.generated_at DESC

            LIMIT 10
            `,
            [companyId]
        );

        return result.rows;
    }

};