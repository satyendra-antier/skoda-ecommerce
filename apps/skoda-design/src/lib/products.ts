import type { ApiProduct } from "./api";

/** Frontend product shape: from API or normalized for cart (price as number, image from imageUrls) */
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  badge?: string;
  isFeatured?: boolean;
  collection?: string | null;
  rating?: number;
  reviews?: number;
  imageUrls?: string[];
  /** From API: available quantity; used for stock indicator and cart caps */
  stockQuantity?: number;
  /** From API: "Active" | "OutOfStock" */
  status?: string;
}

export const categories = [
  "All",
  "Accessories",
  "Interior",
  "Exterior",
  "Lifestyle",
  "Technology",
];

/** Normalize API product to frontend Product (price as number, image from imageUrls) */
export function apiProductToProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    name: p.name,
    price: parseFloat(p.price) || 0,
    category: p.category || "Accessories",
    image: p.imageUrls?.[0] ?? "",
    description: p.description ?? undefined,
    badge: p.badge ?? undefined,
    isFeatured: p.isFeatured,
    collection: p.collection ?? undefined,
    imageUrls: p.imageUrls?.length ? p.imageUrls : undefined,
    stockQuantity: p.stockQuantity ?? 0,
    status: p.status,
  };
}

/** Whether product can be added to cart (in stock) */
export function isProductInStock(p: Product): boolean {
  return (p.stockQuantity ?? 0) > 0 && p.status !== "OutOfStock";
}
