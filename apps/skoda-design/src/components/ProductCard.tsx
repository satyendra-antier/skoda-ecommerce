import { Heart, ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "@/lib/products";
import { isProductInStock } from "@/lib/products";
import { useStore } from "@/lib/store";
import { formatINR } from "@/lib/format";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const wishlisted = isInWishlist(product.id);
  const inStock = isProductInStock(product);

  return (
    <div className="group product-card-hover rounded-lg border border-border bg-card overflow-hidden">
      {/* Image */}
      <Link to={`/product/${product.id}`} className="relative block aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.badge && (
          <span
            className="absolute left-3 top-3 rounded-sm bg-primary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground"
            title="Admin-set label (e.g. Best Seller, New)"
          >
            {product.badge}
          </span>
        )}
        {/* Stock status */}
        <span
          className={`absolute right-3 top-3 rounded-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
            inStock
              ? "bg-primary/90 text-primary-foreground"
              : "bg-destructive/90 text-destructive-foreground"
          }`}
        >
          {inStock ? "Available" : "Out of Stock"}
        </span>

        {/* Hover overlay - only show Add to Cart when in stock */}
        {inStock && (
          <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-background/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pb-4">
            <button
              onClick={(e) => {
                e.preventDefault();
                addToCart(product);
              }}
              className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
            >
              <ShoppingBag className="h-4 w-4" />
              Add to Cart
            </button>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {product.category}
            {product.collection && (
              <span className="ml-1.5 text-[10px] normal-case opacity-90"> · {product.collection}</span>
            )}
          </span>
          <button
            onClick={() => toggleWishlist(product.id)}
            className="transition-colors"
          >
            <Heart
              className={`h-4 w-4 ${wishlisted ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary"}`}
            />
          </button>
        </div>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-display text-sm font-semibold text-foreground transition-colors hover:text-primary">
            {product.name}
          </h3>
        </Link>
        {(product.rating != null || product.reviews != null) && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-primary text-primary" />
              <span className="text-xs text-muted-foreground">{product.rating ?? "—"}</span>
            </div>
            <span className="text-xs text-muted-foreground">({product.reviews ?? 0})</span>
          </div>
        )}
        <p className="mt-2 font-display text-base font-bold text-foreground">{formatINR(product.price)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
