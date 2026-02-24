import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { getAdminProduct } from "@/lib/admin-api";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function AdminProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => getAdminProduct(id!),
    enabled: !!id,
  });

  if (!id) return <p className="text-destructive">Missing product ID</p>;
  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (error || !product) return <p className="text-destructive">Product not found</p>;

  const images = product.imageUrls?.length ? product.imageUrls : [];

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-bold text-foreground">{product.name}</h1>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          {images[0] ? (
            <img src={images[0]} alt={product.name} className="aspect-square w-full rounded-lg border border-border object-cover" />
          ) : (
            <div className="aspect-square w-full rounded-lg border border-border bg-muted" />
          )}
          {images.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {images.map((url, i) => (
                <img key={i} src={url} alt="" className="h-20 w-20 shrink-0 rounded border object-cover" />
              ))}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">SKU:</span> {product.sku}</p>
              <p><span className="text-muted-foreground">Category:</span> {product.category ?? "—"}</p>
              <p><span className="text-muted-foreground">Price:</span> {formatINR(Number(product.price))}</p>
              <p><span className="text-muted-foreground">Stock:</span> {product.stockQuantity}</p>
              <p><span className="text-muted-foreground">Status:</span> {product.status}</p>
            </CardContent>
          </Card>
          <Button asChild>
            <Link to={`/products/${id}/edit`}>Edit product</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
