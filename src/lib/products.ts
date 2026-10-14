import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "./auth/middleware";

const productSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().min(5).max(3000),
  price: z.number().positive().finite(),
  unit: z.string().trim().min(1).max(50),
  category: z.string().trim().min(1).max(100),
  imagePath: z.string().trim().min(1).max(500),
  audioPath: z.string().trim().max(500).nullable().optional(),
  origin: z.string().trim().max(150).nullable().optional(),
});

export const saveSellerProduct = createServerFn({
  method: "POST",
})
  .inputValidator(productSchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Mipangilio ya Supabase haijakamilika.",
      );
    }

    const baseUrl = supabaseUrl.replace(/\/+$/, "");

    const response = await fetch(
      `${baseUrl}/rest/v1/products`,
      {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          seller_id: context.userId,
          name: data.name,
          description: data.description,
          price: data.price,
          unit: data.unit,
          category: data.category,
          image_url: data.imagePath,
          audio_url: data.audioPath || null,
          origin: data.origin || null,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        "Imeshindikana kuhifadhi bidhaa. Tafadhali jaribu tena.",
      );
    }

    const products = await response.json();

    if (!Array.isArray(products) || products.length === 0) {
      throw new Error(
        "Bidhaa haikurudishwa baada ya kuhifadhiwa.",
      );
    }

    return {
      success: true,
      product: products[0],
    };
  });
