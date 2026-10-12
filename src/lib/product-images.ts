import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "./auth/middleware";

const imageSchema = z.object({
  fileName: z.string().min(1).max(150),
  contentType: z.enum([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]),
  base64: z.string().min(1).max(7_100_000),
});

export const uploadSellerProductImage = createServerFn({
  method: "POST",
})
  .inputValidator(imageSchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Mipangilio ya hifadhi ya picha haijakamilika.");
    }

    const cleanName = data.fileName
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(-100);

    const filePath =
      `${context.userId}/${crypto.randomUUID()}-${cleanName}`;

    const binary = atob(data.base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    if (bytes.length > 5 * 1024 * 1024) {
      throw new Error("Picha isizidi MB 5.");
    }

    const baseUrl = supabaseUrl.replace(/\/+$/, "");
    const encodedPath = filePath
      .split("/")
      .map(encodeURIComponent)
      .join("/");

    const uploadResponse = await fetch(
      `${baseUrl}/storage/v1/object/bidhaa/${encodedPath}`,
      {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": data.contentType,
          "x-upsert": "false",
        },
        body: bytes,
      },
    );

    if (!uploadResponse.ok) {
      throw new Error("Imeshindikana kuhifadhi picha. Jaribu tena.");
    }

    const signedResponse = await fetch(
      `${baseUrl}/storage/v1/object/sign/bidhaa/${encodedPath}`,
      {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expiresIn: 604800 }),
      },
    );

    if (!signedResponse.ok) {
      throw new Error("Picha imehifadhiwa, lakini kiungo chake hakijapatikana.");
    }

    const result = await signedResponse.json();

    return {
      path: filePath,
      imageUrl: `${baseUrl}/storage/v1${result.signedURL}`,
    };
  });
