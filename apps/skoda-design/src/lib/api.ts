const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/** Public: get home banner image URLs (empty array = use default hero) */
export async function getBannerUrls(): Promise<{ urls: string[] }> {
  const res = await fetch(`${API_BASE}/settings/banner`);
  if (!res.ok) return { urls: [] };
  return res.json();
}

/** Public: get category list for shop filters (order = display order) */
export async function getCategories(): Promise<{ categories: string[] }> {
  const res = await fetch(`${API_BASE}/settings/categories`);
  if (!res.ok) return { categories: [] };
  return res.json();
}

export interface ApiProduct {
  id: string;
  sku: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  category: string | null;
  badge: string | null;
  isFeatured?: boolean;
  collection?: string | null;
  specifications: Record<string, string> | null;
  imageUrls: string[];
  price: string;
  stockQuantity: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  customerName: string;
  mobile: string;
  email: string;
  shippingAddress: string;
  city: string;
  state: string;
  pincode: string;
  items: CreateOrderItem[];
}

export interface OrderResponse {
  orderId: string;
  totalAmount: string;
  paymentStatus?: string;
  fulfilmentStatus?: string;
  customerName?: string;
  items?: Array< { productName: string; quantity: number } >;
}

export async function getProducts(status?: string): Promise<ApiProduct[]> {
  const url = status ? `${API_BASE}/products?status=${encodeURIComponent(status)}` : `${API_BASE}/products`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
  return res.json();
}

export async function getProduct(id: string): Promise<ApiProduct> {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('Product not found');
    throw new Error(`Failed to fetch product: ${res.status}`);
  }
  return res.json();
}

export async function createOrder(payload: CreateOrderPayload): Promise<OrderResponse> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create order: ${res.status}`);
  }
  return res.json();
}

export async function getOrder(orderId: string): Promise<OrderResponse> {
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('Order not found');
    throw new Error(`Failed to fetch order: ${res.status}`);
  }
  return res.json();
}

export async function initPayment(orderId: string): Promise<{ redirectUrl: string }> {
  const res = await fetch(`${API_BASE}/payment/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  });
  if (!res.ok) throw new Error('Failed to init payment');
  return res.json();
}
