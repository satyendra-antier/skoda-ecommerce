import { useParams, Link } from "react-router-dom";
import { Heart, ShoppingBag, Star, ArrowLeft, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ImageZoom from "@/components/ImageZoom";
import { useStore } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import { apiProductToProduct, isProductInStock } from "@/lib/products";
import { getProduct, getProducts } from "@/lib/api";
import { formatINR } from "@/lib/format";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

  const { data: apiProduct, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id!),
    enabled: !!id,
  });

  const { data: apiProducts = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  if (isLoading || !id) {
    return (
      <main className="flex min-h-screen items-center justify-center pt-16">
        <div className="text-muted-foreground">Loading…</div>
      </main>
    );
  }

  if (error || !apiProduct) {
    return (
      <main className="flex min-h-screen items-center justify-center pt-16">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">Product not found</h1>
          <Link to="/shop" className="mt-4 inline-block text-sm text-primary">
            Back to Shop
          </Link>
        </div>
      </main>
    );
  }

  const product = apiProductToProduct(apiProduct);
  const images = product.imageUrls?.length ? product.imageUrls : [product.image].filter(Boolean);
  if (images.length === 0) images.push("");
  const wishlisted = isInWishlist(product.id);
  const inStock = isProductInStock(product);
  const maxQty = Math.max(0, product.stockQuantity ?? 0);
  const effectiveQty = inStock ? Math.min(qty, maxQty) : 0;
  const allProducts = apiProducts.map(apiProductToProduct);
  const related = allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <main className="pt-16">
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <Link to="/shop" className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>

        <div className="mt-6 grid gap-12 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="flex flex-col gap-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-secondary">
              <ImageZoom
                src={images[activeImage] || product.image}
                alt={product.name}
                className="h-full w-full"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`min-h-[44px] min-w-[72px] shrink-0 aspect-square w-20 overflow-hidden rounded-md border-2 transition-all ${
                      activeImage === i
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            {product.badge && (
              <span className="mb-3 inline-block w-fit rounded-sm bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
                {product.badge}
              </span>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {product.category}
              </span>
              {product.collection && (
                <span className="text-xs text-muted-foreground">Collection: {product.collection}</span>
              )}
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold text-foreground lg:text-4xl">{product.name}</h1>

            {(product.rating != null || product.reviews != null) && (
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(product.rating ?? 0) ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating ?? "—"} ({product.reviews ?? 0} reviews)
                </span>
              </div>
            )}

            <p className="mt-6 text-lg font-bold text-foreground font-display">{formatINR(product.price)}</p>

            <p className="mt-2">
              <span
                className={`inline-block rounded-md px-2.5 py-1 text-xs font-semibold uppercase ${
                  inStock ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                }`}
              >
                {inStock ? "Available" : "Out of Stock"}
              </span>
            </p>

            <p className="mt-4 leading-relaxed text-muted-foreground">{product.description}</p>

            {inStock && (
              <div className="mt-8 flex items-center gap-4">
                <span className="text-sm font-medium text-foreground">Quantity</span>
                <div className="flex items-center rounded-md border border-border">
                  <button
                    type="button"
                    onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                    className="px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium text-foreground">{effectiveQty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((prev) => Math.min(maxQty, prev + 1))}
                    className="px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {maxQty > 0 && (
                  <span className="text-xs text-muted-foreground">Max {maxQty}</span>
                )}
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                disabled={!inStock}
                onClick={() => addToCart(product, effectiveQty)}
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary py-3 font-display text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] glow-green disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <ShoppingBag className="h-4 w-4" />
                {inStock ? "Add to Cart" : "Out of Stock"}
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`flex items-center justify-center rounded-md border px-4 py-3 transition-colors ${
                  wishlisted ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Heart className={`h-5 w-5 ${wishlisted ? "fill-primary" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-8 font-display text-2xl font-bold text-foreground">You Might Also Like</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default ProductDetail;
