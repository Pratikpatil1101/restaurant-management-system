import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import { Button, Card, LoadingState, StatusBadge } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { adminApi, menuApi, orderApi, userApi, getApiErrorMessage } from "../services/api";
import { formatCurrency, formatDate } from "../utils-format";

function Dashboard() {
  const { role } = useAuth();
  const { itemCount } = useCart();
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [statsData, setStatsData] = useState({ waiters: [], kitchen: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({
    email: "",
    password: "",
    role: "waiter"
  });

  const isAdmin = role === "admin";
  const canUseCart = role === "admin" || role === "waiter";

  useEffect(() => {
    async function loadDashboard() {
      try {
        const requests = [menuApi.getAll(), orderApi.getAll()];

        if (isAdmin) {
          requests.push(adminApi.getStats());
        }

        const responses = await Promise.all(requests);
        const [menuResponse, orderResponse, statsResponse] = responses;

        setMenuItems(menuResponse.data.items || []);
        setOrders(orderResponse.data.orders || []);
        setStatsData(statsResponse?.data || { waiters: [], kitchen: [] });
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load dashboard"));
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [isAdmin]);

  const revenue = orders.reduce((sum, order) => sum + Number(order.finalAmount || 0), 0);
  const pending = orders.filter((order) => order.status === "Pending").length;
  const preparing = orders.filter((order) => order.status === "Preparing").length;
  const completed = orders.filter((order) => order.status === "Completed").length;

  const stats = [
    { label: "Menu Items", value: menuItems.length, helper: "Active dishes in the catalog" },
    { label: "Orders Today", value: orders.length, helper: `${pending} pending, ${preparing} preparing` },
    ...(canUseCart ? [{ label: "Cart Items", value: itemCount, helper: "Items currently staged for checkout" }] : []),
    ...(isAdmin ? [{ label: "Revenue", value: formatCurrency(revenue), helper: `${completed} completed orders` }] : [])
  ];

  const topWaiter = useMemo(() => statsData.waiters[0] || null, [statsData.waiters]);
  const topKitchen = useMemo(() => statsData.kitchen[0] || null, [statsData.kitchen]);

  async function handleCreateStaff(event) {
    event.preventDefault();
    setIsCreatingStaff(true);

    try {
      await userApi.createStaff(staffForm);
      toast.success("Staff user created successfully");
      setStaffForm({ email: "", password: "", role: "waiter" });
      const statsResponse = await adminApi.getStats();
      setStatsData(statsResponse.data || { waiters: [], kitchen: [] });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to create staff user"));
    } finally {
      setIsCreatingStaff(false);
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading dashboard insights..." />;
  }

  return (
    <div className="space-y-6">
      <section className={`grid gap-4 md:grid-cols-2 ${isAdmin ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className="mt-4 text-3xl font-semibold text-white">{stat.value}</p>
            <p className="mt-2 text-sm text-slate-500">{stat.helper}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xl font-semibold text-white">Recent Orders</p>
              <p className="mt-1 text-sm text-slate-400">Latest orders moving through the service pipeline.</p>
            </div>
            <Link to="/orders"><Button variant="secondary">Open Orders</Button></Link>
          </div>
          <div className="mt-6 space-y-4">
            {orders.slice(0, 5).map((order) => (
              <div key={order._id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Table {order.tableNumber}</p>
                    <p className="mt-1 text-lg font-semibold text-white">{isAdmin ? formatCurrency(order.finalAmount) : `${order.items.length} items`}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
            {orders.length === 0 ? <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-slate-400">No orders yet. Start from the menu and create the first order.</div> : null}
          </div>
        </Card>

        <Card>
          <p className="text-xl font-semibold text-white">Quick Actions</p>
          <p className="mt-1 text-sm text-slate-400">Jump between service tasks with a cleaner workflow.</p>
          <div className="mt-6 grid gap-4">
            <Link to="/menu" className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
              <p className="text-lg font-semibold text-white">Browse menu</p>
              <p className="mt-1 text-sm text-slate-400">See all dishes available in the system.</p>
            </Link>
            {canUseCart ? (
              <Link to="/cart" className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
                <p className="text-lg font-semibold text-white">Review cart</p>
                <p className="mt-1 text-sm text-slate-400">Set table number and place the order.</p>
              </Link>
            ) : null}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/20 to-transparent p-5">
              <p className="text-lg font-semibold text-white">Status mix</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusBadge status="Pending" />
                <StatusBadge status="Preparing" />
                <StatusBadge status="Completed" />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {isAdmin ? (
        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <p className="text-xl font-semibold text-white">Add Staff</p>
            <p className="mt-1 text-sm text-slate-400">Create waiter and kitchen accounts without leaving the admin dashboard.</p>
            <form className="mt-6 space-y-4" onSubmit={handleCreateStaff}>
              <label className="block text-sm text-slate-300">
                Email
                <input
                  type="email"
                  value={staffForm.email}
                  onChange={(event) => setStaffForm((current) => ({ ...current, email: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  placeholder="staff@restaurant.com"
                />
              </label>
              <label className="block text-sm text-slate-300">
                Password
                <input
                  type="password"
                  value={staffForm.password}
                  onChange={(event) => setStaffForm((current) => ({ ...current, password: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  placeholder="Enter password"
                />
              </label>
              <label className="block text-sm text-slate-300">
                Role
                <select
                  value={staffForm.role}
                  onChange={(event) => setStaffForm((current) => ({ ...current, role: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
                >
                  <option value="waiter">Waiter</option>
                  <option value="kitchen">Kitchen</option>
                </select>
              </label>
              <Button type="submit" className="w-full py-3" disabled={isCreatingStaff}>
                {isCreatingStaff ? "Creating staff..." : "Create Staff User"}
              </Button>
            </form>
          </Card>

          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xl font-semibold text-white">Staff Performance</p>
                <p className="mt-1 text-sm text-slate-400">Track waiter order volume and kitchen completions.</p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>Top Waiter: <span className="text-slate-200">{topWaiter ? topWaiter.email : "-"}</span></p>
                <p className="mt-1">Top Kitchen: <span className="text-slate-200">{topKitchen ? topKitchen.email : "-"}</span></p>
              </div>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300/80">Waiters</p>
                <div className="mt-4 space-y-3">
                  {statsData.waiters.length ? statsData.waiters.map((staff, index) => (
                    <div key={`${staff.email}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="font-semibold text-white">{staff.email}</p>
                      <p className="mt-1 text-sm text-slate-400">Orders created: {staff.orders}</p>
                    </div>
                  )) : <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-400">No waiter performance data yet.</p>}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300/80">Kitchen</p>
                <div className="mt-4 space-y-3">
                  {statsData.kitchen.length ? statsData.kitchen.map((staff, index) => (
                    <div key={`${staff.email}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="font-semibold text-white">{staff.email}</p>
                      <p className="mt-1 text-sm text-slate-400">Completed orders: {staff.completed}</p>
                    </div>
                  )) : <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-400">No kitchen performance data yet.</p>}
                </div>
              </div>
            </div>
          </Card>
        </section>
      ) : null}
    </div>
  );
}

export default Dashboard;
