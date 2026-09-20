import s3 from "../config/s3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const s3Service = {

    async uploadBuffer(buffer, key, contentType) {

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: contentType
        });

        await s3.send(command);

        return key;
    }
};