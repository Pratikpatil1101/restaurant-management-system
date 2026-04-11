const Menu = require("../models/Menu");

const DEFAULT_MENU_ITEMS = [
  { name: "Margherita Pizza", category: "Pizza", price: 299, available: true },
  { name: "Veg Burger Deluxe", category: "Burger", price: 189, available: true },
  { name: "White Sauce Pasta", category: "Pasta", price: 249, available: true },
  { name: "Paneer Chilly", category: "Starters", price: 279, available: true },
  { name: "Cold Coffee", category: "Beverages", price: 129, available: true }
];

async function ensureDefaultMenuItems() {
  const count = await Menu.countDocuments();

  if (count === 0) {
    await Menu.insertMany(DEFAULT_MENU_ITEMS);
  }
}

exports.addItem = async (req, res) => {
  try {
    const { name, category, price, available } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ msg: "Name, category and price are required" });
    }

    const item = await Menu.create({
      name,
      category,
      price,
      available
    });

    return res.status(201).json({
      msg: "Menu item added successfully",
      item
    });
  } catch (err) {
    console.error("ADD ITEM ERROR:", err.message);
    return res.status(500).json({ msg: err.message });
  }
};

exports.getItems = async (req, res) => {
  try {
    await ensureDefaultMenuItems();
    const items = await Menu.find().sort({ createdAt: 1 });

    return res.status(200).json({
      msg: "Menu fetched successfully",
      items
    });
  } catch (err) {
    console.error("GET ITEMS ERROR:", err.message);
    return res.status(500).json({ msg: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Menu.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ msg: "Item not found" });
    }

    return res.status(200).json({
      msg: "Menu item updated",
      item
    });
  } catch (err) {
    console.error("UPDATE ITEM ERROR:", err.message);
    return res.status(500).json({ msg: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Menu.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({ msg: "Item not found" });
    }

    return res.status(200).json({
      msg: "Menu item deleted"
    });
  } catch (err) {
    console.error("DELETE ITEM ERROR:", err.message);
    return res.status(500).json({ msg: err.message });
  }
};
