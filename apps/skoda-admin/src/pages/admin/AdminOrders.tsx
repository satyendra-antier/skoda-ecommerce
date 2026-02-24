import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminOrders, exportOrdersCsv, syncOrderToZoho, type AdminOrder } from "@/lib/admin-api";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminOrders() {
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [syncing, setSyncing] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders", paymentStatus],
    queryFn: () => getAdminOrders(paymentStatus || undefined, undefined),
  });

  const handleSync = async (orderId: string) => {
    setSyncing(orderId);
    try {
      await syncOrderToZoho(orderId);
    } finally {
      setSyncing(null);
    }
  };

  const handleExport = async () => {
  const blob = await exportOrdersCsv(paymentStatus || undefined);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "orders.csv";
  a.click();
  URL.revokeObjectURL(url);
};

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Orders</h1>
      <p className="mt-1 text-muted-foreground">View and export orders</p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Payment status</span>
          <Select value={paymentStatus || "all"} onValueChange={(v) => setPaymentStatus(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Successful">Successful</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={handleExport}>
            Export CSV
          </Button>
      </div>
      <div className="mt-8 overflow-x-auto rounded-lg border border-border">
        {isLoading ? (
          <p className="p-4 text-muted-foreground">Loading…</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o: AdminOrder) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-sm">{o.orderId}</TableCell>
                  <TableCell>{o.customerName}</TableCell>
                  <TableCell>{formatINR(Number(o.totalAmount))}</TableCell>
                  <TableCell>{o.paymentStatus}</TableCell>
                  <TableCell>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" disabled={!!syncing} onClick={() => handleSync(o.orderId)}>
                      {syncing === o.orderId ? "Syncing…" : "Sync Zoho"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
