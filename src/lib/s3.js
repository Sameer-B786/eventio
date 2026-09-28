import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: process.env.COGNITO_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.EVENTIO_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.EVENTIO_AWS_SECRET_ACCESS_KEY,
  },
});
