import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import socket from "../socket";
import { Button, Card, EmptyState, LoadingState, Modal, StatusBadge } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { orderApi, getApiErrorMessage } from "../services/api";
import { formatCurrency, formatDate } from "../utils-format";

const STATUSES = ["Pending", "Preparing", "Completed"];

function Orders() {
  const { role } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchOrders = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const response = await orderApi.getAll();
      setOrders(response.data.orders || []);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load orders"));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

 useEffect(() => {
  // initial load
  fetchOrders(true);

  //  NEW ORDER
  socket.on("newOrder", (order) => {
    setOrders((prev) => [order, ...prev]);
  });

  // ORDER UPDATED
  socket.on("orderUpdated", (updatedOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
    );
  });

  //  ORDER DELETED
  socket.on("orderDeleted", (id) => {
    setOrders((prev) => prev.filter((o) => o._id !== id));
  });

  // cleanup
  return () => {
    socket.off("newOrder");
    socket.off("orderUpdated");
    socket.off("orderDeleted");
  };
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => orders.filter((order) => filter === "All" || order.status === filter), [filter, orders]);
  const canUpdate = role === "admin" || role === "kitchen";
  const canDelete = role === "admin";

  async function handleStatusUpdate(id, status) {
    try {
      await orderApi.update(id, { status });
      setOrders((current) => current.map((order) => order._id === id ? { ...order, status } : order));
      toast.success(`Order moved to ${status}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update order"));
    }
  }

  async function handleDeleteOrder() {
    if (!deleteTarget) {
      return;
    }

    try {
      await orderApi.remove(deleteTarget._id);
      setOrders((current) => current.filter((order) => order._id !== deleteTarget._id));
      setDeleteTarget(null);
      toast.success("Order deleted successfully");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to delete order"));
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading order history..." />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xl font-semibold text-white">Order History</p>
            <p className="mt-1 text-sm text-slate-400">Track and update every order lifecycle.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", ...STATUSES].map((status) => (
              <Button key={status} variant={filter === status ? "primary" : "secondary"} className="rounded-full" onClick={() => setFilter(status)}>{status}</Button>
            ))}
            <Button variant="secondary" disabled={isRefreshing} onClick={() => fetchOrders(false)}>{isRefreshing ? "Refreshing..." : "Refresh"}</Button>
          </div>
        </div>
      </Card>
      {filteredOrders.length === 0 ? (
        <EmptyState title="No orders in this view" description="Try another status filter or place a new order from the cart page." />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.25em] text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Table</th>
                  <th className="px-5 py-4 font-medium">Items</th>
                  <th className="px-5 py-4 font-medium">Amount</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Placed</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredOrders.map((order, index) => (
                  <motion.tr key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="align-top hover:bg-white/[0.03]">
                    <td className="px-5 py-5"><p className="font-semibold text-white">#{order.tableNumber}</p></td>
                    <td className="px-5 py-5"><div className="space-y-1 text-sm text-slate-300">{order.items.map((item, itemIndex) => <p key={`${order._id}-${itemIndex}`}>{item.name} x {item.quantity}</p>)}</div></td>
                    <td className="px-5 py-5"><p className="font-semibold text-white">{formatCurrency(order.finalAmount)}</p><p className="mt-1 text-xs text-slate-500">GST included</p></td>
                    <td className="px-5 py-5"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-5 text-sm text-slate-400">{formatDate(order.createdAt)}</td>
                    <td className="px-5 py-5">
                      <div className="flex flex-wrap gap-2">
                        {canUpdate ? STATUSES.filter((status) => status !== order.status).map((status) => <Button key={status} variant="secondary" className="rounded-xl px-3 py-2 text-xs" onClick={() => handleStatusUpdate(order._id, status)}>{status}</Button>) : null}
                        {canDelete ? <Button variant="danger" className="rounded-xl px-3 py-2 text-xs" onClick={() => setDeleteTarget(order)}>Delete</Button> : null}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <Modal isOpen={Boolean(deleteTarget)} title="Delete order" onClose={() => setDeleteTarget(null)} footer={<><Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant="danger" onClick={handleDeleteOrder}>Delete</Button></>}>
        <p className="text-sm text-slate-300">Remove the order for table {deleteTarget?.tableNumber}? This sends a DELETE request to the backend and cannot be undone from the UI.</p>
      </Modal>
    </div>
  );
}

export default Orders;
