
export const CATEGORIES = [
{ id: "leafy", label: "Mboga za majani", blurb: "Huchaguliwa asubuhi" },
{ id: "fruit", label: "Matunda", blurb: "Zilizoiva wiki hii" },
{ id: "roots", label: "Mizizi na vitunguu", blurb: "Mazao bora" },
{ id: "crates", label: "Vifurushi", blurb: "Vimeandaliwa kwa wiki" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export type Product = {
id: string;
name: string;
kicker: string;
description: string;
category: CategoryId;
image: string;
audio?: string | null;
collage?: string[];
unit: string;
price: number;
compareAt?: number;
origin: string;
featured?: boolean;
organic?: boolean;
contents?: string[];
};

export function getProduct(_id: string): Product | undefined {
return undefined;
}

export function productsIn(
_category?: string,
_query?: string,
): Product[] {
return [];
}

export const AREAS = [
"Ilemela",
"Nyamagana",
"Buzuruga",
"Pasiansi",
"Mkolani",
"Kirumba",
"Buhongwa",
"Mabatini",
"Igoma",
"Kishiri",
"Kisesa",
"Mwanza Mjini",
"Nje ya Mwanza",
] as const;

export const SLOTS = [
{ id: "morning", label: "Asubuhi", hint: "08:00 – 12:00" },
{ id: "afternoon", label: "Mchana", hint: "12:00 – 17:00" },
{ id: "evening", label: "Jioni", hint: "17:00 – 20:00" },
] as const;
