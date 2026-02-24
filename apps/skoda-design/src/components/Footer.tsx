import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container mx-auto px-4 py-16 lg:px-8">
      <div className="grid gap-12 md:grid-cols-4">
        {/* Brand */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary">
              <span className="text-sm font-bold text-primary-foreground">Š</span>
            </div>
            <span className="font-display text-lg font-bold tracking-wide text-foreground">ŠKODA</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Simply Clever. Premium accessories and lifestyle products for your Škoda.
          </p>
        </div>

        {/* Shop */}
        <div>
          <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-foreground">Shop</h4>
          <ul className="space-y-3">
            {["Accessories", "Interior", "Exterior", "Lifestyle", "Technology"].map((item) => (
              <li key={item}>
                <Link to="/shop" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-foreground">Support</h4>
          <ul className="space-y-3">
            {["Contact Us", "Shipping Info", "Returns", "FAQ", "Track Order"].map((item) => (
              <li key={item}>
                <span className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-primary">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-foreground">
            Stay Updated
          </h4>
          <p className="mb-4 text-sm text-muted-foreground">Get the latest arrivals and exclusive offers.</p>
          <div className="flex overflow-hidden rounded-md border border-border">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button className="bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-border pt-8 text-center text-xs text-muted-foreground">
        © 2026 ŠKODA Auto. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
