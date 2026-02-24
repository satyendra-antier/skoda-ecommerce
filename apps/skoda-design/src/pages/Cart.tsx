import { Link } from "react-router-dom";
import { ShoppingBag, Minus, Plus, X, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useStore, getCartItemsWithProducts } from "@/lib/store";
import { getProducts } from "@/lib/api";
import { apiProductToProduct } from "@/lib/products";
import { formatINR } from "@/lib/format";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity } = useStore();
  const { data: apiProducts = [] } = useQuery({ queryKey: ["products"], queryFn: () => getProducts() });
  const products = apiProducts.map(apiProductToProduct);
  const cartItems = getCartItemsWithProducts(cart, products);
  const total = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <main className="pt-16">
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-12 lg:px-8">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground lg:text-4xl">Cart</h1>
          </div>
          <p className="mt-2 text-muted-foreground">
            {cartItems.length > 0
              ? `${itemCount} item${itemCount !== 1 ? "s" : ""} in your cart`
              : "Your cart is empty"}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 lg:px-8">
        {cartItems.length > 0 ? (
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 animate-fade-in sm:flex-row"
                >
                  <Link to={`/product/${product.id}`} className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-secondary sm:h-24 sm:w-24">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link to={`/product/${product.id}`} className="font-display text-sm font-semibold text-foreground hover:text-primary">
                          {product.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                      <button onClick={() => removeFromCart(product.id)} className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center text-muted-foreground hover:text-destructive" aria-label="Remove">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex min-h-[44px] items-center rounded-md border border-border">
                          <button onClick={() => updateQuantity(product.id, quantity - 1)} className="flex min-h-[44px] min-w-[44px] items-center justify-center px-2 py-1 text-muted-foreground hover:text-foreground disabled:opacity-50" disabled={quantity <= 1} aria-label="Decrease">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-medium text-foreground">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, Math.min(quantity + 1, product.stockQuantity ?? quantity + 1))}
                            className="flex min-h-[44px] min-w-[44px] items-center justify-center px-2 py-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
                            disabled={quantity >= (product.stockQuantity ?? 999)}
                            title={product.stockQuantity != null ? `Max ${product.stockQuantity}` : undefined}
                            aria-label="Increase"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        {(product.stockQuantity != null && product.stockQuantity > 0) && (
                          <span className="text-xs text-muted-foreground">Max {product.stockQuantity}</span>
                        )}
                      </div>
                      <span className="font-display text-sm font-bold text-foreground">{formatINR(product.price * quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="rounded-lg border border-border bg-card p-6 h-fit sticky top-24">
              <h3 className="font-display text-lg font-semibold text-foreground">Order Summary</h3>
              <div className="mt-4 space-y-3 border-b border-border pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatINR(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-primary">Free</span>
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <span className="font-display font-semibold text-foreground">Total</span>
                <span className="font-display text-lg font-bold text-foreground">{formatINR(total)}</span>
              </div>
              <Link
                to="/checkout"
                className="mt-6 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md bg-primary py-3 font-display text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] glow-green"
              >
                Checkout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-20 text-center">
            <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <h2 className="font-display text-xl font-semibold text-foreground">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground">Discover our amazing products and add them to your cart.</p>
            <Link
              to="/shop"
              className="mt-6 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:scale-105 glow-green"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </main>
  );
};

export default Cart;
