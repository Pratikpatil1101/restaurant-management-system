const Order = require("../models/Order");

const STATUS_FLOW = {
  Pending: ["Preparing"],
  Preparing: ["Completed"],
  Completed: []
};

function calculateTotals(items) {
  const totalAmount = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const tax = totalAmount * 0.18;
  const finalAmount = totalAmount + tax;

  return { totalAmount, tax, finalAmount };
}

exports.createOrder = async (req, res) => {
  try {
    const { tableNumber, items } = req.body;

    if (!tableNumber || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ msg: "Table number and items are required" });
    }

    const hasInvalidItem = items.some((item) => !item.name || !item.quantity || Number(item.quantity) <= 0 || item.price === undefined);
    if (hasInvalidItem) {
      return res.status(400).json({ msg: "Each order item must include name, quantity and price" });
    }

    const totals = calculateTotals(items);
    const order = await Order.create({
      tableNumber,
      items,
      ...totals,
      status: "Pending",
      createdBy: req.user?.role === "waiter" ? req.user.id : req.user?.id || null
    });
    //  SOCKET: emit new order
    const io = req.app.get("io");
    io.emit("newOrder", order);

    return res.status(201).json({ msg: "Order created successfully", order });
    } catch (error) {
    console.error("CREATE ORDER ERROR:", error.message);
    return res.status(500).json({ msg: "Error creating order" });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("createdBy", "email role")
      .populate("updatedBy", "email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ msg: "Orders fetched successfully", orders });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error.message);
    return res.status(500).json({ msg: "Error fetching orders" });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ msg: "Order status is required" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    const allowedNextStatuses = STATUS_FLOW[order.status] || [];
    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        msg: `Invalid status transition from ${order.status} to ${status}`
      });
    }

    order.status = status;
    if (req.user?.role === "kitchen") {
      order.updatedBy = req.user.id;
    } else if (req.user?.id) {
      order.updatedBy = req.user.id;
    }
    await order.save();
    await order.populate("updatedBy", "email role");
    // 🔥 SOCKET: emit updated order
    const io = req.app.get("io");
    io.emit("orderUpdated", order);
    return res.status(200).json({ msg: "Order updated successfully", order });
  } catch (error) {
    console.error("UPDATE ORDER ERROR:", error.message);
    return res.status(500).json({ msg: "Error updating order" });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);
    const io = req.app.get("io");
    io.emit("orderDeleted", id);
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    return res.status(200).json({ msg: "Order deleted successfully" });
  } catch (error) {
    console.error("DELETE ORDER ERROR:", error.message);
    return res.status(500).json({ msg: "Error deleting order" });
  }
};
