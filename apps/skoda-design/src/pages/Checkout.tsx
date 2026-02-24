import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useStore, getCartItemsWithProducts } from "@/lib/store";
import { createOrder, initPayment, getProducts } from "@/lib/api";
import { apiProductToProduct } from "@/lib/products";
import { formatINR } from "@/lib/format";

const pincodeRegex = /^[1-9][0-9]{5}$/;
const mobileRegex = /^[6-9][0-9]{9}$/;

type FormState = {
  customerName: string;
  mobile: string;
  email: string;
  shippingAddress: string;
  city: string;
  state: string;
  pincode: string;
};

const initial: FormState = {
  customerName: "",
  mobile: "",
  email: "",
  shippingAddress: "",
  city: "",
  state: "",
  pincode: "",
};

function validate(f: FormState): string | null {
  if (!f.customerName.trim()) return "Full name is required.";
  if (!f.mobile.trim()) return "Mobile number is required.";
  if (!mobileRegex.test(f.mobile.replace(/\s/g, ""))) return "Enter a valid 10-digit mobile number.";
  if (!f.email.trim()) return "Email is required.";
  if (!f.email.includes("@")) return "Enter a valid email.";
  if (!f.shippingAddress.trim()) return "Shipping address is required.";
  if (!f.city.trim()) return "City is required.";
  if (!f.state.trim()) return "State is required.";
  if (!f.pincode.trim()) return "Pincode is required.";
  if (!pincodeRegex.test(f.pincode.trim())) return "Enter a valid 6-digit pincode.";
  return null;
}

const Checkout = () => {
  const { cart, clearCart } = useStore();
  const { data: apiProducts = [] } = useQuery({ queryKey: ["products"], queryFn: () => getProducts() });
  const products = apiProducts.map(apiProductToProduct);
  const cartItems = getCartItemsWithProducts(cart, products);
  const total = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const [form, setForm] = useState<FormState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (cartItems.length === 0 && !loading) {
    return (
      <main className="pt-16">
        <div className="container mx-auto px-4 py-12 lg:px-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Checkout</h1>
          <p className="mt-2 text-muted-foreground">Your cart is empty.</p>
          <Link to="/shop" className="mt-4 inline-block text-sm text-primary">
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(form);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const payload = {
        customerName: form.customerName.trim(),
        mobile: form.mobile.replace(/\s/g, ""),
        email: form.email.trim(),
        shippingAddress: form.shippingAddress.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        items: cartItems.map(({ product, quantity }) => ({ productId: product.id, quantity })),
      };
      const order = await createOrder(payload);
      const { redirectUrl } = await initPayment(order.orderId);
      clearCart();
      window.location.href = redirectUrl;
    } catch (err: unknown) {
      let message = "Failed to place order. Try again.";
      if (err instanceof Error) message = err.message;
      if (err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string") {
        message = (err as { message: string }).message;
      }
      setError(message);
      setLoading(false);
    }
  };

  return (
    <main className="pt-16">
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8 lg:px-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Cart
          </Link>
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground">Checkout</h1>
          <p className="mt-2 text-muted-foreground">
            {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} · {formatINR(total)} total
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 lg:px-8">
        <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="customerName" className="mb-1 block text-sm font-medium text-foreground">
              Full name
            </label>
            <input
              id="customerName"
              type="text"
              value={form.customerName}
              onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
              className="w-full min-h-[44px] rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label htmlFor="mobile" className="mb-1 block text-sm font-medium text-foreground">
              Mobile
            </label>
            <input
              id="mobile"
              type="tel"
              value={form.mobile}
              onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
              className="w-full min-h-[44px] rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="10-digit mobile"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full min-h-[44px] rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label htmlFor="shippingAddress" className="mb-1 block text-sm font-medium text-foreground">
              Shipping address
            </label>
            <textarea
              id="shippingAddress"
              value={form.shippingAddress}
              onChange={(e) => setForm((f) => ({ ...f, shippingAddress: e.target.value }))}
              rows={3}
              className="w-full min-h-[44px] rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="city" className="mb-1 block text-sm font-medium text-foreground">
                City
              </label>
              <input
                id="city"
                type="text"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="w-full min-h-[44px] rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div>
              <label htmlFor="state" className="mb-1 block text-sm font-medium text-foreground">
                State
              </label>
              <input
                id="state"
                type="text"
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                className="w-full min-h-[44px] rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div>
              <label htmlFor="pincode" className="mb-1 block text-sm font-medium text-foreground">
                Pincode
              </label>
              <input
                id="pincode"
                type="text"
                value={form.pincode}
                onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
                className="w-full min-h-[44px] rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="6-digit"
                maxLength={6}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <Link
              to="/cart"
              className="flex min-h-[44px] items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary"
            >
              Back to Cart
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex min-h-[44px] flex-1 items-center justify-center rounded-md bg-primary py-3 font-display text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] glow-green disabled:opacity-50"
            >
              {loading ? "Placing order…" : "Place order & pay"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Checkout;
