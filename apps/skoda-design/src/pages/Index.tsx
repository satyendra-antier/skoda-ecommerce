import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Truck, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import heroImage from "@/assets/hero-car.jpg";
import ProductCard from "@/components/ProductCard";
import { apiProductToProduct } from "@/lib/products";
import { getProducts, getBannerUrls } from "@/lib/api";

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over ₹5,000" },
  { icon: Shield, title: "2-Year Warranty", desc: "On all products" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
];

const HERO_AUTO_ADVANCE_MS = 5000;

const Index = () => {
  const [heroIndex, setHeroIndex] = useState(0);

  const { data: bannerData } = useQuery({
    queryKey: ["banner"],
    queryFn: getBannerUrls,
  });
  const bannerUrls = bannerData?.urls ?? [];
  const useCarousel = bannerUrls.length > 0;

  useEffect(() => {
    if (!useCarousel || bannerUrls.length <= 1) return;
    const t = setInterval(() => {
      setHeroIndex((i) => (i + 1) % bannerUrls.length);
    }, HERO_AUTO_ADVANCE_MS);
    return () => clearInterval(t);
  }, [useCarousel, bannerUrls.length]);

  const { data: apiProducts = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });
  const products = apiProducts.map(apiProductToProduct);
  const featuredByFlag = products.filter((p) => p.isFeatured).slice(0, 4);
  const withBadge = products.filter((p) => p.badge).slice(0, 4);
  const featured =
    featuredByFlag.length >= 4
      ? featuredByFlag
      : featuredByFlag.length > 0
        ? [...featuredByFlag, ...products.filter((p) => !p.isFeatured)].slice(0, 4)
        : withBadge.length >= 4
          ? withBadge
          : [...withBadge, ...products.filter((p) => !p.badge)].slice(0, 4);

  return (
    <main>
      {/* Hero */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <div className="absolute inset-0">
          {useCarousel ? (
            <>
              {bannerUrls.map((url, i) => (
                <img
                  key={url}
                  src={url}
                  alt=""
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                    i === heroIndex ? "opacity-100 z-0" : "opacity-0 z-0"
                  }`}
                />
              ))}
              {bannerUrls.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setHeroIndex((i) => (i - 1 + bannerUrls.length) % bannerUrls.length)}
                    className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 transition-colors"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroIndex((i) => (i + 1) % bannerUrls.length)}
                    className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 transition-colors"
                    aria-label="Next"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                    {bannerUrls.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setHeroIndex(i)}
                        className={`h-2 w-2 rounded-full transition-colors ${
                          i === heroIndex ? "bg-white scale-110" : "bg-white/50"
                        }`}
                        aria-label={`Slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <img src={heroImage} alt="Škoda vehicle" className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="max-w-xl animate-fade-in-up">
            <span className="mb-4 inline-block rounded-sm bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              New Collection 2026
            </span>
            <h1 className="font-display text-5xl font-bold leading-tight text-foreground lg:text-7xl">
              Simply<br />
              <span className="text-gradient-green">Clever.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Premium accessories and lifestyle products crafted for Škoda enthusiasts.
              Elevate every journey.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-display text-sm font-semibold text-primary-foreground transition-all hover:scale-105 hover:shadow-lg glow-green"
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 font-display text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Explore
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="border-y border-border bg-card">
        <div className="container mx-auto grid grid-cols-1 divide-y divide-border px-4 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-8">
          {features.map((f) => (
            <div key={f.title} className="flex items-center gap-4 px-6 py-6">
              <f.icon className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-display text-sm font-semibold text-foreground">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-20 lg:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Curated for you</span>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground">Featured Products</h2>
          </div>
          <Link
            to="/shop"
            className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 md:flex"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product, i) => (
            <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Link to="/shop" className="text-sm font-medium text-primary">
            View All Products →
          </Link>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-secondary">
        <div className="container mx-auto flex flex-col items-center px-4 py-20 text-center lg:px-8">
          <h2 className="font-display text-3xl font-bold text-foreground lg:text-4xl">
            Drive Your <span className="text-gradient-green">Style</span>
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Join the Škoda community and get 10% off your first order plus exclusive access to limited editions.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-8 py-3 font-display text-sm font-semibold text-primary-foreground transition-all hover:scale-105 glow-green"
          >
            Start Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Index;
