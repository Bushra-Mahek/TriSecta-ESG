import multer from "multer";
import { AppError } from "./errorMiddleware.js";

const storage = multer.memoryStorage();

const allowedTypes = [
    "application/pdf",
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];

const upload = multer({
    storage,

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new AppError(
                    "Only PDF, CSV, XLS and XLSX files are allowed",
                    400
                ),
                false
            );
        }
    }
});

export default upload;