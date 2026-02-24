import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminProducts,
  createProduct,
  getAdminCategories,
  updateProductStock,
  deleteProduct,
  type AdminProduct,
} from "@/lib/admin-api";
import { Link } from "react-router-dom";
import { Plus, Pencil, Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({
    sku: "",
    name: "",
    shortDescription: "",
    description: "",
    category: "",
    badge: "",
    collection: "",
    isFeatured: false,
    price: "",
    stockQuantity: "0",
    imageUrls: [] as string[],
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [stockEdit, setStockEdit] = useState<{ id: string; qty: string } | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: getAdminProducts,
  });
  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getAdminCategories,
  });
  const categories = categoriesData?.categories ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      createProduct({
        sku: form.sku,
        name: form.name,
        shortDescription: form.shortDescription || undefined,
        description: form.description || undefined,
        category: form.category || undefined,
        badge: form.badge || undefined,
        collection: form.collection || null,
        isFeatured: form.isFeatured,
        price: Number(form.price) || 0,
        stockQuantity: Number(form.stockQuantity) || 0,
        imageUrls: form.imageUrls?.length ? form.imageUrls : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setShowForm(false);
      setForm({ sku: "", name: "", shortDescription: "", description: "", category: "", badge: "", collection: "", isFeatured: false, price: "", stockQuantity: "0", imageUrls: [] });
      toast.success("Product created");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create product");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setDeleteId(null);
      toast.success("Product deleted");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete product");
      setDeleteId(null);
    },
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) => updateProductStock(id, { stockQuantity: qty }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setStockEdit(null);
      toast.success("Stock updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update stock");
      setStockEdit(null);
    },
  });

  const paginated = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Products</h1>
      <p className="mt-1 text-muted-foreground">Manage catalog</p>
      <div className="mt-6 flex flex-wrap gap-4">
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add product
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>New product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} className="mt-1" placeholder="e.g. ACC-001" />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="mt-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category || "__none__"} onValueChange={(v) => setForm((f) => ({ ...f, category: v === "__none__" ? "" : v }))}>
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
              <Label>Short description</Label>
              <Input value={form.shortDescription} onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))} className="mt-1" placeholder="Optional" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label>Badge</Label>
              <Input value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))} className="mt-1" placeholder="e.g. Best Seller" />
            </div>
            <div className="space-y-2">
              <Label>Collection</Label>
              <Input value={form.collection} onChange={(e) => setForm((f) => ({ ...f, collection: e.target.value }))} className="mt-1" placeholder="Optional — e.g. Summer 2025" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="feat-new" checked={form.isFeatured} onCheckedChange={(c) => setForm((f) => ({ ...f, isFeatured: !!c }))} />
              <Label htmlFor="feat-new">Featured</Label>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Price</Label>
                <Input type="number" min={0} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="mt-1" />
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input type="number" min={0} value={form.stockQuantity} onChange={(e) => setForm((f) => ({ ...f, stockQuantity: e.target.value }))} className="mt-1" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.sku || !form.name}>
                {createMutation.isPending ? "Creating…" : "Create"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 overflow-x-auto rounded-lg border border-border">
        {isLoading ? (
          <p className="p-4 text-muted-foreground">Loading…</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.sku}</TableCell>
                  <TableCell>{formatINR(Number(p.price))}</TableCell>
                  <TableCell>
                    {stockEdit?.id === p.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min={0}
                          className="w-20"
                          value={stockEdit.qty}
                          onChange={(e) => setStockEdit((s) => (s ? { ...s, qty: e.target.value } : null))}
                        />
                        <Button size="sm" onClick={() => stockMutation.mutate({ id: p.id, qty: Number(stockEdit.qty) || 0 })}>
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setStockEdit(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => setStockEdit({ id: p.id, qty: String(p.stockQuantity) })}>
                        {p.stockQuantity}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/products/${p.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/products/${p.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(p.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
