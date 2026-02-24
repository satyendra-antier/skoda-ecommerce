import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, XCircle } from "lucide-react";
import { getOrder } from "@/lib/api";
import { formatINR } from "@/lib/format";

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const status = searchParams.get("status") || "";

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId),
    enabled: !!orderId,
  });

  const isSuccess = status === "success";

  return (
    <main className="pt-16">
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 lg:px-8">
        {!orderId ? (
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">Order</h1>
            <p className="mt-2 text-muted-foreground">No order ID provided.</p>
            <Link to="/shop" className="mt-6 inline-block text-primary hover:underline">
              Continue shopping
            </Link>
          </div>
        ) : isLoading ? (
          <p className="text-muted-foreground">Loading order…</p>
        ) : error ? (
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">Order</h1>
            <p className="mt-2 text-muted-foreground">Could not load order details.</p>
            <Link to="/shop" className="mt-6 inline-block text-primary hover:underline">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="w-full max-w-md text-center">
            {isSuccess ? (
              <CheckCircle className="mx-auto h-16 w-16 text-primary" />
            ) : (
              <XCircle className="mx-auto h-16 w-16 text-destructive" />
            )}
            <h1 className="mt-6 font-display text-2xl font-bold text-foreground">
              {isSuccess ? "Order confirmed" : "Payment failed"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isSuccess
                ? "Thank you for your order. We will process it shortly."
                : "Your payment could not be completed. You can try again from your cart."}
            </p>
            {order && (
              <p className="mt-4 text-sm text-muted-foreground">
                Order ID: <span className="font-mono text-foreground">{order.orderId}</span>
                {order.totalAmount != null && (
                  <> · {formatINR(Number(order.totalAmount))}</>
                )}
              </p>
            )}
            <div className="mt-8 flex justify-center gap-4">
              <Link
                to="/shop"
                className="rounded-md border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Continue shopping
              </Link>
              {orderId && (
                <Link
                  to="/cart"
                  className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  View cart
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default OrderConfirmation;
