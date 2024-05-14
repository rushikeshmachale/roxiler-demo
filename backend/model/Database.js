import mongoose from "mongoose";

const salesSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  price: { type: Number },
  sold: { type: Boolean },
  category: { type: String },
  dateOfSale: { type: String },
});

const Sales = mongoose.model("Sale",salesSchema);
export default Sales;