/** Format number as INR (Indian Rupees) with locale */
export function formatINR(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}
