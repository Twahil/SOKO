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

export const PRODUCTS: Product[] = [
  {
    id: "sukuma-wiki",
    name: "Sukuma wiki",
    kicker: "Mboga za majani",
    description:
      "Mboga safi zilizochaguliwa asubuhi. Zinafaa kwa kupikwa pamoja na nyanya na vitunguu.",
    category: "leafy",
    image: "/products/sukuma-wiki.jpg",
    unit: "fungu",
    price: 1000,
    compareAt: 1500,
    origin: "Mwanza",
    featured: true,
    organic: true,
  },
  {
    id: "bananas",
    name: "Ndizi tamu",
    kicker: "Ndizi za Tanzania",
    description:
      "Ndizi tamu zilizoiva vizuri, tayari kuliwa au kutumika kwenye uji.",
    category: "fruit",
    image: "/products/bananas.jpg",
    unit: "kilo",
    price: 50000,
    origin: "Kagera",
    featured: true,
  },
  {
    id: "avocados",
    name: "Parachichi",
    kicker: "Pakiti ya 3",
    description:
      "Parachichi laini na tamu, yanafaa kwa kachumbari, saladi au kula moja kwa moja.",
    category: "fruit",
    image: "/products/avocados.jpg",
    unit: "pakiti ya 3",
    price: 3000,
    origin: "Njombe",
    featured: true,
    organic: true,
  },
  {
    id: "tomatoes",
    name: "Nyanya safi",
    kicker: "Saladi na mchuzi",
    description:
      "Nyanya safi zenye ladha nzuri kwa kachumbari, mchuzi na mapishi ya kila siku.",
    category: "fruit",
    image: "/products/tomatoes.jpg",
    unit: "kilo",
    price: 50000,
    origin: "Arusha",
    featured: true,
  },
  {
    id: "mangoes",
    name: "Maembe",
    kicker: "Msimu mzuri",
    description:
      "Maembe matamu yaliyoiva vizuri, yanafaa kuliwa moja kwa moja au kutengeneza juisi.",
    category: "fruit",
    image: "/products/mangoes.jpg",
    unit: "kilo",
    price: 3000,
    compareAt: 4000,
    origin: "Tanga",
    featured: true,
  },
  {
    id: "red-onions",
    name: "Vitunguu maji",
    kicker: "Vitunguu vya Tanzania",
    description:
      "Vitunguu vyenye ladha nzuri kwa mchuzi, kachumbari na mapishi ya kila siku.",
    category: "roots",
    image: "/products/red-onions.jpg",
    unit: "kilo",
    price: 2000,
    origin: "Manyara",
  },
  {
    id: "potatoes",
    name: "Viazi",
    kicker: "Huandaliwa kwa oda",
    description:
      "Viazi bora vinavyofaa kuchemsha, kukaanga, kuoka au kutengeneza chipsi.",
    category: "roots",
    image: "/products/potatoes.jpg",
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
    image: "/products/passion-fruit.jpg",
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
    image: "/images/hero.jpg",
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
    image: "/products/mangoes.jpg",
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
    image: "/products/tomatoes.jpg",
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
