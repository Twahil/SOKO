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
  throw new Error("Mipangilio ya Supabase haijakamilika.");
}

const baseUrl = supabaseUrl.replace(/\/+$/, "");

const response = await fetch(`${baseUrl}/rest/v1/products`, {
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
});

if (!response.ok) {
  throw new Error(
    "Imeshindikana kuhifadhi bidhaa. Tafadhali jaribu tena.",
  );
}

const products = await response.json();

if (!Array.isArray(products) || products.length === 0) {
  throw new Error("Bidhaa haikurudishwa baada ya kuhifadhiwa.");
}

return { success: true, product: products[0] };

});

export const getPublishedProducts = createServerFn({
method: "GET",
}).handler(async () => {
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
throw new Error("Mipangilio ya Supabase haijakamilika.");
}

const baseUrl = supabaseUrl.replace(//+$/, "");

const response = await fetch(
"${baseUrl}/rest/v1/products?select=id,name,description,price,unit,category,image_url,audio_url,origin,created_at&order=created_at.desc",
{
headers: {
apikey: supabaseKey,
Authorization: "Bearer ${supabaseKey}",
},
},
);

if (!response.ok) {
throw new Error("Imeshindikana kusoma bidhaa kutoka Supabase.");
}

const products = await response.json();

const getPublicUrl = (bucket: string, path: string | null) => {
if (!path) return null;

if (/^https?:\/\//i.test(path)) return path;

const encodedPath = path
  .split("/")
  .map(encodeURIComponent)
  .join("/");

return `${baseUrl}/storage/v1/object/public/${bucket}/${encodedPath}`;

};

const getAudioSignedUrl = async (path: string | null) => {
if (!path) return null;

// Kiungo cha zamani au URL kamili iendelee kutumika.
if (/^https?:\/\//i.test(path)) return path;

const encodedPath = path
  .split("/")
  .map(encodeURIComponent)
  .join("/");

const signedResponse = await fetch(
  `${baseUrl}/storage/v1/object/sign/product-audio/${encodedPath}`,
  {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expiresIn: 3600 }),
  },
);

if (!signedResponse.ok) return null;

const result = await signedResponse.json();

if (!result.signedURL) return null;

return `${baseUrl}/storage/v1${result.signedURL}`;

};

return Promise.all(
products.map(async (product: {
id: string;
name: string;
description: string;
price: number;
unit: string;
category: string;
image_url: string | null;
audio_url: string | null;
origin: string | null;
created_at: string;
}) => ({
...product,
image_url: getPublicUrl("bidhaa", product.image_url),
audio_url: await getAudioSignedUrl(product.audio_url),
})),
);
});
