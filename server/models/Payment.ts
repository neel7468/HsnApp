import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // ✅ IMPORTANT
    },
    orderId: { type: String, required: true },
    paymentId: String,
    signature: String,
    amount: { type: Number, required: true },
    planName: { type: String, required: true },
    status: {
      type: String,
      enum: ["CREATED", "SUCCESS", "FAILED"],
      default: "CREATED",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
