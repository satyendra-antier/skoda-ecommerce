import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Sliders, LogOut, Menu, X, Sun, Moon } from "lucide-react";
import { adminLogout, isAdminLoggedIn } from "@/lib/admin-api";
import { useTheme } from "@/hooks/useTheme";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isLogin = location.pathname === "/login";
  const isLoggedIn = isAdminLoggedIn();

  if (!isLogin && !isLoggedIn) {
    navigate("/login", { replace: true });
    return null;
  }

  if (isLogin) {
    return <Outlet />;
  }

  const handleLogout = () => {
    adminLogout();
    navigate("/login", { replace: true });
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    "flex min-h-[44px] items-center gap-2 text-sm font-medium " +
    (isActive ? "text-primary" : "text-muted-foreground hover:text-foreground");

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-4 md:gap-8">
            <NavLink to="/" className="font-display text-lg font-bold text-foreground shrink-0">
              SKODA Admin
            </NavLink>
            <nav className="hidden gap-6 md:flex">
              <NavLink to="/dashboard" className={navLinkClass}>
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </NavLink>
              <NavLink to="/products" className={navLinkClass}>
                <Package className="h-4 w-4" />
                Products
              </NavLink>
              <NavLink to="/orders" className={navLinkClass}>
                <ShoppingCart className="h-4 w-4" />
                Orders
              </NavLink>
              <NavLink to="/settings" className={navLinkClass}>
                <Sliders className="h-4 w-4" />
                Settings
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 text-sm font-medium text-destructive hover:underline md:min-w-0"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center text-muted-foreground hover:text-foreground md:hidden"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="border-t border-border bg-card px-4 py-4 md:hidden">
            <NavLink to="/dashboard" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink to="/products" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <Package className="h-4 w-4" />
              Products
            </NavLink>
            <NavLink to="/orders" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <ShoppingCart className="h-4 w-4" />
              Orders
            </NavLink>
            <NavLink to="/settings" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <Sliders className="h-4 w-4" />
              Settings
            </NavLink>
          </nav>
        )}
      </header>
      <main className="container mx-auto px-4 py-8 lg:px-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
