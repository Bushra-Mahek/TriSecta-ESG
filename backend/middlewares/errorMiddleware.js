export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const errorHandler = (err, req, res, next) => {

    console.error(err);

    // PostgreSQL unique constraint violation
    if (
        err.code === "23505" &&
        err.constraint === "unique_company_reporting_year"
    ) {
        return res.status(409).json({
            error: "A disclosure already exists for this company and reporting year"
        });
    }

    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        error: err.message || "Internal server error"
    });
};