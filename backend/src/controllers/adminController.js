const mongoose = require("mongoose");
const Order = require("../models/Order");

exports.getAdminStats = async (req, res) => {
  try {
    const waiters = await Order.aggregate([
      { $match: { createdBy: { $ne: null } } },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "waiter"
        }
      },
      { $unwind: "$waiter" },
      { $match: { "waiter.role": "waiter" } },
      {
        $group: {
          _id: "$createdBy",
          email: { $first: "$waiter.email" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { orders: -1, email: 1 } },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          email: 1,
          orders: 1
        }
      }
    ]);

    const kitchen = await Order.aggregate([
      { $match: { status: "Completed", updatedBy: { $ne: null } } },
      {
        $lookup: {
          from: "users",
          localField: "updatedBy",
          foreignField: "_id",
          as: "kitchenUser"
        }
      },
      { $unwind: "$kitchenUser" },
      { $match: { "kitchenUser.role": "kitchen" } },
      {
        $group: {
          _id: "$updatedBy",
          email: { $first: "$kitchenUser.email" },
          completed: { $sum: 1 }
        }
      },
      { $sort: { completed: -1, email: 1 } },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          email: 1,
          completed: 1
        }
      }
    ]);

    return res.status(200).json({
      waiters,
      kitchen
    });
  } catch (error) {
    console.error("ADMIN STATS ERROR:", error.message);
    return res.status(500).json({ msg: "Error fetching admin stats" });
  }
};
