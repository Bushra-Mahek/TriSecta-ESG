import pkg from "pg";
import env from "dotenv";

const { Pool } = pkg;

env.config();

export const db = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "5432"),
});

db.on("connect", () => {
    console.log("Database connection pool initialized successfully");
});

db.on("error", (err) => {
    console.error("Unexpected error on idle database client", err);
    process.exit(-1);
});


export async function transaction(callback) {

    const client = await db.connect();

    try {

        await client.query("BEGIN");

        const result = await callback(client);

        await client.query("COMMIT");

        return result;

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();

    }
}