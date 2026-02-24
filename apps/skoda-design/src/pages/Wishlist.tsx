import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";
import { apiProductToProduct } from "@/lib/products";
import { getProducts } from "@/lib/api";
import { useStore } from "@/lib/store";

const Wishlist = () => {
  const wishlist = useStore((s) => s.wishlist);
  const { data: apiProducts = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });
  const products = apiProducts.map(apiProductToProduct);
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <main className="pt-16">
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-12 lg:px-8">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground lg:text-4xl">Wishlist</h1>
          </div>
          <p className="mt-2 text-muted-foreground">
            {wishlistProducts.length > 0
              ? `${wishlistProducts.length} item${wishlistProducts.length > 1 ? "s" : ""} saved`
              : "Your wishlist is empty"}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 lg:px-8">
        {wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {wishlistProducts.map((product, i) => (
              <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-20 text-center">
            <Heart className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <h2 className="font-display text-xl font-semibold text-foreground">No items yet</h2>
            <p className="mt-2 text-muted-foreground">Browse our shop and save items you love.</p>
            <Link
              to="/shop"
              className="mt-6 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:scale-105 glow-green"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </main>
  );
};

export default Wishlist;
