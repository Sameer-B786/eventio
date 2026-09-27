import { NextResponse } from "next/server";
import { s3Client } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "@/lib/session";

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // We prefix the file with the user's ID to keep their files isolated
    const userId = session.userInfo.email;

    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Filename and contentType are required" }, { status: 400 });
    }

    // Generate a unique object key (file path in S3)
    // E.g. uploads/john@doe.com/123e4567-e89b-12d3-a456-426614174000-banner.jpg
    const extension = filename.split('.').pop();
    const uniqueFilename = `${uuidv4()}.${extension}`;
    const objectKey = `uploads/${encodeURIComponent(userId)}/${uniqueFilename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_PROOFS_BUCKET,
      Key: objectKey,
      ContentType: contentType,
      // If the bucket doesn't have public access blocked and allows ACLs, we could do ACL: "public-read".
      // But since ACLs are disabled, we will rely on bucket policies or just let them upload and read via standard URLs.
    });

    // Generate a pre-signed URL that expires in 60 seconds
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    return NextResponse.json({ 
      uploadUrl: signedUrl,
      // The public URL where the file will be accessible after upload
      fileUrl: `https://${process.env.S3_PROOFS_BUCKET}.s3.${process.env.COGNITO_REGION}.amazonaws.com/${objectKey}`
    });

  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
