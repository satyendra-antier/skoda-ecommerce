import { useState, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import ProductCard from "@/components/ProductCard";
import { apiProductToProduct } from "@/lib/products";
import { getProducts, getCategories } from "@/lib/api";

const sortOptions = ["Newest", "Price: Low", "Price: High"];
const ROW_HEIGHT = 380;
const COLS = 4;

const Shop = () => {
  const [searchParams] = useSearchParams();
  const searchQ = (searchParams.get("q") ?? "").trim().toLowerCase();
  const [activeCategory, setActiveCategory] = useState("All");
  const [sort, setSort] = useState("Newest");
  const parentRef = useRef<HTMLDivElement>(null);

  const { data: apiProducts = [], isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const categories = useMemo(
    () => ["All", ...(categoriesData?.categories ?? [])],
    [categoriesData?.categories],
  );

  const products = useMemo(() => apiProducts.map(apiProductToProduct), [apiProducts]);

  const filtered = useMemo(() => {
    let list = activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory);
    if (searchQ) list = list.filter((p) => p.name.toLowerCase().includes(searchQ));
    if (sort === "Price: Low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "Price: High") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, activeCategory, sort, searchQ]);

  const rowCount = Math.max(0, Math.ceil(filtered.length / COLS));
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 2,
  });

  if (error) {
    return (
      <main className="pt-16">
        <div className="container mx-auto px-4 py-12 lg:px-8">
          <p className="text-destructive">Failed to load products. Ensure the API is running.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-16">
      {/* Header */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-12 lg:px-8">
          <h1 className="font-display text-3xl font-bold text-foreground lg:text-4xl">Shop</h1>
          <p className="mt-2 text-muted-foreground">
            Explore our complete collection of Škoda accessories.
            {searchQ && (
              <span className="ml-2">Search: &quot;{searchParams.get("q")}&quot;</span>
            )}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`min-h-[44px] rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-surface-hover"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex min-h-[44px] items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="min-h-[44px] rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {sortOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="mb-6 text-sm text-muted-foreground">
          {isLoading ? "Loading…" : `${filtered.length} products`}
        </p>

        {filtered.length === 0 && !isLoading ? (
          <p className="py-12 text-center text-muted-foreground">No products match your filters or search.</p>
        ) : (
        <div
          ref={parentRef}
          className="overflow-auto min-h-[400px]"
          style={{ height: "calc(100vh - 280px)" }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const start = virtualRow.index * COLS;
              const rowProducts = filtered.slice(start, start + COLS);
              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 pb-6"
                >
                  {rowProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
        )}
      </div>
    </main>
  );
};

export default Shop;
