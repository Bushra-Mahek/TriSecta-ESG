import { db } from "../config/db.js";

export const blockchainTransactionModel = {

    async create(
        disclosureId,
        transactionHash,
        blockNumber,
        gasUsed,
        transactionStatus,
        client = db
    ) {
        const result = await client.query(
            `INSERT INTO blockchain_transactions
            (
                disclosure_id,
                transaction_hash,
                block_number,
                gas_used,
                transaction_status
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                disclosureId,
                transactionHash,
                blockNumber,
                gasUsed,
                transactionStatus
            ]
        );

        return result.rows[0];
    },


    async getByDisclosure(
        disclosureId
    ) {
        const result = await db.query(
            `SELECT *
             FROM blockchain_transactions
             WHERE disclosure_id = $1
             ORDER BY created_at DESC`,
            [disclosureId]
        );

        return result.rows;
    }

};