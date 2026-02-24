import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Shield, Loader2, AlertCircle } from "lucide-react";
import { adminLogin, isAdminLoggedIn } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAdminLoggedIn()) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await adminLogin(username, password);
      if (res.success) navigate("/dashboard", { replace: true });
      else setError(res.message || "Invalid credentials");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left: Brand panel — hidden on small screens */}
      <div className="relative hidden lg:flex lg:flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/80 text-primary-foreground p-10 xl:p-14">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.08)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.08)_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black_40%,transparent_100%)] pointer-events-none" aria-hidden />
        <div className="relative">
          <span className="font-display text-2xl font-bold tracking-tight">SKODA</span>
          <p className="mt-1 text-sm text-primary-foreground/80">Admin portal</p>
        </div>
        <div className="relative space-y-4">
          <div className="flex items-center gap-3 text-primary-foreground/90">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/15">
              <Shield className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium">Secure access to your store backend</p>
          </div>
          <p className="max-w-sm text-sm text-primary-foreground/70">
            Manage products, orders, and settings from one place.
          </p>
        </div>
      </div>

      {/* Right: Form panel */}
      <div className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:px-10 xl:px-16">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden text-center">
            <span className="font-display text-xl font-bold text-foreground">SKODA</span>
            <span className="ml-2 text-muted-foreground">Admin</span>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Sign in</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your admin credentials to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-11 pl-10"
                    placeholder="admin"
                    autoComplete="username"
                    autoFocus
                    required
                    aria-invalid={!!error}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pl-10"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    aria-invalid={!!error}
                  />
                </div>
              </div>

              {error && (
                <div
                  className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                  role="alert"
                >
                  <span className="shrink-0 rounded-full bg-destructive/20 p-0.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                  </span>
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="h-11 w-full font-medium"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Authorized personnel only. Credentials are set in the server environment.
          </p>
        </div>
      </div>
    </div>
  );
}
