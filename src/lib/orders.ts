import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "./db";
import { deliveryFeeFor } from "./money";
import { authMiddleware } from "./auth/middleware";

const checkoutSchema = z.object({
  lines: z
    .array(
      z.object({
        productId: z.string().uuid(),
        qty: z.number().int().positive().max(100),
      }),
    )
    .min(1)
    .max(100),
  fulfillment: z.enum(["delivery", "pickup"]),
  payment: z.enum(["mpesa", "cash"]),
  customer: z.object({
    name: z.string().trim().min(1).max(120),
    phone: z.string().trim().min(5).max(40),
    area: z.string().max(100).optional(),
    address: z.string().max(300).optional(),
    slot: z.string().max(40).optional(),
    notes: z.string().max(1000).optional(),
  }),
});

export type StoredOrderItem = {
  productId: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
  image: string;
};

export type StoredOrder = {
  id: string;
  placedAt: number;
  status: "packing" | "on-the-way" | "ready" | "delivered";
  items: StoredOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  fulfillment: "delivery" | "pickup";
  customer: {
    name: string;
    phone: string;
    area?: string;
    address?: string;
    slot?: string;
    notes?: string;
  };
  payment: "mpesa" | "cash";
};

type ProductRow = {
  id: string;
  name: string;
  price: number | string;
  unit: string;
  image_url: string | null;
};

function mapOrder(row: any, items: any[]): StoredOrder {
  return {
    id: row.id,
    placedAt: new Date(row.placed_at).getTime(),
    status: row.status,
    items: items.map((item) => ({
      productId: item.product_id,
      name: item.name,
      qty: Number(item.qty),
      unit: item.unit,
      price: Number(item.price),
      image: item.image ?? "",
    })),
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    fulfillment: row.fulfillment,
    customer: row.customer,
    payment: row.payment,
  };
}

async function getProductsFromSupabase(
  productIds: string[],
): Promise<ProductRow[]> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Mipangilio ya Supabase haijakamilika.");
  }

  const baseUrl = supabaseUrl.replace(/\/+$/, "");

  const params = new URLSearchParams({
    select: "id,name,price,unit,image_url",
    id: `in.(${productIds.join(",")})`,
  });

  const response = await fetch(
    `${baseUrl}/rest/v1/products?${params.toString()}`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Imeshindikana kupata bidhaa kutoka Supabase.");
  }

  const products = (await response.json()) as ProductRow[];

  return products.map((product) => {
    let image = product.image_url;

    if (image && !/^https?:\/\//i.test(image)) {
      const encodedPath = image
        .split("/")
        .map(encodeURIComponent)
        .join("/");

      image = `${baseUrl}/storage/v1/object/public/bidhaa/${encodedPath}`;
    }

    return {
      ...product,
      image_url: image,
    };
  });
}

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator(checkoutSchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const sql = await getSql();

    const productIds = [...new Set(data.lines.map((line) => line.productId))];
    const products = await getProductsFromSupabase(productIds);

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    const items: StoredOrderItem[] = data.lines.map((line) => {
      const product = productMap.get(line.productId);

      if (!product) {
        throw new Error(
          `Bidhaa haipatikani au haipo tena: ${line.productId}`,
        );
      }

      const price = Number(product.price);

      if (!Number.isFinite(price) || price <= 0) {
        throw new Error("Bei ya bidhaa si sahihi.");
      }

      return {
        productId: product.id,
        name: product.name,
        qty: line.qty,
        unit: product.unit,
        price,
        image: product.image_url ?? "",
      };
    });

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    );

    const deliveryFee = deliveryFeeFor(subtotal, data.fulfillment);
    const total = subtotal + deliveryFee;

    const id = `SOKO-${crypto.randomUUID()
      .slice(0, 8)
      .toUpperCase()}`;

    await sql.query(
      `insert into orders
        (id, user_id, subtotal, delivery_fee, total, fulfillment, payment, customer)
       values ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)`,
      [
        id,
        context.userId,
        subtotal,
        deliveryFee,
        total,
        data.fulfillment,
        data.payment,
        JSON.stringify(data.customer),
      ],
    );

    for (const item of items) {
      await sql.query(
        `insert into order_items
          (order_id, product_id, name, qty, unit, price, image)
         values ($1,$2,$3,$4,$5,$6,$7)`,
        [
          id,
          item.productId,
          item.name,
          item.qty,
          item.unit,
          item.price,
          item.image,
        ],
      );
    }

    const rows = await sql.query(
      `select * from orders where id = $1 and user_id = $2`,
      [id, context.userId],
    );

    if (!rows[0]) {
      throw new Error("Oda imehifadhiwa lakini haikuweza kusomwa.");
    }

    return mapOrder(rows[0], items);
  });

export const listOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();

    const rows = await sql.query(
      `select * from orders
       where user_id = $1
       order by placed_at desc`,
      [context.userId],
    );

    const result: StoredOrder[] = [];

    for (const row of rows) {
      const items = await sql.query(
        `select * from order_items
         where order_id = $1
         order by id`,
        [row.id],
      );

      result.push(mapOrder(row, items));
    }

    return result;
  });

export const getOrder = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string().min(1).max(80) }))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const sql = await getSql();

    const rows = await sql.query(
      `select * from orders
       where id = $1 and user_id = $2`,
      [data.id, context.userId],
    );

    if (!rows[0]) return null;

    const items = await sql.query(
      `select * from order_items
       where order_id = $1
       order by id`,
      [data.id],
    );

    return mapOrder(rows[0], items);
  });
