import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Button, Card, EmptyState, LoadingState } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { menuApi, getApiErrorMessage } from "../services/api";
import { formatCurrency } from "../utils-format";

function Menu() {
  const { role } = useAuth();
  const { addItem } = useCart();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const canAddToCart = role === "admin" || role === "waiter";

  useEffect(() => {
    async function fetchMenu() {
      try {
        const response = await menuApi.getAll();
        setItems(response.data.items || []);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to fetch menu"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchMenu();
  }, []);

  const categories = useMemo(() => ["All", ...new Set(items.map((item) => item.category))], [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const value = `${item.name} ${item.category}`.toLowerCase();
      return matchesCategory && value.includes(query.toLowerCase());
    });
  }, [category, items, query]);

  if (isLoading) {
    return <LoadingState label="Loading menu..." />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xl font-semibold text-white">Explore Menu</p>
            <p className="mt-1 text-sm text-slate-400">Menu is visible to all roles. Ordering actions stay role-based.</p>
          </div>
          <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 md:w-72" placeholder="Search dish or category" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((entry) => (
            <Button key={entry} variant={category === entry ? "primary" : "secondary"} className="rounded-full" onClick={() => setCategory(entry)}>{entry}</Button>
          ))}
        </div>
      </Card>
      {filteredItems.length === 0 ? (
        <EmptyState title="No menu items found" description="Try another search or category." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item, index) => (
            <motion.div key={item._id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
              <Card className="h-full">
                <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/80">{item.category}</p>
                      <h3 className="mt-3 text-2xl font-semibold text-white">{item.name}</h3>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.available ? "bg-emerald-400/15 text-emerald-200" : "bg-rose-400/15 text-rose-200"}`}>{item.available ? "Available" : "Unavailable"}</span>
                  </div>
                  <div className="mt-8 flex flex-1 items-end justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Price</p>
                      <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(item.price)}</p>
                    </div>
                    {canAddToCart ? (
                      <Button disabled={!item.available} onClick={() => {
                        addItem(item);
                        toast.success(`${item.name} added to cart`);
                      }}>Add to cart</Button>
                    ) : (
                      <span className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">View only</span>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Menu;
