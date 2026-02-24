const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const getToken = () => localStorage.getItem("admin_token");

export async function adminLogin(
  username: string,
  password: string
): Promise<{ success: boolean; token?: string; message?: string }> {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (data.token) localStorage.setItem("admin_token", data.token);
  return data;
}

export function adminLogout() {
  localStorage.removeItem("admin_token");
}

export function isAdminLoggedIn(): boolean {
  return !!getToken();
}

async function adminFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers as Record<string, string>),
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 401) {
    adminLogout();
    window.location.href = "/login";
    throw new Error("Session expired");
  }
  return res;
}

export interface AdminProduct {
  id: string;
  sku: string;
  name: string;
  shortDescription?: string | null;
  description: string | null;
  imageUrls: string[];
  price: string;
  stockQuantity: number;
  status: string;
  category: string | null;
  badge: string | null;
  specifications?: Record<string, string> | null;
  isFeatured?: boolean;
  collection?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const res = await adminFetch("/admin/products");
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function getAdminProduct(id: string): Promise<AdminProduct> {
  const res = await adminFetch(`/admin/products/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await adminFetch(`/admin/products/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete product");
}

export async function updateProduct(
  id: string,
  body: Partial<{
    name: string;
    shortDescription: string;
    description: string;
    category: string;
    badge: string;
    isFeatured: boolean;
    collection: string | null;
    specifications: Record<string, string>;
    imageUrls: string[];
    price: number;
    stockQuantity: number;
  }>
): Promise<AdminProduct> {
  const res = await adminFetch(`/admin/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
}

export async function createProduct(body: {
  sku: string;
  name: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  badge?: string;
  isFeatured?: boolean;
  collection?: string | null;
  specifications?: Record<string, string>;
  imageUrls?: string[];
  price: number;
  stockQuantity: number;
}): Promise<AdminProduct> {
  const res = await adminFetch("/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
}

export async function updateProductStock(
  id: string,
  dto: { stockQuantity?: number; status?: string }
): Promise<AdminProduct> {
  const res = await adminFetch(`/admin/products/${id}/stock`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error("Failed to update stock");
  return res.json();
}

export async function uploadFiles(files: File[]): Promise<{ urls: string[] }> {
  if (!files?.length) return { urls: [] };
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  // Do not set Content-Type: fetch will set multipart/form-data with boundary for FormData
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_BASE}/admin/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (res.status === 401) {
    adminLogout();
    window.location.href = "/login";
    throw new Error("Session expired");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || `Upload failed (${res.status})`);
  }
  return res.json();
}

export interface AdminOrder {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: string;
  paymentStatus: string;
  fulfilmentStatus?: string;
  createdAt: string;
  zohoSyncedAt?: string | null;
}

export async function getAdminOrders(
  paymentStatus?: string,
  fulfilmentStatus?: string
): Promise<AdminOrder[]> {
  const q = new URLSearchParams();
  if (paymentStatus) q.set("paymentStatus", paymentStatus);
  if (fulfilmentStatus) q.set("fulfilmentStatus", fulfilmentStatus);
  const query = q.toString();
  const res = await adminFetch(`/admin/orders${query ? `?${query}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export async function exportOrdersCsv(paymentStatus?: string): Promise<Blob> {
  const path = paymentStatus
    ? `/admin/orders/export?paymentStatus=${encodeURIComponent(paymentStatus)}`
    : "/admin/orders/export";
  const res = await adminFetch(path);
  return res.blob();
}

export async function syncOrderToZoho(orderId: string): Promise<unknown> {
  const res = await adminFetch(`/admin/orders/${encodeURIComponent(orderId)}/sync-zoho`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Sync failed");
  return res.json();
}

export async function getAdminBanner(): Promise<{ urls: string[] }> {
  const res = await adminFetch("/admin/settings/banner");
  if (!res.ok) throw new Error("Failed to fetch banner");
  return res.json();
}

export async function setAdminBanner(urls: string[]): Promise<{ urls: string[] }> {
  const res = await adminFetch("/admin/settings/banner", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls }),
  });
  if (!res.ok) throw new Error("Failed to set banner");
  return res.json();
}

export interface DashboardData {
  pending: number;
  successful: number;
  failed: number;
  productCount: number;
  totalRevenue: string;
  recentOrders: AdminOrder[];
}

export async function getAdminDashboard(): Promise<DashboardData> {
  const res = await adminFetch("/admin/dashboard");
  if (!res.ok) throw new Error("Failed to fetch dashboard");
  return res.json();
}

export async function getAdminCategories(): Promise<{ categories: string[] }> {
  const res = await adminFetch("/admin/settings/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function setAdminCategories(categories: string[]): Promise<{ categories: string[] }> {
  const res = await adminFetch("/admin/settings/categories", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ categories }),
  });
  if (!res.ok) throw new Error("Failed to set categories");
  return res.json();
}
