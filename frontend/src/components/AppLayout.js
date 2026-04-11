import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils-format";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard", roles: ["admin", "waiter", "kitchen"] },
  { to: "/menu", label: "Menu", roles: ["admin", "waiter", "kitchen"] },
  { to: "/cart", label: "Cart", roles: ["admin", "waiter"] },
  { to: "/orders", label: "Orders", roles: ["admin", "waiter", "kitchen"] }
];

function NavLinks({ onNavigate }) {
  const location = useLocation();
  const { itemCount } = useCart();
  const { role } = useAuth();

  const links = NAV_LINKS.filter((link) => link.roles.includes(role));

  return (
    <div className="flex flex-col gap-3">
      {links.map((link) => {
        const active = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            onClick={onNavigate}
            className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${active ? "bg-cyan-400 text-slate-950" : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"}`}
          >
            <span>{link.label}</span>
            {link.label === "Cart" && itemCount > 0 ? <span className="rounded-full bg-slate-950/15 px-2 py-1 text-xs">{itemCount}</span> : null}
          </Link>
        );
      })}
    </div>
  );
}

function Sidebar({ mobile = false, onNavigate }) {
  const navigate = useNavigate();
  const { role, logout } = useAuth();

  return (
    <aside className={`${mobile ? "w-full" : "hidden lg:flex lg:w-72"} glass-panel h-[calc(100vh-2rem)] flex-col rounded-[32px] p-6`}>
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Smart Restaurant</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">Smart Restaurant</h2>
      <p className="mt-2 text-sm text-slate-400">Modern control center for menu, cart, and order management.</p>
      <div className="mt-10 flex-1">
        <NavLinks onNavigate={onNavigate} />
      </div>
      <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-300">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Role</p>
        <p className="mt-2 font-semibold capitalize text-white">{role || "user"}</p>
      </div>
      <button
        onClick={() => {
          logout();
          navigate("/");
        }}
        className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
      >
        Logout
      </button>
    </aside>
  );
}

function AppLayout({ children }) {
  const [open, setOpen] = useState(false);
  const { itemCount, total } = useCart();
  const { role } = useAuth();
  const location = useLocation();
  const canUseCart = ["admin", "waiter"].includes(role);

  const titles = {
    "/dashboard": ["Restaurant Dashboard", "Live view of service, sales, and order activity."],
    "/menu": ["Menu Library", "Browse dishes and add them to the cart."],
    "/cart": ["Cart & Checkout", "Review the cart and place a table order."],
    "/orders": ["Order Control", "Track order history and update statuses."]
  };

  const [title, subtitle] = titles[location.pathname] || titles["/dashboard"];

  return (
    <div className="min-h-screen bg-app px-4 py-4 text-slate-100 md:px-6 lg:px-7">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-8%] h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-8%] h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl" />
      </div>
      <div className="relative mx-auto flex max-w-[1600px] gap-4">
        <Sidebar />
        <main className="min-h-[calc(100vh-2rem)] flex-1">
          <div className="glass-panel sticky top-4 z-30 mb-6 flex items-center justify-between gap-4 rounded-[28px] px-4 py-4 md:px-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setOpen(true)} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 lg:hidden">Menu</button>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-xs text-slate-400 md:text-sm">{subtitle}</p>
              </div>
            </div>
            {canUseCart ? (
              <Link to="/cart" className="inline-flex items-center gap-3 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                <span>{itemCount} items</span>
                <span className="hidden rounded-full bg-slate-950/10 px-2 py-1 text-xs md:inline-flex">{formatCurrency(total)}</span>
              </Link>
            ) : null}
          </div>
          {children}
        </main>
      </div>
      {open ? (
        <div className="fixed inset-0 z-40 bg-slate-950/75 p-4 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)}>
          <div className="h-full max-w-sm" onClick={(event) => event.stopPropagation()}>
            <Sidebar mobile onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AppLayout;
