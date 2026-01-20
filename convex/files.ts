"use node";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v } from "convex/values";
import { internal as generatedInternal } from "./_generated/api";
import { action } from "./_generated/server";
import { env } from "./env";

const internal = generatedInternal as any;

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replaceAll(/[^a-z0-9._-]+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

function makePublicUrl(key: string): string {
  const base = env.R2_PUBLIC_BASE_URL().replaceAll(/\/+$/g, "");
  return `${base}/${key}`;
}

export const generateUploadUrl = action({
  args: {
    kind: v.union(v.literal("avatar"), v.literal("cover"), v.literal("photo")),
    fileName: v.string(),
    contentType: v.string(),
  },
  handler: async (ctx, args) => {
    const viewer = await ctx.runMutation(internal.users.ensureViewer, {});
    const viewerId = viewer.id as string;

    const client = new S3Client({
      region: "auto",
      endpoint: env.R2_ENDPOINT(),
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID(),
        secretAccessKey: env.R2_SECRET_ACCESS_KEY(),
      },
    });

    const safeName = sanitizeFileName(args.fileName);
    const key = `users/${viewerId}/${args.kind}/${Date.now()}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET(),
      Key: key,
      ContentType: args.contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 });

    return {
      key,
      uploadUrl,
      publicUrl: makePublicUrl(key),
    };
  },
});
