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
  collage?: string[];
  unit: string;
  price: number;
  compareAt?: number;
  origin: string;
  featured?: boolean;
  organic?: boolean;
  contents?: string[];
};

    id: "potatoes",
    name: "Viazi",
    kicker: "Huandaliwa kwa oda",
    description:
      "Viazi bora vinavyofaa kuchemsha, kukaanga, kuoka au kutengeneza chipsi.",
    category: "roots",
    image: "/products/potatoes.svg",
    unit: "kilo",
    price: 1800,
    origin: "Mbeya",
  },
  {
    id: "passion-fruit",
    name: "Matunda ya passion",
    kicker: "Zimeiva tayari",
    description:
      "Matunda ya passion yaliyoiva, yenye harufu nzuri na ladha tamu yenye uchachu.",
    category: "fruit",
    image: "/products/passion-fruit.svg",
    unit: "kilo",
    price: 5000,
    origin: "Kagera",
    featured: true,
  },
  {
    id: "morning-crate",
    name: "Kifurushi cha Asubuhi",
    kicker: "Mchanganyiko wa familia",
    description:
      "Mchanganyiko wa mazao kwa matumizi ya familia, ukiwa na mboga, matunda, vitunguu, nyanya na viazi.",
    category: "crates",
    image: "/images/hero.svg",
    collage: ["sukuma-wiki", "tomatoes", "bananas", "avocados"],
    unit: "kifurushi",
    price: 25000,
    compareAt: 30000,
    origin: "Imeandaliwa Tanzania",
    featured: true,
    contents: [
      "Mafungu 2 ya sukuma wiki",
      "Kilo 1 ya nyanya",
      "Kilo 1 ya ndizi",
      "Parachichi 3",
      "Kilo 1 ya vitunguu",
      "Kilo 2 za viazi",
    ],
  },
  {
    id: "sweet-crate",
    name: "Kifurushi cha Matunda",
    kicker: "Matunda ya mezani",
    description:
      "Maembe, ndizi na matunda ya passion kwa ajili ya familia.",
    category: "crates",
    image: "/products/mangoes.svg",
    collage: ["mangoes", "bananas", "passion-fruit", "avocados"],
    unit: "kifurushi",
    price: 18000,
    origin: "Imeandaliwa Tanzania",
    contents: ["Kilo 1.5 za maembe", "Kilo 1 ya ndizi", "Gramu 500 za passion", "Parachichi 3"],
  },
  {
    id: "stew-crate",
    name: "Kifurushi cha Mchuzi",
    kicker: "Kwa mapishi ya kila siku",
    description:
      "Vitu muhimu kwa mapishi ya nyumbani: mboga, nyanya, vitunguu na viazi.",
    category: "crates",
    image: "/products/tomatoes.svg",
    collage: ["sukuma-wiki", "tomatoes", "red-onions", "potatoes"],
    unit: "kifurushi",
    price: 15000,
    origin: "Imeandaliwa Tanzania",
    contents: ["Mafungu 3 ya sukuma wiki", "2 kg tomatoes", "Kilo 1 ya vitunguu", "Kilo 3 za viazi"],
  },
];

export const PRODUCT_MAP = Object.fromEntries(PRODUCTS.map((p) => [p.id, p])) as Record<
  string,
  Product
>;

export function getProduct(id: string) {
  return PRODUCT_MAP[id];
}

export function productsIn(category?: string, query?: string) {
  const q = query?.trim().toLowerCase();
  return PRODUCTS.filter((p) => {
    if (category && category !== "all" && p.category !== category) return false;
    if (!q) return true;
    const hay = `${p.name} ${p.kicker} ${p.origin} ${p.description} ${p.contents?.join(" ") ?? ""}`.toLowerCase();
    return hay.includes(q);
  });
}

export const AREAS = [
  "Ilemela", "Nyamagana", "Buzuruga", "Pasiansi", "Mkolani", "Kirumba", "Buhongwa", "Mabatini", "Igoma", "Kishiri", "Kisesa", "Mwanza Mjini", "Nje ya Mwanza",
] as const;

export const SLOTS = [
  { id: "morning", label: "Asubuhi", hint: "08:00 – 12:00" },
  { id: "afternoon", label: "Mchana", hint: "12:00 – 17:00" },
  { id: "evening", label: "Jioni", hint: "17:00 – 20:00" },
] as const;
