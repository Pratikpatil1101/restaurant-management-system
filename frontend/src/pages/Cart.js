import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { Button, Card, EmptyState, QuantityControl } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { orderApi, getApiErrorMessage } from "../services/api";
import { formatCurrency } from "../utils-format";

function Cart() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { items, subtotal, tax, total, removeItem, updateQuantity, clearCart } = useCart();
  const [tableNumber, setTableNumber] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canPlaceOrder = role === "admin" || role === "waiter";

  async function handlePlaceOrder() {
    if (!items.length) {
      toast.error("Add items to the cart first");
      return;
    }

    if (!tableNumber || Number(tableNumber) <= 0) {
      toast.error("Enter a valid table number");
      return;
    }

    setIsSubmitting(true);
    try {
      await orderApi.create({
        tableNumber: Number(tableNumber),
        items: items.map((item) => ({ name: item.name, quantity: item.quantity, price: item.price }))
      });
      clearCart();
      toast.success("Order placed successfully");
      navigate("/orders");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to place order"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!items.length) {
    return <EmptyState title="Your cart is empty" description="Add menu items and come back here to place an order." action={<Button onClick={() => navigate("/menu")}>Browse menu</Button>} />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xl font-semibold text-white">Cart Summary</p>
            <p className="mt-1 text-sm text-slate-400">Update quantities and review line items.</p>
          </div>
          <Button variant="secondary" onClick={clearCart}>Clear cart</Button>
        </div>
        <div className="mt-6 space-y-4">
          {items.map((item, index) => (
            <motion.div key={item._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }} className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.category}</p>
                  <p className="mt-2 text-sm text-slate-500">{formatCurrency(item.price)} each</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <QuantityControl quantity={item.quantity} onDecrease={() => updateQuantity(item._id, item.quantity - 1)} onIncrease={() => updateQuantity(item._id, item.quantity + 1)} />
                  <div className="min-w-28 text-right">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Line total</p>
                    <p className="mt-1 font-semibold text-white">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                  <Button variant="secondary" onClick={() => {
                    removeItem(item._id);
                    toast.success(`${item.name} removed from cart`);
                  }}>Remove</Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
      <Card>
        <p className="text-xl font-semibold text-white">Place Order</p>
        <p className="mt-1 text-sm text-slate-400">This page sends the cart directly to your backend order API.</p>
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
          <label className="block text-sm text-slate-300">
            Table Number
            <input type="number" min="1" value={tableNumber} onChange={(event) => setTableNumber(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none" />
          </label>
        </div>
        <div className="mt-6 space-y-3 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between text-sm text-slate-400"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="flex items-center justify-between text-sm text-slate-400"><span>GST (18%)</span><span>{formatCurrency(tax)}</span></div>
          <div className="flex items-center justify-between border-t border-white/10 pt-3 text-base font-semibold text-white"><span>Total</span><span>{formatCurrency(total)}</span></div>
        </div>
        {!canPlaceOrder ? <div className="mt-5 rounded-3xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">Only admin and waiter users can create orders. Current role: {role || "unknown"}.</div> : null}
        <Button className="mt-6 w-full py-3" disabled={!canPlaceOrder || isSubmitting} onClick={handlePlaceOrder}>{isSubmitting ? "Placing order..." : "Place order"}</Button>
      </Card>
    </div>
  );
}

export default Cart;
