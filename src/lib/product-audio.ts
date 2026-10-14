import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "./auth/middleware";

const allowedAudioTypes = [
  "audio/mpeg",
  "audio/mp4",
  "audio/webm",
  "audio/ogg",
  "audio/wav",
  "audio/x-m4a",
  "audio/aac",
  "audio/3gpp",
  "audio/webm;codecs=opus",
  "audio/mp4;codecs=mp4a.40.2",
] as const;

const audioSchema = z.object({
  fileName: z.string().min(1).max(150),
  contentType: z.string().refine(
    (type) =>
      (allowedAudioTypes as readonly string[]).includes(type),
    "Aina hii ya sauti haikubaliki.",
  ),
  base64: z.string().min(1).max(14_000_000),
});

export const uploadSellerProductAudio = createServerFn({
  method: "POST",
})
  .inputValidator(audioSchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Mipangilio ya kuhifadhi sauti haijakamilika.",
      );
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

    if (bytes.length > 10 * 1024 * 1024) {
      throw new Error("Sauti isizidi MB 10.");
    }

    const baseUrl = supabaseUrl.replace(/\/+$/, "");
    const encodedPath = filePath
      .split("/")
      .map(encodeURIComponent)
      .join("/");

    const uploadResponse = await fetch(
      `${baseUrl}/storage/v1/object/product-audio/${encodedPath}`,
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
      throw new Error(
        "Imeshindikana kuhifadhi sauti. Jaribu tena.",
      );
    }

    const signedResponse = await fetch(
      `${baseUrl}/storage/v1/object/sign/product-audio/${encodedPath}`,
      {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expiresIn: 604800,
        }),
      },
    );

    if (!signedResponse.ok) {
      throw new Error(
        "Sauti imehifadhiwa, lakini kiungo chake hakijapatikana.",
      );
    }

    const result = await signedResponse.json();

    return {
      path: filePath,
      audioUrl: `${baseUrl}/storage/v1${result.signedURL}`,
    };
  });
