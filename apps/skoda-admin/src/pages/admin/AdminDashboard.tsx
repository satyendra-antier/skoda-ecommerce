import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "@/lib/admin-api";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, TrendingUp, XCircle, Sliders } from "lucide-react";
import { formatINR } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
  });

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (error) return <p className="text-destructive">Failed to load dashboard.</p>;
  if (!data) return null;

  const cards = [
    { label: "Pending orders", value: data.pending, icon: ShoppingCart, color: "border-t-amber-500", link: "/orders?paymentStatus=Pending" },
    { label: "Successful", value: data.successful, icon: TrendingUp, color: "border-t-primary", link: "/orders?paymentStatus=Successful" },
    { label: "Failed", value: data.failed, icon: XCircle, color: "border-t-destructive", link: "/orders?paymentStatus=Failed" },
    { label: "Products", value: data.productCount, icon: Package, color: "border-t-primary/70", link: "/products" },
  ];

  const revenue = Number(data.totalRevenue) || 0;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Order and catalog overview</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.link} to={c.link}>
            <Card className={`border-t-4 ${c.color} transition-colors hover:bg-muted/50`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
                <c.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="font-display text-2xl font-bold text-foreground">{c.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Total revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-display text-2xl font-bold text-foreground">{formatINR(revenue)}</p>
        </CardContent>
      </Card>
      {data.recentOrders?.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-semibold text-foreground">Recent orders</h2>
          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-3 text-left font-medium">Order ID</th>
                  <th className="p-3 text-left font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.slice(0, 10).map((o: { orderId: string; totalAmount?: string }) => (
                  <tr key={o.orderId} className="border-b border-border">
                    <td className="p-3">
                      <Link to={`/orders`} className="text-primary hover:underline">
                        {o.orderId}
                      </Link>
                    </td>
                    <td className="p-3">{o.totalAmount != null ? formatINR(Number(o.totalAmount)) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="mt-8 flex flex-wrap gap-4">
        <Button asChild>
          <Link to="/products">Manage products</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/orders">View orders</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/settings">
            <Sliders className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>
    </div>
  );
}
