import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminProduct, updateProduct, uploadFiles } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAdminCategories } from "@/lib/admin-api";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AdminProductEdit() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: product, isLoading } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => getAdminProduct(id!),
    enabled: !!id,
  });
  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getAdminCategories,
  });
  const categories = categoriesData?.categories ?? [];

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [badge, setBadge] = useState("");
  const [collection, setCollection] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description ?? "");
      setCategory(product.category ?? "");
      setBadge(product.badge ?? "");
      setCollection(product.collection ?? "");
      setIsFeatured(!!product.isFeatured);
      setPrice(String(product.price));
      setStockQuantity(String(product.stockQuantity));
      setImageUrls(product.imageUrls ?? []);
    }
  }, [product]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateProduct(id!, {
        name,
        description: description || undefined,
        category: category || undefined,
        badge: badge || undefined,
        collection: collection || null,
        isFeatured,
        price: Number(price) || 0,
        stockQuantity: Number(stockQuantity) || 0,
        imageUrls,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-product", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update product");
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    try {
      const res = await uploadFiles(Array.from(files));
      if (res.urls?.length) {
        setImageUrls((prev) => [...prev, ...res.urls]);
        toast.success(`Uploaded ${res.urls.length} image(s).`);
      } else {
        toast.error("No images returned. Check API and MinIO.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
    e.target.value = "";
  };

  if (!id) return <p className="text-destructive">Missing product ID</p>;
  if (isLoading || !product) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={"/products/" + id}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-bold text-foreground">Edit product</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <textarea
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category || "__none__"} onValueChange={(v) => setCategory(v === "__none__" ? "" : v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.length === 0 ? (
                  <SelectItem value="__none__">No categories — add in Settings</SelectItem>
                ) : (
                  <>
                    <SelectItem value="__none__">—</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Badge</Label>
            <Input value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="e.g. Best Seller" className="mt-1" />
          </div>
          <div className="space-y-2">
            <Label>Collection</Label>
            <Input value={collection} onChange={(e) => setCollection(e.target.value)} placeholder="Optional — e.g. Summer 2025" className="mt-1" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="feat" checked={isFeatured} onCheckedChange={(c) => setIsFeatured(!!c)} />
            <Label htmlFor="feat">Featured</Label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Price</Label>
              <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1" />
            </div>
            <div className="space-y-2">
              <Label>Stock</Label>
              <Input type="number" min={0} value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Images</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt="" className="h-20 w-20 rounded border object-cover" />
                  <button
                    type="button"
                    className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                    onClick={() => setImageUrls((prev) => prev.filter((_, j) => j !== i))}
                  >
                    x
                  </button>
                </div>
              ))}
              <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded border border-dashed border-muted-foreground text-muted-foreground hover:bg-muted">
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                +
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" asChild>
              <Link to={"/products/" + id}>Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
