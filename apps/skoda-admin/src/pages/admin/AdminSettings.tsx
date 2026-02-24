import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminBanner, setAdminBanner, uploadFiles, getAdminCategories, setAdminCategories } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Tag } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-banner"],
    queryFn: getAdminBanner,
  });
  const [urls, setUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (newUrls: string[]) => setAdminBanner(newUrls),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banner"] });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const res = await uploadFiles(Array.from(files));
      if (res.urls?.length) {
        const next = [...currentUrls, ...res.urls];
        setUrls(next);
        saveMutation.mutate(next);
        toast.success(`Uploaded ${res.urls.length} image(s).`);
      } else {
        toast.error("No images returned. Check API and MinIO.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const currentUrls = urls.length > 0 ? urls : (data?.urls ?? []);

  const removeBanner = (index: number) => {
    const next = currentUrls.filter((_, i) => i !== index);
    setUrls(next);
    saveMutation.mutate(next);
  };

  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getAdminCategories,
  });
  const categoriesList = categoriesData?.categories ?? [];
  const [newCategory, setNewCategory] = useState("");
  const categoriesMutation = useMutation({
    mutationFn: setAdminCategories,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-categories"] }),
  });
  const addCategory = () => {
    const t = newCategory.trim();
    if (!t || categoriesList.includes(t)) return;
    categoriesMutation.mutate([...categoriesList, t]);
    setNewCategory("");
  };
  const removeCategory = (index: number) => {
    categoriesMutation.mutate(categoriesList.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
      <p className="mt-1 text-muted-foreground">Banner images for the storefront home page carousel. Order reflects slide order.</p>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Home banner carousel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : (
            <>
              <div>
                <Label className="text-sm font-medium text-foreground">Upload images (multiple allowed)</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2 min-h-[44px] gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? "Uploading…" : "Choose file(s)"}
                </Button>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Select one or more images. They will be added to the carousel in order. If none are set, the storefront shows the default hero image.
                </p>
              </div>
              {currentUrls.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-foreground">Banner images ({currentUrls.length})</Label>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {currentUrls.map((url, i) => (
                      <div key={`${url}-${i}`} className="relative group">
                        <img src={url} alt={`Banner ${i + 1}`} className="h-28 w-40 rounded-lg border border-border object-cover shadow-sm" />
                        <button
                          type="button"
                          aria-label="Remove"
                          className="absolute right-1 top-1 rounded-full bg-destructive p-1.5 text-destructive-foreground opacity-90 hover:opacity-100 transition-opacity"
                          onClick={() => removeBanner(i)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Shop categories
          </CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Categories shown in the storefront shop filter. Order here is the display order.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {categoriesList.map((cat, i) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 rounded-md bg-secondary px-3 py-1.5 text-sm"
              >
                {cat}
                <button
                  type="button"
                  aria-label={`Remove ${cat}`}
                  className="rounded p-0.5 hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                  onClick={() => removeCategory(i)}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="New category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
              className="max-w-xs"
            />
            <Button type="button" variant="secondary" onClick={addCategory} disabled={!newCategory.trim() || categoriesMutation.isPending}>
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
